import { z } from 'zod';

export const attemptSchema = z.object({
  id: z.string(), contentId: z.string(), kind: z.enum(['opening', 'puzzle', 'endgame']),
  outcome: z.enum(['success', 'assisted', 'failed']), at: z.string(), day: z.string(),
});
export const reviewSchema = z.object({ contentId: z.string(), color: z.enum(['w', 'b']).optional(), stage: z.number().int().min(0).max(5), streak: z.number().int().min(0), due: z.string(), });
export const gameRecordSchema = z.object({
  id: z.string(), color: z.enum(['w', 'b']), level: z.enum(['beginner', 'casual', 'club']),
  moves: z.array(z.string()), startedAt: z.string(), finishedAt: z.string().nullable(),
  result: z.string().nullable(), day: z.string().nullable(),
});
export const evaluationSchema = z.object({ type: z.enum(['cp', 'mate']), value: z.number() });
export const analysisPositionSchema = z.object({ ply: z.number().int().min(0), fen: z.string(), bestMove: z.string().nullable(), score: evaluationSchema, pv: z.array(z.string()) });
export const analysisRecordSchema = z.object({ gameId: z.string(), positions: z.array(analysisPositionSchema), complete: z.boolean() });
export const storedStateSchema = z.object({
  schemaVersion: z.literal(1), attempts: z.array(attemptSchema), reviews: z.record(z.string(), reviewSchema),
  games: z.array(gameRecordSchema), analyses: z.record(z.string(), analysisRecordSchema),
  preferences: z.object({ color: z.enum(['w', 'b', 'random']), level: z.enum(['beginner', 'casual', 'club']), onboarded: z.boolean() }),
});
export type StoredState = z.infer<typeof storedStateSchema>;
export type Attempt = z.infer<typeof attemptSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type GameRecord = z.infer<typeof gameRecordSchema>;
export type Evaluation = z.infer<typeof evaluationSchema>;
export type AnalysisPosition = z.infer<typeof analysisPositionSchema>;
export type AnalysisRecord = z.infer<typeof analysisRecordSchema>;
export type RepositoryService = Readonly<{
  initialize: () => Promise<void>;
  readState: () => Promise<StoredState>;
  updateState: (update: (state: StoredState) => StoredState) => Promise<StoredState>;
  dispose: () => Promise<void>;
}>;
export const createEmptyState = (): StoredState => ({
  schemaVersion: 1, attempts: [], reviews: {}, games: [], analyses: {},
  preferences: { color: 'w', level: 'beginner', onboarded: false },
});

export type MemoryRepositoryDependencies = Readonly<{ initialState?: StoredState }>;
export type SQLiteRepositoryDependencies = Readonly<{ databaseName?: string }>;
