// @ts-nocheck
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::sponsor.sponsor', ({ strapi }) => ({
  async publicFind(ctx) {
    const sponsors = await strapi.documents('api::sponsor.sponsor').findMany({
      ...ctx.query,
      filters: { ...ctx.query.filters, is_active: true },
      populate: ['logo', 'tournament'],
    });
    ctx.body = { data: sponsors };
  },
}));
