// @ts-nocheck
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::player.player', ({ strapi }) => ({
  async publicFind(ctx) {
    const players = await strapi.documents('api::player.player').findMany({
      ...ctx.query,
      populate: ['photo', 'tournament', 'teamPlayers', 'teamPlayers.team'],
    });
    ctx.body = { data: players };
  },
}));
