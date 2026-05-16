// @ts-nocheck
export default {
  async afterUpdate(event) {
    const { result, params } = event;

    // Check if the registration is approved and paid
    if (result.registrationStatus === 'approved' && result.paymentStatus === 'paid') {
      const strapi = global.strapi;

      // Check if player already exists for this registration
      const existingPlayers = await strapi.documents('api::player.player').findMany({
        filters: { registration: result.documentId },
        limit: 1,
      });

      if (!existingPlayers || existingPlayers.length === 0) {
        // Find full registration data to get relationships
        const fullRegistration = await strapi.documents('api::registration.registration').findOne({
          documentId: result.documentId,
          populate: ['tournament', 'photo'],
        });

        if (fullRegistration) {
          const tournament = fullRegistration.tournament;
          const photo = fullRegistration.photo;

          try {
            await strapi.documents('api::player.player').create({
              data: {
                name: fullRegistration.name,
                phone: fullRegistration.phone,
                email: fullRegistration.email,
                age: fullRegistration.age,
                address: fullRegistration.address,
                role: fullRegistration.role,
                experience: fullRegistration.experience,
                basePrice: fullRegistration.basePrice,
                registrationStatus: 'approved',
                paymentStatus: 'paid',
                auctionStatus: 'pool',
                tournament: tournament ? tournament.documentId : null,
                registration: fullRegistration.documentId,
                photo: photo ? photo.documentId : null,
              },
              status: 'published',
            });
            console.log(`[Lifecycle] Player created for registration: ${fullRegistration.name}`);
          } catch (error) {
            console.error('[Lifecycle] Error creating player:', error);
          }
        }
      }
    }
  },
};
