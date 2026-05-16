// @ts-nocheck
export default {
  routes: [
    {
      method: 'GET',
      path: '/public-auctions',
      handler: 'auction.publicFind',
      config: { auth: false, policies: [] },
    },
  ],
};
