export default {
  routes: [
    {
      method: 'POST',
      path: '/registrations/:id/approve',
      handler: 'registration.approve',
      config: { policies: [] },
    },
    {
      method: 'POST',
      path: '/registrations/:id/reject',
      handler: 'registration.reject',
      config: { policies: [] },
    },
  ],
};
