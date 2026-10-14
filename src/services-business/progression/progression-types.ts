import type { Exercise } from '../catalogue/catalogue-types';
import { chessColorSchema } from '../adapters/rules/rules-types';
import type { Attempt, Review } from '../learning/learning-types';
import type { GameRecord } from '../game/game-types';
import { z } from 'zod';
import { engineLevelSchema } from '../adapters/engine/engine-types';
import type { ClockService } from '../adapters/clock/clock-types';

export const preferencesSchema = z
  .object({
    color: z.enum([...chessColorSchema.options, 'random']),
    level: engineLevelSchema,
    onboarded: z.boolean(),
  })
  .readonly();
export type Preferences = z.infer<typeof preferencesSchema>;

export type ProgressionSummary = Readonly<{
  successes: number;
  assisted: number;
  toReview: number;
  attempts: number;
  activeDays: readonly string[];
  streak: number;
  due: readonly Readonly<Review>[];
  mastered: number;
  learning: number;
  finishedGames: number;
  byKind: Readonly<
    Record<
      Exercise['kind'],
      Readonly<{
        success: number;
        assisted: number;
        failed: number;
      }>
    >
  >;
}>;
export interface ProgressionService {
  readonly summary: () => Promise<ProgressionSummary>;
  readonly preferences: () => Promise<Preferences>;
  readonly markOnboarded: () => Promise<void>;
}
export type ProgressionDependencies = Readonly<{
  repository: ProgressionRepository;
  clock: ClockService;
}>;
export type ProgressionData = Readonly<{
  attempts: readonly Attempt[];
  reviews: Readonly<Record<string, Review>>;
  games: readonly GameRecord[];
  preferences: Preferences;
}>;
export interface ProgressionRepository {
  readonly read: () => Promise<ProgressionData>;
  readonly preferences: () => Promise<Preferences>;
  readonly markOnboarded: () => Promise<void>;
}
