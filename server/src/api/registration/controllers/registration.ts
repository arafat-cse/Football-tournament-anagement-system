// @ts-nocheck
import { factories } from '@strapi/strapi';

const logAction = async (strapi: any, action: string, entity: string, entityId: string | number, details?: unknown) => {
  await strapi.documents('api::action-log.action-log').create({
    data: { action, entity, entityId: String(entityId), actorRole: 'admin', details },
    status: 'published',
  });
};

const parseData = (value: any) => {
  if (typeof value !== 'string') return value || {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const pickFile = (files: any, key: string) => {
  const file = files?.[key];
  return Array.isArray(file) ? file[0] : file;
};

const uploadRequestFile = async (strapi: any, file: any) => {
  if (!file) return undefined;
  const uploaded = await strapi.plugin('upload').service('upload').upload({
    data: {},
    files: file,
  });
  return uploaded?.[0]?.id;
};

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
    paymentStatus: registration.paymentStatus,
    auctionStatus: 'pool',
    tournament: tournament ? (tournament.documentId || tournament.id) : null,
    registration: regDocId,
  };
};

export default factories.createCoreController('api::registration.registration', ({ strapi }) => ({
  async publicFind(ctx) {
    const { tournamentSlug } = ctx.query;
    const filters: any = {};

    if (tournamentSlug) {
      const tournaments = await strapi.documents('api::tournament.tournament').findMany({
        filters: { slug: tournamentSlug },
        limit: 1,
      });
      if (!tournaments.length) {
        ctx.body = { data: [] };
        return;
      }
      filters.tournament = {
        documentId: tournaments[0].documentId
      };
    }

    const registrations = await strapi.documents('api::registration.registration').findMany({
      filters,
      populate: ['tournament', 'player', 'player.photo', 'player.teamPlayers', 'player.teamPlayers.team', 'photo'],
      sort: ['createdAt:desc'],
      limit: 1000,
    });

    ctx.body = { data: registrations };
  },

  async publicCreate(ctx) {
    const data = parseData(ctx.request.body?.data || ctx.request.body);
    const files = ctx.request.files || {};
    const photoId = await uploadRequestFile(strapi, pickFile(files, 'photo'));
    const screenshotId = await uploadRequestFile(strapi, pickFile(files, 'paymentScreenshot'));

    if (!data.name || !data.phone || !data.tournament) {
      return ctx.badRequest('name, phone and tournament are required');
    }

    const registration = await strapi.documents('api::registration.registration').create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        age: data.age,
        address: data.address,
        role: data.role,
        experience: data.experience,
        basePrice: data.basePrice || 0,
        paymentMethod: data.paymentMethod || 'bkash',
        transactionId: data.transactionId,
        amount: data.amount || 0,
        paymentStatus: 'pending',
        registrationStatus: 'pending',
        tournament: data.tournament,
        photo: data.photo || photoId,
        paymentScreenshot: data.paymentScreenshot || screenshotId,
      },
      populate: ['tournament', 'payment'],
      status: 'published',
    });

    await strapi.documents('api::payment.payment').create({
      data: {
        method: data.paymentMethod || 'bkash',
        transactionId: data.transactionId,
        amount: data.amount || 0,
        status: 'pending',
        tournament: data.tournament,
        registration: registration.documentId || registration.id,
        screenshot: screenshotId,
      },
      status: 'published',
    });

    await logAction(strapi, 'registration.public_created', 'registration', registration.documentId || registration.id, {
      name: data.name,
      phone: data.phone,
    });

    ctx.body = { data: registration };
  },

  async approve(ctx) {
    const id = ctx.params.id;
    let regDocId = id;
    let registration;

    // Resolve registration and correct documentId (handles both numeric ID and documentId)
    if (/^\d+$/.test(id)) {
      const results = await strapi.documents('api::registration.registration').findMany({
        filters: { id: Number(id) },
        populate: ['tournament', 'player'],
        limit: 1,
      });
      registration = results[0];
      if (registration) {
        regDocId = registration.documentId;
      }
    } else {
      registration = await strapi.documents('api::registration.registration').findOne({
        documentId: id,
        populate: ['tournament', 'player'],
      });
      if (registration) {
        regDocId = registration.documentId;
      }
    }

    if (!registration) return ctx.notFound('Registration not found');
    const tournament = registration.tournament as any;

    if (registration.paymentStatus !== 'paid') {
      const updated = await strapi.documents('api::registration.registration').update({
        documentId: regDocId,
        data: { registrationStatus: 'approved', rejectionReason: null },
        populate: ['tournament', 'player', 'payment'],
      });

      await logAction(strapi, 'registration.approved', 'registration', regDocId, { playerId: null });
      ctx.body = { data: updated };
      return;
    }

    let player = registration.player as any;
    if (!player) {
      player = await strapi.documents('api::player.player').create({
        data: playerDataFromRegistration(registration, tournament, regDocId),
        status: 'published',
      });
    } else {
      player = await strapi.documents('api::player.player').update({
        documentId: player.documentId || player.id,
        data: { registrationStatus: 'approved', paymentStatus: registration.paymentStatus, auctionStatus: 'pool' },
      });
    }

    const updated = await strapi.documents('api::registration.registration').update({
      documentId: regDocId,
      data: { registrationStatus: 'approved', rejectionReason: null, player: player.documentId || player.id },
      populate: ['tournament', 'player', 'payment'],
    });

    await logAction(strapi, 'registration.approved', 'registration', regDocId, { playerId: player.documentId || player.id });
    ctx.body = { data: updated };
  },

  async reject(ctx) {
    const id = ctx.params.id;
    const reason = ctx.request.body?.reason || ctx.request.body?.data?.rejectionReason;
    if (!reason) return ctx.badRequest('Rejected players must have a rejection reason');

    let regDocId = id;
    if (/^\d+$/.test(id)) {
      const results = await strapi.documents('api::registration.registration').findMany({
        filters: { id: Number(id) },
        limit: 1,
      });
      if (results[0]) {
        regDocId = results[0].documentId;
      }
    }

    const updated = await strapi.documents('api::registration.registration').update({
      documentId: regDocId,
      data: { registrationStatus: 'rejected', rejectionReason: reason },
      populate: ['tournament', 'player', 'payment'],
    });
    
    const player = (updated as any).player;
    const playerId = player?.documentId || player?.id;
    if (playerId) {
      await strapi.documents('api::player.player').update({
        documentId: playerId,
        data: { registrationStatus: 'rejected' },
      });
    }

    await logAction(strapi, 'registration.rejected', 'registration', regDocId, { reason });
    ctx.body = { data: updated };
  },
}));
