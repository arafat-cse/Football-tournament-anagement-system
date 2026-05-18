// @ts-nocheck
import { factories } from '@strapi/strapi';

const idOf = (value: any) => {
  if (!value) return undefined;
  if (typeof value === 'object') return value.documentId || value.id;
  return value;
};
const money = (value: unknown) => Number(value || 0);

const logAction = async (strapi: any, action: string, entity: string, entityId: string | number, details?: unknown) => {
  await strapi.documents('api::action-log.action-log').create({
    data: { action, entity, entityId: String(entityId), actorRole: 'admin', details },
    status: 'published',
  });
};

export default factories.createCoreController('api::auction.auction', ({ strapi }) => ({
  async bid(ctx) {
    const auctionId = ctx.params.id;
    const { playerId, teamId, amount } = ctx.request.body?.data || ctx.request.body || {};
    if (!playerId || !teamId || !amount) return ctx.badRequest('playerId, teamId and amount are required');

    const [auction, player, team] = await Promise.all([
      strapi.documents('api::auction.auction').findOne({ documentId: auctionId, populate: ['tournament'] }),
      strapi.documents('api::player.player').findOne({ documentId: playerId, populate: ['tournament'] }),
      strapi.documents('api::team.team').findOne({ documentId: teamId, populate: ['tournament'] }),
    ]);

    if (!auction || !player || !team) return ctx.notFound('Auction, player or team not found');
    if (player.registrationStatus !== 'approved') return ctx.badRequest('Only approved players can enter auction');
    if (player.auctionStatus === 'sold') return ctx.badRequest('Player is already sold');
    
    const pTId = idOf(player.tournament);
    const teamTId = idOf(team.tournament);
    const auctionTId = idOf(auction.tournament);
    
    if (pTId !== teamTId || pTId !== auctionTId) {
      return ctx.badRequest('Auction, player and team must belong to the same tournament');
    }

    const remainingBudget = money(team.budget) - money(team.spent);
    if (money(amount) > remainingBudget) return ctx.badRequest('Team cannot bid beyond remaining budget');
    if (money(amount) < money(player.basePrice)) return ctx.badRequest('Bid must be at least the player base price');

    await strapi.db.query('api::bid.bid').updateMany({
      where: { auction: auctionId, player: playerId },
      data: { isWinning: false },
    });

    const bid = await strapi.documents('api::bid.bid').create({
      data: { 
        auction: idOf(auction), 
        player: idOf(player), 
        team: idOf(team), 
        amount, 
        isWinning: true 
      },
      populate: ['auction', 'player', 'team'],
      status: 'published',
    });

    await logAction(strapi, 'auction.bid_created', 'bid', bid.documentId || bid.id, { auctionId, playerId, teamId, amount });
    ctx.body = { data: bid };
  },

  async finalizeSale(ctx) {
    const auctionId = ctx.params.id;
    const { playerId, bidId, teamId, finalPrice, override = false } = ctx.request.body?.data || ctx.request.body || {};
    if (!playerId) return ctx.badRequest('playerId is required');

    const player = await strapi.documents('api::player.player').findOne({ documentId: playerId, populate: ['tournament'] });
    if (!player) return ctx.notFound('Player not found');
    if (player.registrationStatus !== 'approved' && !override) return ctx.badRequest('Only approved players can be sold');

    let winningBid: any = null;
    if (bidId) {
      winningBid = await strapi.documents('api::bid.bid').findOne({ documentId: bidId, populate: ['team', 'player'] });
    } else {
      const bids = await strapi.documents('api::bid.bid').findMany({
        filters: { auction: auctionId, player: playerId, isWinning: true },
        populate: ['team', 'player'],
        sort: ['amount:desc'],
        limit: 1,
      });
      winningBid = bids[0];
    }

    const resolvedTeamId = teamId || idOf(winningBid?.team);
    const price = money(finalPrice ?? winningBid?.amount ?? player.basePrice);
    if (!resolvedTeamId) return ctx.badRequest('A winning team is required');

    const team = await strapi.documents('api::team.team').findOne({ documentId: resolvedTeamId, populate: ['tournament'] });
    if (!team) return ctx.notFound('Team not found');
    const existing = await strapi.documents('api::team-player.team-player').findMany({
      filters: { tournament: idOf(player.tournament), player: playerId },
      limit: 1,
    });
    if (existing.length && !override) return ctx.badRequest('Player is already assigned in this tournament');
    if (price > money(team.budget) - money(team.spent) && !override) {
      return ctx.badRequest('Team cannot buy player beyond budget');
    }

    const teamPlayer = await strapi.documents('api::team-player.team-player').create({
      data: {
        tournament: idOf(player.tournament),
        team: resolvedTeamId,
        player: playerId,
        bid: winningBid ? (winningBid.documentId || winningBid.id) : undefined,
        price,
        source: override ? 'manual_override' : 'auction',
        assignedAt: new Date().toISOString(),
      },
      populate: ['team', 'player', 'tournament'],
      status: 'published',
    });

    await strapi.documents('api::team.team').update({
      documentId: resolvedTeamId,
      data: { spent: money(team.spent) + price },
    });
    await strapi.documents('api::player.player').update({
      documentId: playerId,
      data: { auctionStatus: 'sold' },
    });

    await logAction(strapi, 'auction.sale_finalized', 'team-player', teamPlayer.documentId || teamPlayer.id, { auctionId, playerId, teamId: resolvedTeamId, price, override });
    ctx.body = { data: teamPlayer };
  },

  async markUnsold(ctx) {
    const { playerId } = ctx.request.body?.data || ctx.request.body || {};
    if (!playerId) return ctx.badRequest('playerId is required');
    const player = await strapi.documents('api::player.player').update({
      documentId: playerId,
      data: { auctionStatus: 'unsold' },
    });
    await logAction(strapi, 'auction.player_unsold', 'player', playerId);
    ctx.body = { data: player };
  },

  async publicFind(ctx) {
    const auctions = await strapi.documents('api::auction.auction').findMany({
      ...ctx.query,
      populate: ['player', 'player.photo', 'tournament'],
    });
    ctx.body = { data: auctions };
  },
}));
