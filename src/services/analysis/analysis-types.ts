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
export type AnalysisActions = Readonly<{
  open: (id: string) => Promise<void>;
  analyze: () => Promise<void>;
  cancel: () => Promise<void>;
  selectPly: (ply: number) => void;
  retry: () => Promise<void>;
  leave: () => void;
}>;

export type AnalysisUiService = StatefulService<AnalysisState, AnalysisActions, AnalysisBindings>;
export type AnalysisBindings = Readonly<{ enter: () => ContextLease; current: () => ContextLease }>;
