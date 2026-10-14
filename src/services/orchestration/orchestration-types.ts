import type { Exercise } from '../../services-business/catalogue/catalogue-types';
import type { LearningState, LearningActions, LearningUiService } from '../learning/learning-types';
import type { GameState, GameActions, GameUiService } from '../game/game-types';
import type { AnalysisState, AnalysisActions, AnalysisUiService } from '../analysis/analysis-types';
import type {
  ProgressionState,
  ProgressionActions,
  ProgressionUiService,
} from '../progression/progression-types';
import type { BoardState, BoardActions, BoardUiService } from '../board/board-types';
import type { StatefulService } from '../adapters/stateful/stateful-types';

export type Destination = 'home' | 'learn' | 'play' | 'progress';
export type Page = 'list' | 'opening' | 'exercise' | 'game' | 'history' | 'analysis';
export type Route =
  | Readonly<{ page: 'list'; destination: Destination }>
  | Readonly<{ page: 'opening' | 'exercise'; destination: 'learn' }>
  | Readonly<{ page: 'game' | 'history' | 'analysis'; destination: 'play' }>;

export type ShellState = Readonly<{
  status: 'loading' | 'ready' | 'error';
  route: Route;
  title: string;
  scrollKey: string;
  version: string;
  error: string | null;
}>;

export type OrchestrationState = Readonly<{
  shell: ShellState;
  learning: LearningState;
  game: GameState;
  analysis: AnalysisState;
  progression: ProgressionState;
  board: BoardState;
}>;
export interface OrchestrationActions {
  readonly initialize: () => Promise<void>;
  readonly foreground: () => Promise<void>;
  readonly dispose: () => Promise<void>;
  readonly navigate: (destination: Destination) => void;
  readonly back: () => boolean;
  readonly openPractice: (kind: Exercise['kind']) => void;
  readonly startRecommendedPractice: () => void;
  readonly retry: () => Promise<void>;
  readonly learning: LearningActions;
  readonly game: GameActions;
  readonly analysis: AnalysisActions;
  readonly progression: ProgressionActions;
  readonly board: BoardActions;
}
export interface OrchestrationService extends StatefulService<
  OrchestrationState,
  OrchestrationActions
> {}
export type OrchestrationDependencies = Readonly<{
  version: string;
  learning: LearningUiService;
  game: GameUiService;
  analysis: AnalysisUiService;
  progression: ProgressionUiService;
  board: BoardUiService;
  initialize: () => Promise<void>;
  dispose: () => Promise<void>;
  cancelThinking: () => Promise<void>;
  cancelAnalysis: () => Promise<void>;
}>;
