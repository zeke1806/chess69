import type { LearningRepository } from '../../learning/learning-types';
import type { GameRepository } from '../../game/game-types';
import type { AnalysisRepository } from '../../analysis/analysis-types';
import type { ProgressionRepository } from '../../progression/progression-types';
import { analysisPositionSchema, analysisRecordSchema } from '../../analysis/analysis-types';
import { gameRecordSchema } from '../../game/game-types';
import { attemptSchema, reviewSchema } from '../../learning/learning-types';
import { z } from 'zod';
import { preferencesSchema } from '../../progression/progression-types';
export const storedStateSchema = z
  .object({
    schemaVersion: z.literal(1),
    attempts: z.array(attemptSchema).readonly(),
    reviews: z.record(z.string(), reviewSchema).readonly(),
    games: z.array(gameRecordSchema).readonly(),
    analyses: z.record(z.string(), analysisRecordSchema).readonly(),
    preferences: preferencesSchema,
  })
  .readonly();
export type StoredState = z.infer<typeof storedStateSchema>;
export interface RepositoryService {
  readonly initialize: () => Promise<void>;
  readonly learning: LearningRepository;
  readonly game: GameRepository;
  readonly analysis: AnalysisRepository;
  readonly progression: ProgressionRepository;
  readonly dispose: () => Promise<void>;
}

export const createEmptyState = (): StoredState => {
  return storedStateSchema.parse({
    schemaVersion: 1,
    attempts: [],
    reviews: {},
    games: [],
    analyses: {},
    preferences: { color: 'w', level: 'beginner', onboarded: false },
  });
};

export type MemoryRepositoryDependencies = Readonly<{
  initialState?: StoredState;
}>;
export type SQLiteRepositoryDependencies = Readonly<{
  databaseName?: string;
}>;
