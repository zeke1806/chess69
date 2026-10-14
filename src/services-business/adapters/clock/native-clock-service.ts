import type { ClockService } from './clock-types';

export const createNativeClockService = (): ClockService => {
  return {
    now: () => {
      return new Date();
    },
  };
};
