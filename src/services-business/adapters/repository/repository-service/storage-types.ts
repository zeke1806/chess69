import type { StoredState } from '../repository-types';
export interface InstallationStorage {
  readonly initialize: () => Promise<void>;
  readonly readState: () => Promise<StoredState>;
  readonly updateState: (update: (state: StoredState) => StoredState) => Promise<StoredState>;
  readonly dispose: () => Promise<void>;
}
