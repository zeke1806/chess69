import type { GameSession } from '../../services-business/game/game-types';
import type { AnalysisView } from '../../services-business/analysis/analysis-types';
import type { RulesPosition } from '../../services-business/adapters/rules/rules-types';
import type { StatefulService, ContextLease } from '../adapters/stateful/stateful-types';
export type AnalysisDetails = Readonly<{
  evaluationMessage: string;
  bestMoveMessage: string | null;
  continuationMessage: string | null;
  assessmentMessage: string | null;
  statusMessage: string;
  actionLabel: string;
}>;
export type AnalysisState = Readonly<{
  session: GameSession | null;
  view: AnalysisView | null;
  selectedPly: number;
  position: RulesPosition | null;
  details: AnalysisDetails | null;
  busy: boolean;
  analyzing: boolean;
  message: string | null;
  error: string | null;
}>;
export interface AnalysisActions {
  readonly open: (id: string) => Promise<void>;
  readonly analyze: () => Promise<void>;
  readonly cancel: () => Promise<void>;
  readonly selectPly: (ply: number) => void;
  readonly retry: () => Promise<void>;
  readonly leave: () => void;
}

export interface AnalysisUiService extends StatefulService<
  AnalysisState,
  AnalysisActions,
  AnalysisBindings
> {}
export interface AnalysisBindings {
  readonly enter: () => ContextLease;
  readonly current: () => ContextLease;
}
