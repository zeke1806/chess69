import type { ClockService, IdentityService } from './clock-type';

export const createClockService = (): ClockService => ({ now: () => new Date() });
export const createIdentityService = (): IdentityService => {
  let sequence = 0;
  return {
    id: () => `${Date.now().toString(36)}-${++sequence}-${Math.random().toString(36).slice(2)}`,
    random: () => Math.random(),
  };
};
