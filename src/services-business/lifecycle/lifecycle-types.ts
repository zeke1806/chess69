import type { StateData } from '../adapters/data/data-types';
export interface LifecycleService {
  readonly initialize: () => Promise<void>;
  readonly dispose: () => Promise<void>;
}

export type LifecycleExecutionData = Readonly<{
  initialized: boolean;
  pending: Promise<unknown>;
}>;
export interface LifecycleData extends StateData<LifecycleExecutionData> {}

export function createInitialLifecycleData(): LifecycleExecutionData {
  return { initialized: false, pending: Promise.resolve() };
}
