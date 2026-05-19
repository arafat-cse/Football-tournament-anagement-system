// @ts-nocheck
const playerDataFromRegistration = (registration: any, tournament: any, regDocId: string) => {
  return {
    name: registration.name,
    phone: registration.phone,
    email: registration.email,
    age: registration.age,
    address: registration.address,
    role: registration.role,
    experience: registration.experience,
    basePrice: registration.basePrice,
    registrationStatus: 'approved',
    paymentStatus: 'paid',
    auctionStatus: 'pool',
    tournament: tournament ? tournament.documentId : null,
    registration: regDocId,
  };
};

export default {
  async afterUpdate(event) {
    const { result } = event;

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

        const fullRegistration = await strapi.documents('api::registration.registration').findOne({
          documentId: regDocId,
          populate: ['tournament'],
        });

        if (!fullRegistration) return;

        const tournament = fullRegistration.tournament;
        if (!existingPlayers || existingPlayers.length === 0) {
          await strapi.documents('api::player.player').create({
            data: playerDataFromRegistration(fullRegistration, tournament, regDocId),
            status: 'published',
          });
          console.log(`[Lifecycle] Player created for registration: ${fullRegistration.name}`);
        } else {
          await strapi.documents('api::player.player').update({
            documentId: existingPlayers[0].documentId || existingPlayers[0].id,
            data: { registrationStatus: 'approved', paymentStatus: 'paid', auctionStatus: 'pool' },
          });
          console.log(`[Lifecycle] Player synced for paid registration: ${fullRegistration.name}`);
        }
      } catch (error) {
        console.error('[Lifecycle] Error in afterUpdate handler:', error);
      }
    }
  },
};
