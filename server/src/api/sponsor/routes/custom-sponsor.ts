// @ts-nocheck
export default {
  routes: [
    {
      method: 'GET',
      path: '/public-sponsors',
      handler: 'sponsor.publicFind',
      config: { auth: false, policies: [] },
    },
  ],
};
