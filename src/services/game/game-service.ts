import * as R from 'remeda';
import type {
  GameOptions,
  GameService,
  GameSession,
} from '../../services-business/game/game-types';
import type { ProgressionService } from '../../services-business/progression/progression-types';
import type { ContextLease } from '../adapters/stateful/stateful-types';
import type { GameActions, GameUiService } from './game-types';
type Dependencies = Readonly<{
  game: Omit<GameService, 'get'>;
  preferences: ProgressionService['preferences'];
}>;

export function createGameService({ game, preferences }: Dependencies): GameUiService {
  return {
    createInitialState: () => {
      return {
        options: { color: 'w', level: 'beginner' },
        activeGame: null,
        session: null,
        history: [],
        busy: false,
        thinking: false,
        error: null,
        message: null,
        replacementRequired: false,
        resignationRequired: false,
      };
    },

    connect: (connector) => {
      const runtime = connector.data.createData<
        Readonly<{
          generation: number;
          thinkingGeneration: number;
          refreshGeneration: number;
          optionsDirty: boolean;
          pendingOptions: GameOptions | null;
          retry: (() => Promise<void>) | null;
        }>
      >({
        generation: 0,
        thinkingGeneration: 0,
        refreshGeneration: 0,
        optionsDirty: false,
        pendingOptions: null,
        retry: null,
      });
      const actions: GameActions = {
        changeColor: (color) => {
          runtime.update(R.set('optionsDirty', true));
          connector.setState(R.setPath(['options', 'color'], color));
        },

        changeLevel: (level) => {
          runtime.update(R.set('optionsDirty', true));
          connector.setState(R.setPath(['options', 'level'], level));
        },

        start: async (confirmed = false) => {
          let committed = false;
          if (!connector.isActive() || connector.getState().busy) {
            return;
          }
          const options = confirmed ? runtime.read().pendingOptions : connector.getState().options;
          if (!options) {
            return;
          }
          const lease = connector.bindings.enter('game');
          runtime.update(R.set('pendingOptions', options));
          await run(
            async (isCurrent) => {
              await lease.ready;
              if (!isCurrent()) {
                return;
              }
              try {
                const session = await game.start(options, confirmed);
                committed = true;
                if (isCurrent()) {
                  runtime.update(R.set('optionsDirty', false));
                  runtime.update(R.set('pendingOptions', null));
                  connector.setState((state) => {
                    return R.pipe(
                      state,
                      R.set('session', session),
                      R.set('activeGame', session),
                      R.set('options', options),
                      R.set('replacementRequired', false),
                      R.set('message', gameMessage(session)),
                    );
                  });
                }
                await connector.bindings.refreshGlobal();
              } catch (error) {
                if (
                  error instanceof Error &&
                  'code' in error &&
                  error.code === 'replacement-required'
                ) {
                  if (isCurrent()) {
                    connector.setState(R.set('replacementRequired', true));
                  }
                  return;
                }
                throw error;
              }
            },
            'Impossible de démarrer la partie. Votre partie précédente est conservée.',
            lease,
            async () => {
              if (committed) {
                await recoverGlobal('Impossible de relire les données locales. Réessayez.');
              } else {
                await actions.start(confirmed);
              }
            },
          );
          if (lease.isCurrent() && connector.getState().session && !connector.getState().error) {
            await actions.think();
          }
        },

        dismissReplacement: () => {
          runtime.update(R.set('pendingOptions', null));
          connector.setState(R.set('replacementRequired', false));
        },

        resume: async () => {
          if (!connector.isActive() || connector.getState().busy) {
            return;
          }
          const lease = connector.bindings.enter('game');
          await run(
            async (isCurrent) => {
              await lease.ready;
              if (!isCurrent()) {
                return;
              }
              const session = await game.resume();
              if (!isCurrent()) {
                return;
              }
              connector.setState((state) => {
                return R.pipe(
                  state,
                  R.set('session', session),
                  R.set('activeGame', session),
                  R.set('message', session ? gameMessage(session) : 'Aucune partie à reprendre.'),
                );
              });
            },
            'Impossible de reprendre la partie. Réessayez.',
            lease,
            actions.resume,
          );
          if (lease.isCurrent() && !connector.getState().error) {
            await actions.think();
          }
        },

        move: async (move) => {
          let committed = false;
          if (connector.getState().thinking || !connector.getState().session) {
            return;
          }
          const lease = connector.bindings.current();
          await run(
            async (isCurrent) => {
              const session = await game.play(move);
              committed = true;
              if (isCurrent()) {
                connector.setState((state) => {
                  return R.pipe(
                    state,
                    R.set('session', session),
                    R.set('message', gameMessage(session)),
                  );
                });
              }
              await connector.bindings.refreshGlobal();
            },
            'Ce coup n’a pas pu être enregistré. Réessayez ; la position sauvegardée est conservée.',
            lease,
            async () => {
              if (committed) {
                await recoverGlobal('Impossible de relire les données locales. Réessayez.');
              } else {
                await actions.move(move);
              }
            },
          );
          if (lease.isCurrent() && !connector.getState().error) {
            await actions.think();
          }
        },

        requestResign: () => {
          if (connector.getState().session && !connector.getState().busy) {
            connector.setState(R.set('resignationRequired', true));
          }
        },

        confirmResign: async () => {
          let committed = false;
          if (!connector.getState().resignationRequired) {
            return;
          }
          const lease = connector.bindings.current();
          await run(
            async (isCurrent) => {
              await lease.ready;
              await game.cancelThinking();
              if (!isCurrent()) {
                return;
              }
              const session = await game.resign();
              committed = true;
              if (isCurrent()) {
                connector.setState((state) => {
                  return R.pipe(
                    state,
                    R.set('session', session),
                    R.set('thinking', false),
                    R.set('resignationRequired', false),
                    R.set('message', 'Partie abandonnée · conservée dans l’historique.'),
                  );
                });
              }
              await connector.bindings.refreshGlobal();
            },
            'L’abandon n’a pas été sauvegardé. Réessayez.',
            lease,
            async () => {
              if (committed) {
                await recoverGlobal('Impossible de relire les données locales. Réessayez.');
              } else {
                await actions.confirmResign();
              }
            },
          );
        },

        dismissResign: () => {
          connector.setState(R.set('resignationRequired', false));
        },

        showHistory: async () => {
          if (!connector.isActive() || connector.getState().busy) {
            return;
          }
          const lease = connector.bindings.enter('history');
          await run(
            async (isCurrent) => {
              await lease.ready;
              if (!isCurrent()) {
                return;
              }
              const history = await game.history();
              if (isCurrent()) {
                connector.setState(R.set('history', history));
              }
            },
            'Impossible de lire l’historique. Réessayez.',
            lease,
            actions.showHistory,
          );
        },

        think: async () => {
          let committed = false;
          const session = connector.getState().session;
          if (
            !connector.isActive() ||
            connector.getState().thinking ||
            !session ||
            session.record.finishedAt ||
            session.position.turn === session.record.color
          ) {
            return;
          }
          const lease = connector.bindings.current();
          const token = runtime.update(
            R.set('thinkingGeneration', runtime.read().thinkingGeneration + 1),
          ).thinkingGeneration;

          const isCurrent = (): boolean => {
            return (
              connector.isActive() &&
              lease.isCurrent() &&
              token === runtime.read().thinkingGeneration &&
              connector.getState().session?.record.id === session.record.id
            );
          };

          connector.setState((state) => {
            return R.pipe(
              state,
              R.set('thinking', true),
              R.set('error', null),
              R.set('message', 'Stockfish réfléchit…'),
            );
          });
          try {
            await lease.ready;
            if (!isCurrent()) {
              return;
            }
            const next = await game.think();
            committed = !!next;
            if (next && isCurrent()) {
              connector.setState((state) => {
                return R.pipe(state, R.set('session', next), R.set('message', gameMessage(next)));
              });
            }
            await connector.bindings.refreshGlobal();
          } catch {
            if (isCurrent()) {
              runtime.update(
                R.set(
                  'retry',
                  committed
                    ? async () => {
                        await recoverGlobal('Impossible de relire les données locales. Réessayez.');
                      }
                    : actions.think,
                ),
              );
              connector.setState((state) => {
                return R.pipe(
                  state,
                  R.set(
                    'error',
                    'Le moteur n’a pas répondu. Réessayez ; les coups joués sont conservés.',
                  ),
                  R.set('message', null),
                );
              });
            }
          } finally {
            if (isCurrent()) {
              connector.setState(R.set('thinking', false));
            }
          }
        },

        refresh: async () => {
          const token = runtime.update(
            R.set('refreshGeneration', runtime.read().refreshGeneration + 1),
          ).refreshGeneration;
          const [activeGame, history, saved] = await Promise.all([
            game.resume(),
            game.history(),
            preferences(),
          ]);
          if (!connector.isActive() || token !== runtime.read().refreshGeneration) {
            return;
          }
          connector.setState((state) => {
            return R.pipe(
              state,
              R.set('activeGame', activeGame),
              R.set('history', history),
              R.set(
                'options',
                runtime.read().optionsDirty
                  ? state.options
                  : { color: saved.color, level: saved.level },
              ),
            );
          });
        },

        retry: async () => {
          if (runtime.read().retry) {
            await runtime.read().retry?.();
          }
        },

        leave: () => {
          runtime.update(R.set('generation', runtime.read().generation + 1));
          runtime.update(R.set('thinkingGeneration', runtime.read().thinkingGeneration + 1));
          runtime.update(R.set('retry', null));
          runtime.update(R.set('pendingOptions', null));
          connector.setState((state) => {
            return R.pipe(
              state,
              R.set('session', null),
              R.set('busy', false),
              R.set('thinking', false),
              R.set('error', null),
              R.set('message', null),
              R.set('replacementRequired', false),
              R.set('resignationRequired', false),
            );
          });
        },
      };
      return actions;

      async function recoverGlobal(error: string): Promise<void> {
        const lease = connector.bindings.current();
        await run(
          async () => {
            await connector.bindings.refreshGlobal();
          },
          error,
          lease,
          async () => {
            await recoverGlobal(error);
          },
        );
        if (lease.isCurrent() && !connector.getState().error) {
          await actions.think();
        }
      }

      async function run(
        operation: (isCurrent: () => boolean) => Promise<void>,
        error: string,
        lease: ContextLease,
        restart?: () => Promise<void>,
      ): Promise<void> {
        if (!connector.isActive() || !lease.isCurrent() || connector.getState().busy) {
          return;
        }
        const token = runtime.update(R.set('generation', runtime.read().generation + 1)).generation;

        const isCurrent = (): boolean => {
          return connector.isActive() && lease.isCurrent() && token === runtime.read().generation;
        };

        connector.setState((state) => {
          return R.pipe(state, R.set('busy', true), R.set('error', null));
        });
        runtime.update(
          R.set(
            'retry',
            restart ??
              (async () => {
                await run(operation, error, connector.bindings.current());
              }),
          ),
        );
        try {
          await operation(isCurrent);
          if (isCurrent()) {
            runtime.update(R.set('retry', null));
          }
        } catch {
          if (isCurrent()) {
            connector.setState(R.set('error', error));
          }
        } finally {
          if (isCurrent()) {
            connector.setState(R.set('busy', false));
          }
        }
      }
    },
  };
}

function gameMessage(session: GameSession): string {
  if (session.record.finishedAt) {
    const endings = {
      checkmate: 'Échec et mat',
      stalemate: 'Pat',
      'insufficient-material': 'Matériel insuffisant',
      'threefold-repetition': 'Répétition de position',
      'fifty-move': 'Règle des 50 coups',
    };
    return `${session.position.endReason ? endings[session.position.endReason] : 'Partie terminée'} · ${session.record.result}`;
  }
  if (session.position.checkSquare) {
    return 'Échec ! Protégez votre roi.';
  }
  return session.position.turn === session.record.color
    ? 'À vous de jouer.'
    : 'Au tour de Stockfish.';
}
