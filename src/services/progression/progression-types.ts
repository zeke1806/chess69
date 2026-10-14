import type { ProgressionSummary } from '../../services-business/progression/progression-types';
import type { StatefulService, ContextLease } from '../adapters/stateful/stateful-types';
export type ProgressionState = Readonly<{
  summary: ProgressionSummary | null;
  titles: Readonly<Record<string, string>>;
  onboarding: boolean;
  busy: boolean;
  error: string | null;
}>;
export interface ProgressionActions {
  readonly refresh: () => Promise<void>;
  readonly dismissOnboarding: () => Promise<void>;
  readonly retry: () => Promise<void>;
}

export interface ProgressionUiService extends StatefulService<
  ProgressionState,
  ProgressionActions,
  ProgressionBindings
> {}
export type ProgressionBindings = undefined;
