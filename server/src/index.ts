// @ts-nocheck
// import type { Core } from '@strapi/strapi';

const createDemoData = async (strapi: any) => {
  const existing = await strapi.entityService.findMany('api::tournament.tournament', {
    filters: { slug: 'dhaka-premier-cup-2026' },
    limit: 1,
  });
  if (existing.length) return;

  const tournament = await strapi.entityService.create('api::tournament.tournament', {
    data: {
      name: 'Dhaka Premier Cup 2026',
      slug: 'dhaka-premier-cup-2026',
      sportType: 'football',
      location: 'Dhaka',
      startDate: '2026-06-12',
      endDate: '2026-06-28',
      registrationFee: 500,
      requiresPayment: true,
      auctionDate: '2026-06-05T15:00:00.000Z',
      status: 'registration_open',
      rules: 'Open registration, verified payments, live auction and team budget control.',
      publishedAt: new Date(),
    },
  });

  const teams = await Promise.all([
    strapi.entityService.create('api::team.team', {
      data: { name: 'Mirpur Strikers', slug: 'mirpur-strikers', ownerName: 'Rahim Uddin', ownerPhone: '01711000001', budget: 50000, spent: 0, registrationStatus: 'approved', jerseyColor: '#16a34a', tournament: tournament.id },
    }),
    strapi.entityService.create('api::team.team', {
      data: { name: 'Gulshan Royals', slug: 'gulshan-royals', ownerName: 'Nadia Ahmed', ownerPhone: '01711000002', budget: 50000, spent: 0, registrationStatus: 'approved', jerseyColor: '#2563eb', tournament: tournament.id },
    }),
    strapi.entityService.create('api::team.team', {
      data: { name: 'Old Dhaka Titans', slug: 'old-dhaka-titans', ownerName: 'Sajid Khan', ownerPhone: '01711000003', budget: 50000, spent: 0, registrationStatus: 'approved', jerseyColor: '#f97316', tournament: tournament.id },
    }),
  ]);

  const auction = await strapi.entityService.create('api::auction.auction', {
    data: { title: 'Dhaka Premier Cup Auction', startsAt: '2026-06-05T15:00:00.000Z', status: 'scheduled', tournament: tournament.id },
  });

  const players = [
    ['Arif Hossain', 'Forward', 7000, 'paid', 'approved'],
    ['Tanvir Islam', 'Midfielder', 6000, 'paid', 'approved'],
    ['Rafi Chowdhury', 'Goalkeeper', 5000, 'pending', 'pending'],
    ['Mehedi Hasan', 'Defender', 5500, 'paid', 'approved'],
  ];

  for (const [name, role, basePrice, paymentStatus, registrationStatus] of players) {
    const registration = await strapi.entityService.create('api::registration.registration', {
      data: {
        name,
        phone: `01712${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
        email: `${String(name).toLowerCase().replace(/\s+/g, '.')}@example.com`,
        age: 24,
        address: 'Dhaka, Bangladesh',
        role,
        experience: 'Local league experience',
        basePrice,
        paymentMethod: 'bkash',
        transactionId: `TXN${Math.floor(Math.random() * 1000000)}`,
        amount: 500,
        paymentStatus,
        registrationStatus,
        tournament: tournament.id,
      },
    });

    await strapi.entityService.create('api::payment.payment', {
      data: {
        method: 'bkash',
        transactionId: registration.transactionId,
        amount: 500,
        status: paymentStatus,
        tournament: tournament.id,
        registration: registration.id,
      },
    });

    if (registrationStatus === 'approved') {
      await strapi.entityService.create('api::player.player', {
        data: {
          name,
          phone: registration.phone,
          email: registration.email,
          age: registration.age,
          address: registration.address,
          role,
          experience: registration.experience,
          basePrice,
          registrationStatus,
          paymentStatus,
          auctionStatus: 'pool',
          tournament: tournament.id,
          registration: registration.id,
        },
      });
    }
  }

  await strapi.entityService.create('api::action-log.action-log', {
    data: { action: 'seed.demo_created', entity: 'tournament', entityId: String(tournament.id), actorRole: 'system', details: { teams: teams.length, auction: auction.id } },
  });
};

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: any }) {
    if (process.env.SEED_DEMO_DATA !== 'false') {
      await createDemoData(strapi);
    }
  },
};
