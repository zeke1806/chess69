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
export type OrchestrationActions = Readonly<{
  initialize: () => Promise<void>;
  foreground: () => Promise<void>;
  dispose: () => Promise<void>;
  navigate: (destination: Destination) => void;
  back: () => boolean;
  openPractice: (kind: Exercise['kind']) => void;
  startRecommendedPractice: () => void;
  retry: () => Promise<void>;
  learning: LearningActions;
  game: GameActions;
  analysis: AnalysisActions;
  progression: ProgressionActions;
  board: BoardActions;
}>;
export type OrchestrationService = StatefulService<OrchestrationState, OrchestrationActions>;
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
