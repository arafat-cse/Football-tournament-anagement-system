import { Database } from '@strapi/icons';
import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: [],
  },
  register(app: StrapiApp) {
    app.addMenuLink({
      to: 'content-builder-shortcut',
      icon: Database,
      intlLabel: {
        id: 'admin.content-builder-shortcut.label',
        defaultMessage: 'Content Builder',
      },
      permissions: [{ action: 'plugin::content-type-builder.read', subject: null }],
      Component: () => import('./content-type-builder-shortcut'),
      position: 2,
    });
  },
  bootstrap() {},
};
