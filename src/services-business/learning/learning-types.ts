import type { StateData } from '../adapters/data/data-types';
import { z } from 'zod';
import { exerciseKindSchema } from '../catalogue/catalogue-types';
import type { CatalogueService, Exercise } from '../catalogue/catalogue-types';
import type { ClockService } from '../adapters/clock/clock-types';
import type { IdentityService } from '../adapters/identity/identity-types';
import { chessColorSchema } from '../adapters/rules/rules-types';
import type { ChessColor, RulesService } from '../adapters/rules/rules-types';

export const attemptSchema = z
  .object({
    id: z.string(),
    contentId: z.string(),
    kind: exerciseKindSchema,
    outcome: z.enum(['success', 'assisted', 'failed']),
    at: z.string(),
    day: z.string(),
  })
  .readonly();
export const reviewSchema = z
  .object({
    contentId: z.string(),
    color: chessColorSchema.optional(),
    stage: z.number().int().min(0).max(5),
    streak: z.number().int().min(0),
    due: z.string(),
  })
  .readonly();
export type Attempt = z.infer<typeof attemptSchema>;
export type Review = z.infer<typeof reviewSchema>;

export type LearningMode = 'guided' | 'memory';
export type LearningSnapshot = Readonly<{
  exercise: Exercise;
  color: ChessColor;
  mode: LearningMode;
  fen: string;
  ply: number;
  status: 'playing' | 'completed' | 'revealed' | 'saved';
  legalMoves: ReadonlyArray<string>;
  expectedMove: string | null;
  lastMove: string | null;
  errorCount: number;
  assisted: boolean;
  hint: string | null;
  feedback: 'correct' | 'incorrect' | 'illegal' | null;
}>;
export type LearningAction =
  | Readonly<{
      ok: true;
      snapshot: LearningSnapshot;
    }>
  | Readonly<{
      ok: false;
      reason: 'not-started' | 'not-playing' | 'unknown-content' | 'wrong-color' | 'saving';
    }>;
export type LearningResult =
  | Readonly<{
      ok: true;
      attempt: Attempt;
      review: Review | null;
    }>
  | Readonly<{
      ok: false;
      reason: 'not-started' | 'unfinished' | 'save-failed' | 'saving';
    }>;
export type LearningDependencies = Readonly<{
  catalogue: Pick<CatalogueService, 'get'>;
  repository: LearningRepository;
  rules: RulesService;
  clock: ClockService;
  ids: Pick<IdentityService, 'id'>;
}>;
export type LearningSessionState = Readonly<{
  current: LearningSnapshot | null;
  paths: ReadonlyArray<ReadonlyArray<string>>;
  saving: boolean;
  saved: LearningResult | null;
}>;
export interface LearningSessionData extends StateData<LearningSessionState> {}

export interface LearningService {
  readonly createInitialSession: () => LearningSessionState;
  readonly start: (
    data: LearningSessionData,
    contentId: string,
    color?: ChessColor,
    mode?: LearningMode,
  ) => LearningAction;
  readonly snapshot: (data: LearningSessionData) => LearningSnapshot | null;
  readonly play: (data: LearningSessionData, move: string) => LearningAction;
  readonly hint: (data: LearningSessionData) => LearningAction;
  readonly reveal: (data: LearningSessionData) => LearningAction;
  readonly finish: (data: LearningSessionData) => Promise<LearningResult>;
}
export interface LearningRepository {
  readonly saveAttempt: (
    attempt: Attempt,
    reviewKey?: string,
    revise?: (previous: Review | undefined) => Review,
  ) => Promise<Review | null>;
}
