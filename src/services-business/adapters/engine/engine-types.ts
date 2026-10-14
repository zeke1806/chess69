import { z } from 'zod';
export const engineLevelSchema = z.enum(['beginner', 'casual', 'club']);
export const evaluationSchema = z
  .object({ type: z.enum(['cp', 'mate']), value: z.number() })
  .readonly();
export type Evaluation = z.infer<typeof evaluationSchema>;
export const engineEvaluationSchema = z
  .object({
    bestMove: z.string().nullable(),
    score: evaluationSchema,
    pv: z.array(z.string()).readonly(),
  })
  .readonly();
export type EngineLevel = z.infer<typeof engineLevelSchema>;
export type EngineEvaluation = z.infer<typeof engineEvaluationSchema>;
export type EngineOptions = Readonly<{
  level: EngineLevel;
  movetime: number;
}>;
/** Scores use the side to move in the supplied FEN, as specified by UCI. */
export interface EngineService {
  readonly initialize: () => Promise<void>;
  readonly evaluate: (
    fen: string,
    options: EngineOptions,
    signal?: AbortSignal,
  ) => Promise<EngineEvaluation>;
  readonly cancel: () => Promise<void>;
  readonly dispose: () => Promise<void>;
}
export type MemoryEngineDependencies = Readonly<{
  evaluatePosition?: (fen: string, options: EngineOptions) => Promise<EngineEvaluation>;
}>;
export interface EngineLifecycleOperations {
  readonly initialize: () => Promise<void>;
  readonly evaluate: (fen: string, options: EngineOptions) => Promise<EngineEvaluation>;
  readonly cancel: () => Promise<void>;
  readonly dispose: () => Promise<void>;
}
export interface NativeStockfish {
  readonly initialize: () => Promise<string>;
  readonly evaluate: (fen: string, skill: number, movetime: number) => Promise<string>;
  readonly cancel: () => Promise<void>;
  readonly dispose: () => Promise<void>;
}
