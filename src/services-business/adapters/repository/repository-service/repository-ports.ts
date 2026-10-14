import * as R from 'remeda';
import type { RepositoryService } from '../repository-types';
import type { InstallationStorage } from './storage-types';

export const createRepositoryPorts = (storage: InstallationStorage): RepositoryService => {
  return {
    initialize: storage.initialize,
    dispose: storage.dispose,
    learning: {
      saveAttempt: async (attempt, reviewKey, revise) => {
        const saved = await storage.updateState((state) => {
          const review = reviewKey && revise ? revise(state.reviews[reviewKey]) : null;
          return R.pipe(
            state,
            R.set('attempts', R.concat(state.attempts, [attempt])),
            R.set(
              'reviews',
              review && reviewKey ? R.set(state.reviews, reviewKey, review) : state.reviews,
            ),
          );
        });
        return reviewKey ? (saved.reviews[reviewKey] ?? null) : null;
      },
    },
    game: {
      active: async () => {
        return R.find((await storage.readState()).games, (game) => !game.finishedAt) ?? null;
      },

      get: async (id) => {
        return R.find((await storage.readState()).games, (game) => game.id === id) ?? null;
      },

      history: async () => {
        return R.pipe(
          (await storage.readState()).games,
          R.filter((game) => !!game.finishedAt),
          R.reverse(),
        );
      },

      start: async ({ record, options, expectedActiveId, replaced }) => {
        let accepted = false;
        await storage.updateState((state) => {
          const active = R.find(state.games, (game) => !game.finishedAt);
          if (
            (active?.id ?? null) !== expectedActiveId ||
            state.games.some((game) => game.id === record.id)
          ) {
            return state;
          }
          if (
            active &&
            (!replaced ||
              replaced.id !== active.id ||
              !replaced.finishedAt ||
              active.moves.length !== replaced.moves.length ||
              active.moves.some((move, index) => move !== replaced.moves[index]))
          ) {
            return state;
          }
          accepted = true;
          const games = R.map(state.games, (game) =>
            game.id === expectedActiveId && replaced ? replaced : game,
          );
          return R.pipe(
            state,
            R.set('games', R.concat(games, [record])),
            R.set('preferences', R.merge(state.preferences, options)),
          );
        });
        return accepted;
      },

      save: async (
        expected,
        updated,
        isCurrent = () => {
          return true;
        },
      ) => {
        let accepted = false;
        await storage.updateState((state) => {
          if (!isCurrent()) {
            return state;
          }
          const current = R.find(state.games, (game) => game.id === expected.id);
          if (
            !current ||
            current.finishedAt ||
            current.moves.length !== expected.moves.length ||
            current.moves.some((move, index) => move !== expected.moves[index])
          ) {
            return state;
          }
          accepted = true;
          return R.set(
            state,
            'games',
            R.map(state.games, (game) => (game.id === expected.id ? updated : game)),
          );
        });
        return accepted;
      },
    },
    analysis: {
      load: async (gameId) => {
        const state = await storage.readState();
        return {
          game: R.find(state.games, (game) => game.id === gameId) ?? null,
          record: state.analyses[gameId] ?? null,
        };
      },

      saveCheckpoint: async (record, isCurrent) => {
        const state = await storage.updateState((state) => {
          if (!isCurrent()) {
            return state;
          }
          return R.set(state, 'analyses', R.set(state.analyses, record.gameId, record));
        });
        return state.analyses[record.gameId] ?? null;
      },
    },
    progression: {
      read: async () => {
        const { attempts, reviews, games, preferences } = await storage.readState();
        return Object.freeze({ attempts, reviews, games, preferences });
      },

      preferences: async () => {
        return (await storage.readState()).preferences;
      },

      markOnboarded: async () => {
        await storage.updateState(R.setPath(['preferences', 'onboarded'], true));
      },
    },
  };
};
