import { mergeConfig } from 'vite';

export default (config: any) => {
  return mergeConfig(config, {
    server: {
      allowedHosts: ['adminball.bmhbd.org'],
    },
  });
};
