// @ts-nocheck
import { factories } from '@strapi/strapi';

const idOf = (value: any) => {
  if (!value) return undefined;
  if (typeof value === 'object') return value.documentId || value.id;
  return value;
};
const money = (value: unknown) => Number(value || 0);

export default factories.createCoreController('api::team-player.team-player', ({ strapi }) => ({
  async publicFind(ctx) {
    const { tournamentSlug, team } = ctx.query;
    const filters: any = {};

    if (tournamentSlug) {
      const tournaments = await strapi.documents('api::tournament.tournament').findMany({
        filters: { slug: tournamentSlug },
        limit: 1,
      });
      if (!tournaments.length) {
        ctx.body = { data: [] };
        return;
      }
      filters.tournament = {
        documentId: tournaments[0].documentId
      };
    }

    if (team) {
      filters.team = {
        documentId: team
      };
    }

    const squad = await strapi.documents('api::team-player.team-player').findMany({
      filters,
      populate: ['team', 'player', 'player.photo', 'tournament'],
      sort: ['assignedAt:desc'],
      limit: 1000,
    });

    ctx.body = { data: squad };
  },

  async assign(ctx) {
    const data = ctx.request.body?.data || ctx.request.body || {};
    const { tournamentId, teamId, playerId } = data;
    const price = money(data.price);

    if (!tournamentId || !teamId || !playerId) {
      return ctx.badRequest('tournamentId, teamId and playerId are required');
    }

    const [tournament, team, player] = await Promise.all([
      strapi.documents('api::tournament.tournament').findOne({ documentId: tournamentId }),
      strapi.documents('api::team.team').findOne({ documentId: teamId, populate: ['tournament'] }),
      strapi.documents('api::player.player').findOne({ documentId: playerId, populate: ['tournament'] }),
    ]);

    if (!tournament || !team || !player) return ctx.notFound('Tournament, team or player not found');
    
    const tId = idOf(tournament);
    const teamTId = idOf(team.tournament);
    const playerTId = idOf(player.tournament);
    
    if (teamTId !== tId || playerTId !== tId) {
      return ctx.badRequest('Team and player must belong to the selected tournament');
    }
    if (team.registrationStatus && team.registrationStatus !== 'approved') {
      return ctx.badRequest('Only approved teams can receive players');
    }
    if (player.registrationStatus !== 'approved') {
      return ctx.badRequest('Only approved players can be assigned');
    }

    const existing = await strapi.documents('api::team-player.team-player').findMany({
      filters: { 
        tournament: tId, 
        player: idOf(player) 
      },
      limit: 1,
    });
    if (existing.length) return ctx.badRequest('Player is already assigned in this tournament');

    const resolvedPrice = price || money(player.basePrice);
    const remainingBudget = money(team.budget) - money(team.spent);
    if (resolvedPrice > remainingBudget) return ctx.badRequest('Team cannot buy player beyond remaining budget');

    const teamPlayer = await strapi.documents('api::team-player.team-player').create({
      data: {
        tournament: tId,
        team: idOf(team),
        player: idOf(player),
        price: resolvedPrice,
        source: 'manual_override',
        assignedAt: new Date().toISOString(),
      },
      populate: ['team', 'player', 'tournament'],
      status: 'published',
    });

    await strapi.documents('api::team.team').update({
      documentId: idOf(team),
      data: { spent: money(team.spent) + resolvedPrice },
    });
    await strapi.documents('api::player.player').update({
      documentId: idOf(player),
      data: { auctionStatus: 'sold' },
    });

    ctx.body = { data: teamPlayer };
  },
}));
