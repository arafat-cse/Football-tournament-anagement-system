// @ts-nocheck
export default {
  routes: [
    {
      method: 'GET',
      path: '/public-registrations',
      handler: 'registration.publicFind',
      config: { auth: false, policies: [] },
    },
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
    {
      method: 'POST',
      path: '/registrations/:id/payment',
      handler: 'registration.payment',
      config: { policies: [] },
    },
  ],
};
