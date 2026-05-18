// @ts-nocheck
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::tournament.tournament', ({ strapi }) => ({
  async publicFind(ctx) {
    const tournaments = await strapi.documents('api::tournament.tournament').findMany({
      populate: ['logo', 'banner', 'teams', 'players', 'registrations'],
      sort: ['startDate:asc'],
      limit: 1000,
    });
    ctx.body = { data: tournaments };
  },

  async publicFindOne(ctx) {
    const { slug } = ctx.params;
    const tournaments = await strapi.documents('api::tournament.tournament').findMany({
      filters: { slug },
      populate: ['logo', 'banner', 'teams', 'players', 'registrations'],
      limit: 1,
    });
    
    if (!tournaments || tournaments.length === 0) {
      return ctx.notFound('Tournament not found');
    }
    
    ctx.body = { data: tournaments[0] };
  }
}));
