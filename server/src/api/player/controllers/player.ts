// @ts-nocheck
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::player.player', ({ strapi }) => ({
  async publicFind(ctx) {
    const { tournamentSlug } = ctx.query;
    const filters: any = { ...ctx.query.filters };

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

    const players = await strapi.documents('api::player.player').findMany({
      ...ctx.query,
      filters,
      populate: ['photo', 'tournament', 'teamPlayers', 'teamPlayers.team'],
    });
    ctx.body = { data: players };
  },
}));
