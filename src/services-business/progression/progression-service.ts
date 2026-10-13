import { localDay } from '../calendar/calendar-service';
import type { ProgressionDependencies, ProgressionService } from './progression-type';

export const createProgressionService = ({ repository, clock }: ProgressionDependencies): ProgressionService => ({
  async summary() {
    const state = await repository.readState();
    const days = [...new Set([
      ...state.attempts.map((attempt) => attempt.day),
      ...state.games.flatMap((game) => game.finishedAt && game.day ? [game.day] : []),
    ])].sort();
    const latest = new Map(state.attempts.map((attempt) => [attempt.contentId, attempt]));
    const byKind = {
      opening: { success: 0, assisted: 0, failed: 0 },
      puzzle: { success: 0, assisted: 0, failed: 0 },
      endgame: { success: 0, assisted: 0, failed: 0 },
    };
    for (const attempt of state.attempts) byKind[attempt.kind][attempt.outcome] += 1;
    const reviews = Object.values(state.reviews);
    return {
      successes: state.attempts.filter((attempt) => attempt.outcome === 'success').length,
      assisted: state.attempts.filter((attempt) => attempt.outcome === 'assisted').length,
      toReview: [...latest.values()].filter((attempt) => attempt.outcome !== 'success').length,
      attempts: state.attempts.length, activeDays: days, streak: countStreak(days, clock.now()),
      due: reviews.filter((review) => review.due <= clock.now().toISOString()).sort((a, b) => a.due.localeCompare(b.due)),
      mastered: reviews.filter((review) => review.streak >= 3).length,
      learning: reviews.filter((review) => review.streak < 3).length,
      finishedGames: state.games.filter((game) => game.finishedAt !== null).length,
      byKind,
    };
  },
  preferences: async () => (await repository.readState()).preferences,
  async markOnboarded() {
    await repository.updateState((state) => ({ ...state, preferences: { ...state.preferences, onboarded: true } }));
  },
});


function countStreak(days: readonly string[], now: Date): number {
  const set = new Set(days);
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  if (!set.has(localDay(cursor))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (set.has(localDay(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}
