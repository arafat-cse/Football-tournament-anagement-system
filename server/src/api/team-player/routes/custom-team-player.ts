// @ts-nocheck
export default {
  routes: [
    {
      method: 'GET',
      path: '/public-team-players',
      handler: 'team-player.publicFind',
      config: { auth: false, policies: [] },
    },
    {
      method: 'POST',
      path: '/team-players/assign',
      handler: 'team-player.assign',
      config: { policies: [] },
    },
  ],
};
