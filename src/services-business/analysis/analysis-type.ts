import type { EngineService } from '../adapter/engine/engine-type';
import type { AnalysisPosition, AnalysisRecord, RepositoryService } from '../adapter/repository/repository-type';
import type { RulesService } from '../adapter/rules/rules-type';

export type AnalysisMatePosition = Readonly<{ fen: string; score: Readonly<AnalysisPosition['score']> }>;
export type AnalysisErrorCode = 'game-not-found' | 'game-not-finished' | 'busy' | 'engine-error' | 'invalid-checkpoint';
export type MoveQuality = 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'missed-mate' | 'allows-mate';
export type MoveAssessment = Readonly<{ ply: number; move: string; loss: number | null; quality: MoveQuality }>;
export type AnalysisView = Readonly<{ record: Readonly<Omit<AnalysisRecord, 'positions'>> & { readonly positions: readonly (Readonly<Omit<AnalysisPosition, 'pv' | 'score'>> & { readonly score: Readonly<AnalysisPosition['score']>; readonly pv: readonly string[] })[] }; assessments: readonly MoveAssessment[]; totalPositions: number }>;
export type AnalysisOptions = Readonly<{ signal?: AbortSignal; onProgress?: (view: AnalysisView) => void }>;
export type AnalysisService = Readonly<{
  /** Resumes retained checkpoints; returns partial results on cancellation. */
  analyze: (gameId: string, options?: AnalysisOptions) => Promise<AnalysisView>;
  get: (gameId: string) => Promise<AnalysisView | null>;
  cancel: () => Promise<void>;
}>;
export type AnalysisDependencies = Readonly<{ repository: RepositoryService; rules: RulesService; engine: EngineService }>;
