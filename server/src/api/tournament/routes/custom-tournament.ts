// @ts-nocheck
export default {
  routes: [
    {
      method: 'GET',
      path: '/public-tournaments',
      handler: 'tournament.publicFind',
      config: { auth: false, policies: [] },
    },
    {
      method: 'GET',
      path: '/public-tournaments/:slug',
      handler: 'tournament.publicFindOne',
      config: { auth: false, policies: [] },
    },
  ],
};
