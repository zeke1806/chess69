import type { CatalogueService, Exercise, Opening } from '../../services-business/catalogue/catalogue-type';
import type { LearningService, LearningSnapshot } from '../../services-business/learning/learning-type';
import type { GameOptions, GameService, GameSession } from '../../services-business/game/game-type';
import type { AnalysisService, AnalysisView } from '../../services-business/analysis/analysis-type';
import type { ProgressionService, ProgressionSummary } from '../../services-business/progression/progression-type';
import type { RulesPosition, RulesService } from '../../services-business/adapter/rules/rules-type';
export type Destination = 'home' | 'learn' | 'play' | 'progress';
export type AnalysisPresentation = Readonly<{
  evaluationMessage: string; bestMoveMessage: string | null; continuationMessage: string | null;
  assessmentMessage: string | null; statusMessage: string; actionLabel: string;
}>;
export type Immutable<T> = T extends object ? { readonly [Key in keyof T]: Immutable<T[Key]> } : T;
export type ApplicationSnapshot = Immutable<{
  status: 'loading' | 'ready' | 'error'; destination: Destination;
  page: 'list' | 'opening' | 'exercise' | 'game' | 'history' | 'analysis';
  message: string | null; error: string | null; busy: boolean; thinking: boolean; analyzing: boolean;
  onboarding: boolean; replacementRequired: boolean; version: string;
  kind: Exercise['kind']; theme: string | null; difficulty: Exercise['difficulty'] | null;
  titles: Readonly<Record<string,string>>; catalogue: readonly Exercise[]; openings: readonly Opening[]; opening: Opening | null;
  summary: ProgressionSummary | null; learning: LearningSnapshot | null;
  gameOptions: GameOptions; activeGame: GameSession | null; game: GameSession | null; history: readonly GameSession[];
  analysis: AnalysisView | null; analysisDetails: AnalysisPresentation | null; selectedPly: number; position: RulesPosition | null;
}>;
export type ApplicationDependencies = Readonly<{
  catalogue: CatalogueService; learning: LearningService; game: GameService; analysis: AnalysisService;
  progression: ProgressionService; rules: RulesService;
  initialize: () => Promise<void>; dispose: () => Promise<void>; version: string;
}>;
export type ApplicationService = Readonly<{
  getSnapshot: () => ApplicationSnapshot; subscribe: (callback: () => void) => () => void;
  initialize: () => Promise<void>; retry: () => Promise<void>; dispose: () => Promise<void>;
  navigate: (destination: Destination) => void; back: () => boolean;
  dismissOnboarding: () => Promise<void>;
  filter: (kind: Exercise['kind'], theme?: string | null, difficulty?: Exercise['difficulty'] | null) => void;
  openOpening: (id: string) => void;
  startExercise: (id: string, color?: 'w' | 'b', guided?: boolean) => void;
  exerciseMove: (move: string) => Promise<void>; hint: () => void; reveal: () => Promise<void>;
  startGame: (options: GameOptions, confirmed?: boolean) => Promise<void>;
  dismissReplacement: () => void; resumeGame: () => Promise<void>; gameMove: (move: string) => Promise<void>;
  resign: () => Promise<void>; showHistory: () => Promise<void>;
  openAnalysis: (id: string) => Promise<void>; analyze: () => Promise<void>; cancelAnalysis: () => Promise<void>;
  selectPly: (ply: number) => void; foreground: () => Promise<void>;
}>;
