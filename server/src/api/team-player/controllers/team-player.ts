// @ts-nocheck
import { factories } from '@strapi/strapi';

const idOf = (value: any) => (typeof value === 'object' && value ? value.id : value);
const money = (value: unknown) => Number(value || 0);

export default factories.createCoreController('api::team-player.team-player', ({ strapi }) => ({
  async publicFind(ctx) {
    const { tournamentSlug, team } = ctx.query;
    const filters: any = {};

    if (tournamentSlug) {
      const tournaments = await strapi.entityService.findMany('api::tournament.tournament', {
        filters: { slug: tournamentSlug },
        limit: 1,
      });
      if (!tournaments.length) {
        ctx.body = { data: [] };
        return;
      }
      filters.tournament = tournaments[0].id;
    }

    if (team) filters.team = team;

    const squad = await strapi.entityService.findMany('api::team-player.team-player', {
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
      strapi.entityService.findOne('api::tournament.tournament', tournamentId),
      strapi.entityService.findOne('api::team.team', teamId, { populate: ['tournament'] }),
      strapi.entityService.findOne('api::player.player', playerId, { populate: ['tournament'] }),
    ]);

    if (!tournament || !team || !player) return ctx.notFound('Tournament, team or player not found');
    if (idOf(team.tournament) !== Number(tournamentId) || idOf(player.tournament) !== Number(tournamentId)) {
      return ctx.badRequest('Team and player must belong to the selected tournament');
    }
    if (team.registrationStatus && team.registrationStatus !== 'approved') {
      return ctx.badRequest('Only approved teams can receive players');
    }
    if (player.registrationStatus !== 'approved') {
      return ctx.badRequest('Only approved players can be assigned');
    }

    const existing = await strapi.entityService.findMany('api::team-player.team-player', {
      filters: { tournament: tournamentId, player: playerId },
      limit: 1,
    });
    if (existing.length) return ctx.badRequest('Player is already assigned in this tournament');

    const resolvedPrice = price || money(player.basePrice);
    const remainingBudget = money(team.budget) - money(team.spent);
    if (resolvedPrice > remainingBudget) return ctx.badRequest('Team cannot buy player beyond remaining budget');

    const teamPlayer = await strapi.entityService.create('api::team-player.team-player', {
      data: {
        tournament: tournamentId,
        team: teamId,
        player: playerId,
        price: resolvedPrice,
        source: 'manual_override',
        assignedAt: new Date().toISOString(),
      },
      populate: ['team', 'player', 'tournament'],
    });

    await strapi.entityService.update('api::team.team', teamId, {
      data: { spent: money(team.spent) + resolvedPrice },
    });
    await strapi.entityService.update('api::player.player', playerId, {
      data: { auctionStatus: 'sold' },
    });

    ctx.body = { data: teamPlayer };
  },
}));
