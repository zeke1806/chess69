import * as R from 'remeda';
import { mateWinner } from '../../services-business/analysis/analysis-service';
import type { AnalysisService, MoveQuality } from '../../services-business/analysis/analysis-types';
import type { GameService } from '../../services-business/game/game-types';
import type { RulesService } from '../../services-business/adapters/rules/rules-types';
import type {
  AnalysisActions,
  AnalysisDetails,
  AnalysisState,
  AnalysisUiService,
} from './analysis-types';
type Dependencies = Readonly<{
  analysis: AnalysisService;
  game: Pick<GameService, 'get'>;
  rules: Pick<RulesService, 'position'>;
}>;

export function createAnalysisService({ analysis, game, rules }: Dependencies): AnalysisUiService {
  return {
    createInitialState: () => {
      return {
        session: null,
        view: null,
        selectedPly: 0,
        position: null,
        details: null,
        busy: false,
        analyzing: false,
        message: null,
        error: null,
      };
    },

    connect: (connector) => {
      const runtime = connector.data.createData<
        Readonly<{
          generation: number;
          calculationGeneration: number;
          retry: (() => Promise<void>) | null;
        }>
      >({ generation: 0, calculationGeneration: 0, retry: null });
      const actions: AnalysisActions = {
        open: async (id) => {
          if (!connector.isActive() || connector.getState().busy) {
            return;
          }
          const lease = connector.bindings.enter();
          const token = runtime.update(
            R.set('generation', runtime.read().generation + 1),
          ).generation;

          const isCurrent = (): boolean => {
            return connector.isActive() && lease.isCurrent() && token === runtime.read().generation;
          };

          update(R.pipe(connector.getState(), R.set('busy', true), R.set('error', null)));
          runtime.update(
            R.set('retry', async () => {
              await actions.open(id);
            }),
          );
          try {
            await lease.ready;
            if (!isCurrent()) {
              return;
            }
            const session = await game.get(id);
            if (!isCurrent()) {
              return;
            }
            if (!session) {
              throw new Error('missing');
            }
            const view = await analysis.get(id);
            if (!isCurrent()) {
              return;
            }
            runtime.update(R.set('retry', null));
            update(
              R.pipe(
                connector.getState(),
                R.set('session', session),
                R.set('view', view),
                R.set('position', rules.position()),
                R.set('selectedPly', 0),
                R.set('message', null),
              ),
            );
          } catch {
            if (isCurrent()) {
              update(
                R.set(
                  connector.getState(),
                  'error',
                  'Impossible d’ouvrir cette partie. Réessayez.',
                ),
              );
            }
          } finally {
            if (isCurrent()) {
              update(R.set(connector.getState(), 'busy', false));
            }
          }
        },

        analyze: async () => {
          const session = connector.getState().session;
          if (
            !connector.isActive() ||
            connector.getState().analyzing ||
            connector.getState().busy ||
            !session
          ) {
            return;
          }
          const lease = connector.bindings.current();
          const token = runtime.update(
            R.set('calculationGeneration', runtime.read().calculationGeneration + 1),
          ).calculationGeneration;

          const isCurrent = (): boolean => {
            return (
              connector.isActive() &&
              lease.isCurrent() &&
              token === runtime.read().calculationGeneration
            );
          };

          update(R.pipe(connector.getState(), R.set('analyzing', true), R.set('error', null)));
          runtime.update(R.set('retry', actions.analyze));
          try {
            await lease.ready;
            if (!isCurrent()) {
              return;
            }
            const view = await analysis.analyze(session.record.id, {
              onProgress: (value) => {
                if (isCurrent()) {
                  update(R.set(connector.getState(), 'view', value));
                }
              },
            });
            if (isCurrent()) {
              runtime.update(R.set('retry', null));
              update(
                R.pipe(
                  connector.getState(),
                  R.set('view', view),
                  R.set(
                    'message',
                    view.record.complete
                      ? 'Analyse terminée et sauvegardée.'
                      : 'Analyse interrompue · positions calculées conservées.',
                  ),
                ),
              );
            }
          } catch {
            if (isCurrent()) {
              update(
                R.set(
                  connector.getState(),
                  'error',
                  'L’analyse a été interrompue par une erreur. Réessayez pour reprendre les positions restantes.',
                ),
              );
            }
          } finally {
            if (isCurrent()) {
              update(R.set(connector.getState(), 'analyzing', false));
            }
          }
        },

        cancel: async () => {
          const id = connector.getState().session?.record.id;
          if (!id) {
            return;
          }
          const lease = connector.bindings.current();
          const token = runtime.update(
            R.set('calculationGeneration', runtime.read().calculationGeneration + 1),
          ).calculationGeneration;

          const isCurrent = (): boolean => {
            return (
              connector.isActive() &&
              lease.isCurrent() &&
              token === runtime.read().calculationGeneration
            );
          };

          update(R.set(connector.getState(), 'analyzing', false));
          try {
            await analysis.cancel();
            if (!isCurrent()) {
              return;
            }
            const view = await analysis.get(id);
            if (isCurrent()) {
              update(
                R.pipe(
                  connector.getState(),
                  R.set('view', view),
                  R.set('message', 'Analyse annulée · calculs sauvegardés conservés.'),
                ),
              );
            }
          } catch {
            if (isCurrent()) {
              runtime.update(R.set('retry', actions.cancel));
              update(
                R.set(
                  connector.getState(),
                  'error',
                  'L’analyse n’a pas pu être annulée. Réessayez avant de relancer un calcul.',
                ),
              );
            }
          }
        },

        selectPly: (ply) => {
          const session = connector.getState().session;
          if (!session) {
            return;
          }
          const selectedPly = Math.max(0, Math.min(ply, session.record.moves.length));
          update(
            R.pipe(
              connector.getState(),
              R.set('selectedPly', selectedPly),
              R.set(
                'position',
                rules.position(undefined, session.record.moves.slice(0, selectedPly)),
              ),
            ),
          );
        },

        retry: async () => {
          if (runtime.read().retry) {
            await runtime.read().retry?.();
          }
        },

        leave: () => {
          runtime.update(R.set('generation', runtime.read().generation + 1));
          runtime.update(R.set('calculationGeneration', runtime.read().calculationGeneration + 1));
          runtime.update(R.set('retry', null));
          update(
            R.pipe(
              connector.getState(),
              R.set('session', null),
              R.set('view', null),
              R.set('position', null),
              R.set('selectedPly', 0),
              R.set('busy', false),
              R.set('analyzing', false),
              R.set('error', null),
              R.set('message', null),
            ),
          );
        },
      };
      return actions;

      function update(state: AnalysisState): void {
        connector.setState(() => {
          return R.set(state, 'details', projectDetails(state));
        });
      }
    },
  };
}

