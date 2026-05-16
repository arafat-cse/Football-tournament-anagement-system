// @ts-nocheck
import { factories } from '@strapi/strapi';

const relationId = (value: unknown) => {
  if (typeof value === 'number' || typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'id' in value) return (value as { id: string | number }).id;
  return undefined;
};

const logAction = async (strapi: any, action: string, entity: string, entityId: string | number, details?: unknown) => {
  await strapi.entityService.create('api::action-log.action-log', {
    data: { action, entity, entityId: String(entityId), actorRole: 'admin', details },
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

export default factories.createCoreController('api::registration.registration', ({ strapi }) => ({
  async publicFind(ctx) {
    const { tournamentSlug } = ctx.query;
    const filters: any = {};

    if (tournamentSlug) {
      const tournaments = await strapi.entityService.findMany('api::tournament.tournament', {
        filters: { slug: tournamentSlug },
        limit: 1,
      });
      if (!tournaments.length) {
        ctx.body = { data: [] };
        return;
      }
      filters.tournament = tournaments[0].id;
    }

    const registrations = await strapi.entityService.findMany('api::registration.registration', {
      filters,
      populate: ['tournament', 'player', 'photo'],
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

    const registration = await strapi.entityService.create('api::registration.registration', {
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
    });

    await strapi.entityService.create('api::payment.payment', {
      data: {
        method: data.paymentMethod || 'bkash',
        transactionId: data.transactionId,
        amount: data.amount || 0,
        status: 'pending',
        tournament: data.tournament,
        registration: registration.id,
        screenshot: screenshotId,
      },
    });

    await logAction(strapi, 'registration.public_created', 'registration', registration.id, {
      name: data.name,
      phone: data.phone,
    });

    ctx.body = { data: registration };
  },

  async approve(ctx) {
    const id = ctx.params.id;
    const registration = await strapi.entityService.findOne('api::registration.registration', id, {
      populate: ['tournament', 'player', 'photo'],
    });

    if (!registration) return ctx.notFound('Registration not found');
    const tournament = registration.tournament as any;
    if (tournament?.requiresPayment && registration.paymentStatus !== 'paid') {
      return ctx.badRequest('Only paid players can be approved for this tournament');
    }

    let player = registration.player as any;
    if (!player) {
      player = await strapi.entityService.create('api::player.player', {
        data: {
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
          tournament: relationId(tournament),
          registration: id,
          photo: relationId(registration.photo),
        },
      });
    } else {
      await strapi.entityService.update('api::player.player', player.id, {
        data: { registrationStatus: 'approved', paymentStatus: registration.paymentStatus, auctionStatus: 'pool' },
      });
    }

    const updated = await strapi.entityService.update('api::registration.registration', id, {
      data: { registrationStatus: 'approved', rejectionReason: null, player: player.id },
      populate: ['tournament', 'player', 'payment'],
    });

    await logAction(strapi, 'registration.approved', 'registration', id, { playerId: player.id });
    ctx.body = { data: updated };
  },

  async reject(ctx) {
    const id = ctx.params.id;
    const reason = ctx.request.body?.reason || ctx.request.body?.data?.rejectionReason;
    if (!reason) return ctx.badRequest('Rejected players must have a rejection reason');

    const updated = await strapi.entityService.update('api::registration.registration', id, {
      data: { registrationStatus: 'rejected', rejectionReason: reason },
      populate: ['tournament', 'player', 'payment'],
    });
    const playerId = relationId((updated as any).player);
    if (playerId) {
      await strapi.entityService.update('api::player.player', playerId, {
        data: { registrationStatus: 'rejected' },
      });
    }

    await logAction(strapi, 'registration.rejected', 'registration', id, { reason });
    ctx.body = { data: updated };
  },
}));
