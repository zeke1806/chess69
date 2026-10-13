import type { RepositoryService, StoredState, Review } from '../adapter/repository/repository-type';
import type { ClockService } from '../adapter/clock/clock-type';

export type ProgressionSummary = Readonly<{
  successes: number; assisted: number; toReview: number; attempts: number;
  activeDays: readonly string[]; streak: number; due: readonly Readonly<Review>[];
  mastered: number; learning: number; finishedGames: number;
  byKind: Readonly<Record<'opening' | 'puzzle' | 'endgame', Readonly<{ success: number; assisted: number; failed: number }>>>;
}>;
export type ProgressionService = Readonly<{
  summary: () => Promise<ProgressionSummary>;
  preferences: () => Promise<StoredState['preferences']>;
  markOnboarded: () => Promise<void>;
}>;
export type ProgressionDependencies = Readonly<{ repository: RepositoryService; clock: ClockService }>;