function projectDetails(state: AnalysisState): AnalysisDetails | null {
  if (!state.session) {
    return null;
  }
  let evaluationMessage = 'Cette position n’a pas encore été analysée.';
  const position = R.find(
    state.view?.record.positions ?? [],
    (item) => item.ply === state.selectedPly,
  );
  const assessment = R.find(
    state.view?.assessments ?? [],
    (item) => item.ply === state.selectedPly,
  );
  if (position?.score.type === 'mate') {
    const color = mateWinner(position) > 0 ? 'blancs' : 'noirs';
    evaluationMessage =
      position.score.value === 0
        ? `Échec et mat · les ${color} gagnent.`
        : `Mat annoncé en ${Math.abs(position.score.value)} pour les ${color}`;
  } else if (position) {
    const value = position.score.value;
    evaluationMessage = `Évaluation pour les blancs : ${value >= 0 ? '+' : ''}${(value / 100).toFixed(2)} pions`;
  }
  return {
    evaluationMessage,
    bestMoveMessage: position?.bestMove ? `Meilleur coup : ${position.bestMove}` : null,
    continuationMessage: position?.pv.length
      ? `Suite conseillée : ${position.pv.slice(0, 6).join(' · ')}`
      : null,
    assessmentMessage: assessment
      ? `${qualityLabels[assessment.quality]}${assessment.loss !== null ? ` · écart de ${(assessment.loss / 100).toFixed(2)} pion(s)` : ''}`
      : null,
    statusMessage: state.analyzing
      ? `Analyse : ${state.view?.record.positions.length ?? 0} / ${state.session.record.moves.length + 1} positions`
      : (state.message ??
        'Le calcul se fait sur le téléphone. Vous pouvez parcourir les coups pendant l’analyse.'),
    actionLabel: state.view?.record.complete
      ? 'Revoir les résultats'
      : 'Analyser les positions restantes',
  };
}

const qualityLabels: Readonly<Record<MoveQuality, string>> = {
  good: 'Bon coup',
  inaccuracy: 'Imprécision',
  mistake: 'Erreur',
  blunder: 'Grosse erreur',
  'missed-mate': 'Mat manqué',
  'allows-mate': 'Mat permis',
};
