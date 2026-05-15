// @ts-nocheck
export default {
  routes: [
    {
      method: 'POST',
      path: '/public-registrations',
      handler: 'registration.publicCreate',
      config: { auth: false, policies: [] },
    },
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
