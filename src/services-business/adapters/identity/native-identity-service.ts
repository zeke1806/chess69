import type { IdentityService } from './identity-types';
export const createNativeIdentityService = (): IdentityService => {
  let sequence = 0;
  return {
    id: () => {
      return `${Date.now().toString(36)}-${++sequence}-${Math.random().toString(36).slice(2)}`;
    },
    random: () => {
      return Math.random();
    },
  };
};
