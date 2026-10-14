export interface LifecycleService {
  readonly initialize: () => Promise<void>;
  readonly dispose: () => Promise<void>;
}
