import type { Attempt, RepositoryService, Review } from '../adapter/repository/repository-type';
import type { CatalogueService, Exercise } from '../catalogue/catalogue-type';
import type { ClockService, IdentityService } from '../adapter/clock/clock-type';
import type { RulesService } from '../adapter/rules/rules-type';

export type LearningMode = 'guided' | 'memory';
export type LearningSnapshot = Readonly<{
  exercise: Exercise; color: 'w' | 'b'; mode: LearningMode;
  fen: string; ply: number; status: 'playing' | 'completed' | 'revealed' | 'saved';
  legalMoves: ReadonlyArray<string>; expectedMove: string | null;
  lastMove: string | null; errorCount: number; assisted: boolean;
  hint: string | null; feedback: 'correct' | 'incorrect' | 'illegal' | null;
}>;
export type LearningAction = Readonly<{ ok: true; snapshot: LearningSnapshot }> | Readonly<{ ok: false; reason: 'not-started' | 'not-playing' | 'unknown-content' | 'wrong-color' | 'saving' }>;
export type LearningResult = Readonly<{ ok: true; attempt: Attempt; review: Review | null }> | Readonly<{ ok: false; reason: 'not-started' | 'unfinished' | 'save-failed' | 'saving' }>;
export type LearningDependencies = Readonly<{
  catalogue: CatalogueService; repository: RepositoryService; rules: RulesService;
  clock: ClockService; ids: Pick<IdentityService, 'id'>;
}>;
export type LearningService = Readonly<{
  start: (contentId: string, color?: 'w' | 'b', mode?: LearningMode) => LearningAction;
  snapshot: () => LearningSnapshot | null;
  play: (move: string) => LearningAction;
  hint: () => LearningAction;
  reveal: () => LearningAction;
  finish: () => Promise<LearningResult>;
}>;
