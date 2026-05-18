// @ts-nocheck
import { factories } from '@strapi/strapi';

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

export default factories.createCoreController('api::team.team', ({ strapi }) => ({
  async publicFind(ctx) {
    const { tournamentSlug } = ctx.query;
    const filters: any = {
      $or: [
        { registrationStatus: 'approved' },
        { registrationStatus: { $null: true } },
      ],
    };

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

    const teams = await strapi.documents('api::team.team').findMany({
      filters,
      populate: ['tournament', 'logo'],
      sort: ['name:asc'],
      limit: 1000,
    });

    ctx.body = { data: teams };
  },

  async publicCreate(ctx) {
    const data = parseData(ctx.request.body?.data || ctx.request.body);
    const logoId = await uploadRequestFile(strapi, pickFile(ctx.request.files || {}, 'logo'));

    if (!data.name || !data.tournament) {
      return ctx.badRequest('name and tournament are required');
    }

    const team = await strapi.documents('api::team.team').create({
      data: {
        name: data.name,
        ownerName: data.ownerName,
        ownerPhone: data.ownerPhone,
        budget: data.budget || 0,
        spent: 0,
        registrationStatus: 'pending',
        jerseyColor: data.jerseyColor || '#16a34a',
        tournament: data.tournament,
        logo: data.logo || logoId,
      },
      populate: ['tournament', 'logo'],
      status: 'published',
    });

    ctx.body = { data: team };
  },

  async approve(ctx) {
    const id = ctx.params.id;
    const team = await strapi.documents('api::team.team').update({
      documentId: id,
      data: { registrationStatus: 'approved' },
      populate: ['tournament', 'logo'],
    });

    ctx.body = { data: team };
  },

  async reject(ctx) {
    const id = ctx.params.id;
    const team = await strapi.documents('api::team.team').update({
      documentId: id,
      data: { registrationStatus: 'rejected' },
      populate: ['tournament', 'logo'],
    });

    ctx.body = { data: team };
  },
}));
