export default {
  routes: [
    { method: 'POST', path: '/auctions/:id/bid', handler: 'auction.bid', config: { policies: [] } },
    { method: 'POST', path: '/auctions/:id/finalize-sale', handler: 'auction.finalizeSale', config: { policies: [] } },
    { method: 'POST', path: '/auctions/:id/mark-unsold', handler: 'auction.markUnsold', config: { policies: [] } },
  ],
};
