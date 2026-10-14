import * as R from 'remeda';
import type { ContextLease } from '../../adapters/stateful/stateful-types';
import type {
  OrchestrationActions,
  OrchestrationDependencies,
  OrchestrationService,
  OrchestrationState,
  Route,
  Destination,
} from '../orchestration-types';
import { createSliceConnector } from './connections';
import { freezeState, presentBoard, presentShell } from './presentation';

export function createOrchestrationService(
  dependencies: OrchestrationDependencies,
): OrchestrationService {
  return {
    createInitialState: () => {
      return freezeState(
        {
          shell: {
            status: 'loading',
            route: { destination: 'home', page: 'list' },
            title: 'Chess69',
            scrollKey: 'home:list::',
            version: dependencies.version,
            error: null,
            helpVisible: false,
          },
          learning: dependencies.learning.createInitialState(),
          game: dependencies.game.createInitialState(),
          analysis: dependencies.analysis.createInitialState(),
          progression: dependencies.progression.createInitialState(),
          board: dependencies.board.createInitialState(),
        },
        new WeakSet<object>(),
      );
    },

    connect: (connector) => {
      const runtime = connector.data.createData<
        Readonly<{
          lifecycle: number;
          context: number;
          disposed: boolean;
          stopFailed: boolean;
          pendingStop: Promise<void>;
          retryLifecycle: (() => Promise<void>) | null;
          frozen: WeakSet<object>;
        }>
      >({
        lifecycle: 0,
        context: 0,
        disposed: false,
        stopFailed: false,
        pendingStop: Promise.resolve(),
        retryLifecycle: null,
        frozen: new WeakSet<object>(),
      });
      const learning = dependencies.learning.connect(
        createSliceConnector(
          connector,
          'learning',
          {
            enter: (page: 'opening' | 'exercise' | 'list') => {
              return enter({ destination: 'learn', page });
            },

            refreshGlobal,
          },
          isActive,
          publish,
        ),
      );
      const game = dependencies.game.connect(
        createSliceConnector(
          connector,
          'game',
          {
            enter: (page: 'game' | 'history') => {
              return enter({ destination: 'play', page });
            },

            current,
            refreshGlobal,
          },
          isActive,
          publish,
        ),
      );
      const analysis = dependencies.analysis.connect(
        createSliceConnector(
          connector,
          'analysis',
          {
            enter: () => {
              return enter({ destination: 'play', page: 'analysis' });
            },

            current,
          },
          isActive,
          publish,
        ),
      );
      const progression = dependencies.progression.connect(
        createSliceConnector(connector, 'progression', undefined, isActive, publish),
      );
      const board = dependencies.board.connect(
        createSliceConnector(
          connector,
          'board',
          {
            play: async (move: string) => {
              const page = connector.getState().shell.route.page;
              if (page === 'exercise') {
                await learning.move(move);
              }
              if (page === 'game') {
                await game.move(move);
              }
            },
          },
          isActive,
          publishBoard,
        ),
      );
      const actions: OrchestrationActions = {
        initialize: async () => {
          runtime.update(R.set('disposed', false));
          runtime.update(R.set('lifecycle', runtime.read().lifecycle + 1));
          runtime.update(R.set('context', runtime.read().context + 1));
          const token = runtime.read().lifecycle;
          leave();
          publish((state) => {
            return R.pipe(
              state,
              R.setPath(['shell', 'status'], 'loading'),
              R.setPath(['shell', 'error'], null),
            );
          });
          runtime.update(R.set('retryLifecycle', actions.initialize));
          try {
            await dependencies.lifecycle.initialize();
            if (!isActive() || token !== runtime.read().lifecycle) {
              return;
            }
            await refreshGlobal();
            if (!isActive() || token !== runtime.read().lifecycle) {
              return;
            }
            runtime.update(R.set('retryLifecycle', null));
            publish(R.setPath(['shell', 'status'], 'ready'));
          } catch {
            if (isActive() && token === runtime.read().lifecycle) {
              publish((state) => {
                return R.pipe(
                  state,
                  R.setPath(['shell', 'status'], 'error'),
                  R.setPath(
                    ['shell', 'error'],
                    'Impossible d’ouvrir les données locales ou le moteur. Réessayez. Votre progression n’est pas effacée.',
                  ),
                );
              });
            }
          }
        },

        foreground: async () => {
          if (
            !isActive() ||
            (connector.getState().shell.status !== 'ready' &&
              runtime.read().retryLifecycle !== actions.foreground)
          ) {
            return;
          }
          const lease = current();
          runtime.update(R.set('retryLifecycle', actions.foreground));
          try {
            await refreshGlobal();
            if (!lease.isCurrent()) {
              return;
            }
            runtime.update(R.set('retryLifecycle', null));
            publish((state) => {
              return R.pipe(
                state,
                R.setPath(['shell', 'status'], 'ready'),
                R.setPath(['shell', 'error'], null),
              );
            });
            if (connector.getState().shell.route.page === 'game') {
              await game.think();
            }
          } catch {
            if (lease.isCurrent()) {
              // A global refresh failure belongs to lifecycle, independent of the current journey.
              publish((state) => {
                return R.pipe(
                  state,
                  R.setPath(['shell', 'status'], 'error'),
                  R.setPath(
                    ['shell', 'error'],
                    'Impossible de relire les données locales. Réessayez.',
                  ),
                );
              });
            }
          }
        },

        dispose: async () => {
          runtime.update(R.set('disposed', true));
          runtime.update(R.set('lifecycle', runtime.read().lifecycle + 1));
          runtime.update(R.set('context', runtime.read().context + 1));
          runtime.update(R.set('retryLifecycle', null));
          leave();
          // Invoke disposal immediately so the infrastructure queues it before a StrictMode restart.
          const stopping = stop();
          const closing = dependencies.lifecycle.dispose();
          await Promise.all([stopping, closing]);
        },

        navigate: (destination) => {
          enter({ destination, page: 'list' });
        },

        toggleHelp: () => {
          publish((state) => R.setPath(state, ['shell', 'helpVisible'], !state.shell.helpVisible));
        },

        back: () => {
          const state = connector.getState();
          if (state.shell.route.page !== 'list') {
            const page =
              state.shell.route.page === 'exercise' && state.learning.opening ? 'opening' : 'list';
            enter(
              page === 'opening'
                ? { destination: 'learn', page }
                : { destination: state.shell.route.destination, page },
            );
            return true;
          }
          if (state.shell.route.destination !== 'home') {
            actions.navigate('home');
            return true;
          }
          return false;
        },

        openPractice: (kind) => {
          learning.filter(kind);
        },

        startRecommendedPractice: () => {
          const review = connector.getState().progression.summary?.due[0];
          if (review) {
            learning.startExercise(review.contentId, review.color);
          } else {
            actions.navigate('learn');
          }
        },

        retry: async () => {
          if (runtime.read().retryLifecycle) {
            await runtime.read().retryLifecycle?.();
            return;
          }
          const route = connector.getState().shell.route;
          if (route.page === 'analysis') {
            await analysis.retry();
          } else if (route.destination === 'learn') {
            await learning.retry();
          } else if (route.destination === 'play') {
            await game.retry();
          } else {
            await progression.retry();
          }
        },

        learning,
        game,
        analysis,
        progression,
        board,
      };
      return actions;

      function enter(route: Route): ContextLease {
        if (!isActive()) {
          return current();
        }
        runtime.update(R.set('context', runtime.read().context + 1));
        // Changing journeys must not discard recovery for a failed installation lifecycle.
        if (connector.getState().shell.status !== 'error') {
          runtime.update(R.set('retryLifecycle', null));
        }
        leave();
        publish((state) =>
          R.pipe(
            state,
            R.setPath(['shell', 'route'], route),
            R.setPath(['shell', 'helpVisible'], false),
          ),
        );
        stop();
        return current();
      }

      function leave(): void {
        learning.leave();
        game.leave();
        analysis.leave();
      }

      function current(): ContextLease {
        const contextToken = runtime.read().context;
        const lifecycleToken = runtime.read().lifecycle;
        if (runtime.read().stopFailed) {
          stop();
        }
        return {
          isCurrent: () => {
            return (
              isActive() &&
              contextToken === runtime.read().context &&
              lifecycleToken === runtime.read().lifecycle
            );
          },

          ready: runtime.read().pendingStop,
        };
      }

      function stop(): Promise<void> {
        runtime.update(R.set('stopFailed', false));
        const next = runtime
          .read()
          .pendingStop.catch(() => undefined)
          .then(async () => {
            const results = await Promise.allSettled([
              dependencies.cancelAnalysis(),
              dependencies.cancelThinking(),
            ]);
            for (const result of results) {
              if (result.status === 'rejected') {
                throw result.reason;
              }
            }
          });
        runtime.update(R.set('pendingStop', next));
        void next.then(
          () => {
            if (runtime.read().pendingStop === next) {
              runtime.update(R.set('stopFailed', false));
            }
          },
          () => {
            if (runtime.read().pendingStop === next) {
              runtime.update(R.set('stopFailed', true));
            }
          },
        );
        return next;
      }

      async function refreshGlobal(): Promise<void> {
        if (!isActive()) {
          return;
        }
        await Promise.all([progression.refresh(), game.refresh()]);
      }

      function publish(update: (state: OrchestrationState) => OrchestrationState): void {
        if (!isActive()) {
          return;
        }
        connector.setState((state) => {
          return freezeState(presentShell(update(state)), runtime.read().frozen);
        });
        actions?.board.synchronize(presentBoard(connector.getState()));
      }

      function publishBoard(update: (state: OrchestrationState) => OrchestrationState): void {
        if (!isActive()) {
          return;
        }
        connector.setState((state) => {
          return freezeState(update(state), runtime.read().frozen);
        });
      }

      function isActive(): boolean {
        return connector.isActive() && !runtime.read().disposed;
      }
    },
  };
}
