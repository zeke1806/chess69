import * as R from 'remeda';
import type { CatalogueService } from '../../services-business/catalogue/catalogue-types';
import type {
  LearningAction,
  LearningService,
} from '../../services-business/learning/learning-types';
import type { RulesService } from '../../services-business/adapters/rules/rules-types';
import type { ContextLease } from '../adapters/stateful/stateful-types';
import type { LearningActions, LearningUiService } from './learning-types';

type Dependencies = Readonly<{
  catalogue: CatalogueService;
  createLearning: () => LearningService;
  rules: Pick<RulesService, 'position'>;
}>;

export function createLearningService({
  catalogue,
  createLearning,
  rules,
}: Dependencies): LearningUiService {
  return {
    createInitialState: () => {
      return {
        kind: 'opening',
        theme: null,
        difficulty: null,
        themes: [],
        catalogue: catalogue.list({ kind: 'opening' }),
        openings: catalogue.openings(),
        opening: null,
        openingExercises: [],
        color: 'w',
        session: null,
        selectedPly: 0,
        position: null,
        busy: false,
        error: null,
        message: null,
      };
    },
    connect: (connector) => {
      let generation = 0;
      let lease: ContextLease | null = null;
      let retry: (() => Promise<void>) | null = null;
      const learning = createLearning();
      const actions: LearningActions = {
        filter: (kind, theme = null, difficulty = null) => {
          lease = connector.bindings.enter('list');
          connector.setState((state) => {
            return R.pipe(
              state,
              R.set('kind', kind),
              R.set('theme', theme),
              R.set('difficulty', difficulty),
              R.set('themes', themes(kind)),
              R.set(
                'catalogue',
                catalogue.list({
                  kind,
                  ...(theme ? { theme } : {}),
                  ...(difficulty ? { difficulty } : {}),
                }),
              ),
              R.set('opening', null),
              R.set('openingExercises', []),
            );
          });
        },
        openOpening: (id) => {
          const opening = R.find(catalogue.openings(), (value) => value.id === id);
          if (!opening) {
            return;
          }
          lease = connector.bindings.enter('opening');
          connector.setState((state) => {
            return R.pipe(
              state,
              R.set('opening', opening),
              R.set('color', 'w'),
              R.set(
                'openingExercises',
                opening.variationIds.map((exerciseId) => ({
                  id: exerciseId,
                  title: catalogue.get(exerciseId)?.title ?? exerciseId,
                })),
              ),
            );
          });
        },
        changeColor: (color) => {
          connector.setState(R.set('color', color));
        },
        startExercise: (id, color, mode = 'memory') => {
          const trainedColor =
            color ??
            (catalogue.get(id)?.kind === 'opening' ? connector.getState().color : undefined);
          lease = connector.bindings.enter('exercise');
          synchronize(learning.start(id, trainedColor, mode));
        },
        move: async (move) => {
          await run(async (isCurrent) => {
            if (learning.snapshot()?.status === 'playing') {
              synchronize(learning.play(move));
            }
            if (learning.snapshot()?.status === 'completed') {
              await save(isCurrent);
            }
          }, 'Le résultat n’a pas pu être sauvegardé. Touchez Réessayer ; ne quittez pas cet exercice.');
        },
        hint: () => {
          if (lease?.isCurrent() && !connector.getState().busy) {
            synchronize(learning.hint());
          }
        },
        reveal: async () => {
          await run(async (isCurrent) => {
            if (learning.snapshot()?.status === 'playing') {
              synchronize(learning.reveal());
            }
            await save(isCurrent);
          }, 'La solution est visible, mais le résultat n’a pas été sauvegardé. Réessayez.');
        },
        selectPly: (ply) => {
          const session = connector.getState().session;
          if (!session || session.mode !== 'guided') {
            return;
          }
          const selectedPly = Math.max(0, Math.min(ply, session.exercise.moves.length));
          connector.setState((state) => {
            return R.pipe(
              state,
              R.set('selectedPly', selectedPly),
              R.set(
                'position',
                rules.position(session.exercise.fen, session.exercise.moves.slice(0, selectedPly)),
              ),
            );
          });
        },
        retry: async () => {
          if (retry) {
            await retry();
          }
        },
        leave: () => {
          generation += 1;
          lease = null;
          retry = null;
          connector.setState((state) => {
            return R.pipe(
              state,
              R.set('session', null),
              R.set('position', null),
              R.set('selectedPly', 0),
              R.set('busy', false),
              R.set('error', null),
              R.set('message', null),
            );
          });
        },
      };
      return actions;

      async function run(
        operation: (isCurrent: () => boolean) => Promise<void>,
        error: string,
      ): Promise<void> {
        if (!connector.isActive() || !lease?.isCurrent() || connector.getState().busy) {
          return;
        }
        const context = lease;
        const token = ++generation;
        const isCurrent = (): boolean => {
          return connector.isActive() && context.isCurrent() && token === generation;
        };
        connector.setState((state) => {
          return R.pipe(state, R.set('busy', true), R.set('error', null));
        });
        retry = async () => {
          await run(operation, error);
        };
        try {
          await operation(isCurrent);
          if (isCurrent()) {
            retry = null;
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

      function synchronize(action: LearningAction): void {
        if (!action.ok) {
          connector.setState(
            R.set('error', 'Cet exercice est indisponible. Revenez à la liste et réessayez.'),
          );
          return;
        }
        const session = action.snapshot;
        const message =
          session.feedback === 'incorrect'
            ? 'Ce coup est légal, mais ce n’est pas la suite attendue. Réessayez ou demandez un indice.'
            : session.feedback === 'illegal'
              ? 'Ce coup n’est pas légal dans cette position.'
              : session.status === 'completed'
                ? 'Séquence terminée. Enregistrement du résultat…'
                : null;
        connector.setState((state) => {
          return R.pipe(
            state,
            R.set('session', session),
            R.set('position', rules.position(session.fen)),
            R.set('selectedPly', session.ply),
            R.set('message', message),
            R.set('error', null),
          );
        });
      }

      async function save(isCurrent: () => boolean): Promise<void> {
        const result = await learning.finish();
        if (!result.ok) {
          throw new Error(result.reason);
        }
        if (isCurrent()) {
          connector.setState((state) => {
            return R.pipe(
              state,
              R.set('session', learning.snapshot()),
              R.set(
                'message',
                result.attempt.outcome === 'success'
                  ? 'Réussi sans aide · résultat sauvegardé.'
                  : result.attempt.outcome === 'assisted'
                    ? 'Terminé avec aide · à retravailler.'
                    : 'À revoir · résultat sauvegardé.',
              ),
            );
          });
        }
        await connector.bindings.refreshGlobal();
      }
    },
  };
}

function themes(kind: 'opening' | 'puzzle' | 'endgame'): readonly string[] {
  return kind === 'puzzle'
    ? [
        'Mat',
        'Fourchette',
        'Clouage',
        'Enfilade',
        'Attaque à la découverte',
        'Élimination du défenseur',
      ]
    : kind === 'endgame'
      ? ['Mat élémentaire', 'Finale de pions', 'Finale de tours']
      : [];
}
