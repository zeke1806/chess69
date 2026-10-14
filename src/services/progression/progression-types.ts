import type { ProgressionSummary } from '../../services-business/progression/progression-types';
import type { StatefulService, ContextLease } from '../adapters/stateful/stateful-types';
export type ProgressionState = Readonly<{
  summary: ProgressionSummary | null;
  titles: Readonly<Record<string, string>>;
  onboarding: boolean;
  busy: boolean;
  error: string | null;
}>;
export type ProgressionActions = Readonly<{
  refresh: () => Promise<void>;
  dismissOnboarding: () => Promise<void>;
  retry: () => Promise<void>;
}>;

export type ProgressionUiService = StatefulService<
  ProgressionState,
  ProgressionActions,
  ProgressionBindings
>;
export type ProgressionBindings = undefined;
