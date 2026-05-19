// @ts-nocheck
export default {
  async afterUpdate(event) {
    const { result } = event;

    // Check if the registration is approved and paid
    if (result.registrationStatus === 'approved' && result.paymentStatus === 'paid') {
      const strapi = global.strapi;
      let regDocId = result.documentId ?? result.document_id;

      // If we don't have the documentId from the result, look it up by numeric id
      if (!regDocId && result.id) {
        try {
          const reg = await strapi.documents('api::registration.registration').findMany({
            filters: { id: result.id },
            limit: 1,
          });
          if (reg && reg[0]) {
            regDocId = reg[0].documentId;
          }
        } catch (err) {
          console.error('[Lifecycle] Error looking up registration by numeric ID:', err);
        }
      }

      if (!regDocId) {
        console.error(`[Lifecycle] Could not resolve documentId for registration ID: ${result.id}`);
        return;
      }

      try {
        // Check if player already exists for this registration using correct Strapi v5 relation syntax
        const existingPlayers = await strapi.documents('api::player.player').findMany({
          filters: { registration: { documentId: regDocId } },
          limit: 1,
        });

        if (!existingPlayers || existingPlayers.length === 0) {
          // Find full registration data to get relationships
          const fullRegistration = await strapi.documents('api::registration.registration').findOne({
            documentId: regDocId,
            populate: ['tournament', 'photo'],
          });

          if (fullRegistration) {
            const tournament = fullRegistration.tournament;
            const photo = fullRegistration.photo;

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
                registration: regDocId,
                photo: photo ? photo.documentId : null,
              },
              status: 'published',
            });
            console.log(`[Lifecycle] Player created for registration: ${fullRegistration.name}`);
          }
        }
      } catch (error) {
        console.error('[Lifecycle] Error in afterUpdate handler:', error);
      }
    }
  },
};
