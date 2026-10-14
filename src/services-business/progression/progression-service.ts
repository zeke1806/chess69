import * as R from 'remeda';
import { localDay } from '../calendar/calendar-service';
import type { ProgressionDependencies, ProgressionService } from './progression-types';

export const createProgressionService = ({
  repository,
  clock,
}: ProgressionDependencies): ProgressionService => {
  return {
    async summary() {
      const state = await repository.read();
      const days = R.unique([
        ...R.map(state.attempts, (attempt) => attempt.day),
        ...R.flatMap(state.games, (game) => (game.finishedAt && game.day ? [game.day] : [])),
      ]).sort();
      const latest = new Map(R.map(state.attempts, (attempt) => [attempt.contentId, attempt]));
      const byKind = {
        opening: { success: 0, assisted: 0, failed: 0 },
        puzzle: { success: 0, assisted: 0, failed: 0 },
        endgame: { success: 0, assisted: 0, failed: 0 },
      };
      for (const attempt of state.attempts) {
        byKind[attempt.kind][attempt.outcome] += 1;
      }
      const reviews = R.values(state.reviews);
      return {
        successes: R.filter(state.attempts, (attempt) => attempt.outcome === 'success').length,
        assisted: R.filter(state.attempts, (attempt) => attempt.outcome === 'assisted').length,
        toReview: R.filter([...latest.values()], (attempt) => attempt.outcome !== 'success').length,
        attempts: state.attempts.length,
        activeDays: days,
        streak: countStreak(days, clock.now()),
        due: R.pipe(
          reviews,
          R.filter((review) => review.due <= clock.now().toISOString()),
          R.sort((a, b) => a.due.localeCompare(b.due)),
        ),
        mastered: R.filter(reviews, (review) => review.streak >= 3).length,
        learning: R.filter(reviews, (review) => review.streak < 3).length,
        finishedGames: R.filter(state.games, (game) => game.finishedAt !== null).length,
        byKind,
      };
    },

    preferences: async () => {
      return repository.preferences();
    },

    async markOnboarded() {
      await repository.markOnboarded();
    },
  };
};

function countStreak(days: readonly string[], now: Date): number {
  let count = 0;
  const set = new Set(days);
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  if (!set.has(localDay(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (set.has(localDay(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}
