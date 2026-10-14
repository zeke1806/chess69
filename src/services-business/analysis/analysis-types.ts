import type { GameRecord } from '../game/game-types';
import { z } from 'zod';
import { evaluationSchema } from '../adapters/engine/engine-types';
import type { EngineService } from '../adapters/engine/engine-types';
import type { RulesService } from '../adapters/rules/rules-types';

export const analysisPositionSchema = z
  .object({
    ply: z.number().int().min(0),
    fen: z.string(),
    bestMove: z.string().nullable(),
    score: evaluationSchema,
    pv: z.array(z.string()).readonly(),
  })
  .readonly();
export const analysisRecordSchema = z
  .object({
    gameId: z.string(),
    positions: z.array(analysisPositionSchema).readonly(),
    complete: z.boolean(),
  })
  .readonly();
export type AnalysisPosition = z.infer<typeof analysisPositionSchema>;
export type AnalysisRecord = z.infer<typeof analysisRecordSchema>;

export type AnalysisMatePosition = Readonly<{
  fen: string;
  score: Readonly<AnalysisPosition['score']>;
}>;
export type AnalysisErrorCode =
  'game-not-found' | 'game-not-finished' | 'busy' | 'engine-error' | 'invalid-checkpoint';
export type MoveQuality =
  'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'missed-mate' | 'allows-mate';
export type MoveAssessment = Readonly<{
  ply: number;
  move: string;
  loss: number | null;
  quality: MoveQuality;
}>;
export type AnalysisView = Readonly<{
  record: Readonly<Omit<AnalysisRecord, 'positions'>> & {
    readonly positions: readonly (Readonly<Omit<AnalysisPosition, 'pv' | 'score'>> & {
      readonly score: Readonly<AnalysisPosition['score']>;
      readonly pv: readonly string[];
    })[];
  };
  assessments: readonly MoveAssessment[];
  totalPositions: number;
}>;
export type AnalysisOptions = Readonly<{
  signal?: AbortSignal;
  onProgress?: (view: AnalysisView) => void;
}>;
export interface AnalysisService {
  /** Resumes retained checkpoints; returns partial results on cancellation. */
  readonly analyze: (gameId: string, options?: AnalysisOptions) => Promise<AnalysisView>;
  readonly get: (gameId: string) => Promise<AnalysisView | null>;
  readonly cancel: () => Promise<void>;
}
export type AnalysisDependencies = Readonly<{
  repository: AnalysisRepository;
  rules: Pick<RulesService, 'position'>;
  engine: Pick<EngineService, 'evaluate' | 'cancel'>;
}>;
export interface AnalysisRepository {
  readonly load: (gameId: string) => Promise<
    Readonly<{
      game: GameRecord | null;
      record: AnalysisRecord | null;
    }>
  >;
  readonly saveCheckpoint: (
    record: AnalysisRecord,
    isCurrent: () => boolean,
  ) => Promise<AnalysisRecord | null>;
}
