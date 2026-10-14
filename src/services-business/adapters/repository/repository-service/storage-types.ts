import type { StoredState } from '../repository-types';
export type InstallationStorage = Readonly<{
  initialize: () => Promise<void>;
  readState: () => Promise<StoredState>;
  updateState: (update: (state: StoredState) => StoredState) => Promise<StoredState>;
  dispose: () => Promise<void>;
}>;
