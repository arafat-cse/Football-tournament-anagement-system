// @ts-nocheck
export default {
  routes: [
    {
      method: 'GET',
      path: '/public-players',
      handler: 'player.publicFind',
      config: { auth: false, policies: [] },
    },
  ],
};
