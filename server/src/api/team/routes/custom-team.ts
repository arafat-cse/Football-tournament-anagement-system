// @ts-nocheck
export default {
  routes: [
    {
      method: 'GET',
      path: '/public-teams',
      handler: 'team.publicFind',
      config: { auth: false, policies: [] },
    },
    {
      method: 'POST',
      path: '/public-teams',
      handler: 'team.publicCreate',
      config: { auth: false, policies: [] },
    },
    {
      method: 'POST',
      path: '/teams/:id/approve',
      handler: 'team.approve',
      config: { policies: [] },
    },
    {
      method: 'POST',
      path: '/teams/:id/reject',
      handler: 'team.reject',
      config: { policies: [] },
    },
  ],
};
