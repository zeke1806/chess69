import { expect, test } from '@jest/globals';
import * as R from 'remeda';
import { createEmptyState } from '../../src/services-business/adapters/repository/repository-types';
import {
  gameContext,
  connect,
  deferred,
  recordedGame,
  analyzedState,
  catalogue,
  front,
} from './fixtures';

test('le démarrage en erreur propose une reprise sans supprimer la progression', async () => {
  const context = gameContext();
  context.failInit(true);
  await context.connection.actions.initialize();
  expect(context.connection.state.shell.status).toBe('error');
  context.failInit(false);
  await context.connection.actions.retry();
  expect(context.connection.state.shell.status).toBe('ready');
  expect(context.connection.state.progression.onboarding).toBe(true);
});

test('une écriture échouée ne promet pas une sauvegarde et la reprise enregistre une seule réussite', async () => {
  const context = gameContext(createEmptyState(), catalogue);
  const { actions } = context.connection;
  await actions.initialize();
  actions.learning.startExercise('lesson');
  context.failWrite(true);
  await actions.learning.move('f7g7');
  expect(context.connection.state.shell.error).toContain('pas pu être sauvegardé');
  expect((await context.repository.progression.read()).attempts).toHaveLength(0);
  context.failWrite(false);
  await actions.retry();
  expect(context.connection.state.learning).toMatchObject({
    error: null,
    message: 'Réussi sans aide · résultat sauvegardé.',
  });
  expect((await context.repository.progression.read()).attempts).toHaveLength(1);
});

test('les snapshots restent stables sans action et le bouton retour retrouve la liste', async () => {
  const { connection } = gameContext(createEmptyState(), catalogue);
  await connection.actions.initialize();
  const value = connection.state;
  expect(connection.state).toBe(value);
  connection.actions.learning.startExercise('lesson');
  expect(connection.actions.back()).toBe(true);
  expect(connection.state.shell.route.page).toBe('list');
});

test('un coup sauvegardé après navigation conserve le guide courant et sa position', async () => {
  const context = gameContext();
  const { connection } = context;
  await connection.actions.initialize();
  await connection.actions.game.start();
  const held = context.holdNextWrite();
  const pending = connection.actions.game.move('e2e4');
  await held.entered;
  connection.actions.navigate('learn');
  const opening = context.business.catalogue.openings()[0]!;
  connection.actions.learning.openOpening(opening.id);
  connection.actions.learning.startExercise(opening.variationIds[0]!, 'w', 'guided');
  const guide = connection.state;
  held.release();
  await pending;
  expect(connection.state.shell.route.page).toBe('exercise');
  expect(connection.state.learning).toBe(guide.learning);
  expect(connection.state.board.context?.fen).toBe(guide.board.context?.fen);
  expect((await context.repository.progression.read()).games[0]?.moves).toEqual(['e2e4']);
});

test('consulter une partie terminée puis revenir conserve la partie active disponible', async () => {
  const { connection } = gameContext(
    R.set(createEmptyState(), 'games', [
      recordedGame('finished', true),
      recordedGame('active', false),
    ]),
  );
  await connection.actions.initialize();
  await connection.actions.analysis.open('finished');
  expect(connection.state.analysis.session?.record.id).toBe('finished');
  connection.actions.navigate('home');
  expect(connection.state.game.activeGame?.record.id).toBe('active');
  await connection.actions.game.resume();
  expect(connection.state.game.session?.record.id).toBe('active');
});

test('les révisions exposées ne permettent pas de modifier les snapshots sans action', async () => {
  const { connection } = gameContext(
    R.set(createEmptyState(), 'reviews', {
      lesson: { contentId: 'lesson', color: 'w', stage: 1, streak: 0, due: '2026-10-13T00:00:00Z' },
    }),
  );
  await connection.actions.initialize();
  const snapshot = connection.state;
  const review = snapshot.progression.summary!.due[0]!;
  expect(Reflect.set(review, 'stage', 5)).toBe(false);
  expect(review.stage).toBe(1);
  expect(connection.state).toBe(snapshot);
});

test.each([
  { type: 'cp' as const, value: 125, ply: 0, text: 'Évaluation pour les blancs : +1.25 pions' },
  { type: 'cp' as const, value: -75, ply: 0, text: 'Évaluation pour les blancs : -0.75 pions' },
  { type: 'mate' as const, value: 2, ply: 0, text: 'Mat annoncé en 2 pour les blancs' },
  { type: 'mate' as const, value: -2, ply: 0, text: 'Mat annoncé en 2 pour les noirs' },
  { type: 'mate' as const, value: 0, ply: 4, text: 'Échec et mat · les noirs gagnent.' },
])(
  'le snapshot donne le message de résultat $type $value à la position $ply',
  async ({ type, value, ply, text }) => {
    const { connection } = gameContext(
      R.setPath(analyzedState(), ['analyses', 'finished', 'positions', ply, 'score'], {
        type,
        value,
      }),
    );
    await connection.actions.initialize();
    await connection.actions.analysis.open('finished');
    connection.actions.analysis.selectPly(ply);
    expect(connection.state.analysis.details?.evaluationMessage).toBe(text);
  },
);

test('le front expose le meilleur coup, la suite et la qualité sans calcul dans le composant', async () => {
  const { connection } = gameContext(analyzedState());
  await connection.actions.initialize();
  await connection.actions.analysis.open('finished');
  connection.actions.analysis.selectPly(1);
  expect(connection.state.analysis.details).toMatchObject({
    bestMoveMessage: 'Meilleur coup : e7e5',
    continuationMessage: 'Suite conseillée : e7e5 · g1f3',
    assessmentMessage: 'Imprécision · écart de 0.75 pion(s)',
  });
  const score = connection.state.analysis.view!.record.positions[1]!.score;
  expect(Reflect.set(score, 'value', 9999)).toBe(false);
  expect(score.value).toBe(50);
});

test('une initialisation terminée après arrêt et réinitialisation ne publie aucun ancien snapshot', async () => {
  const context = gameContext();
  const entered = deferred();
  const released = deferred();
  let first = true;
  const connection = front({
    ...context.business,

    initialize: async () => {
      if (first) {
        first = false;
        entered.resolve();
        await released.promise;
      }
      await context.business.initialize();
    },
  });
  const old = connection.actions.initialize();
  await entered.promise;
  await connection.actions.dispose();
  await connection.actions.initialize();
  const current = connection.state;
  released.resolve();
  await old;
  expect(connection.state).toBe(current);
});

test('ouvrir une analyse dont la lecture est retardée ne remplace pas un nouveau guide', async () => {
  const context = gameContext(analyzedState());
  const entered = deferred();
  const released = deferred();
  const connection = front({
    ...context.business,
    analysis: {
      ...context.business.analysis,

      get: async (id) => {
        entered.resolve();
        await released.promise;
        return context.business.analysis.get(id);
      },
    },
  });
  await connection.actions.initialize();
  const pending = connection.actions.analysis.open('finished');
  await entered.promise;
  connection.actions.navigate('learn');
  const lesson = context.business.catalogue.openings()[0]!.variationIds[0]!;
  connection.actions.learning.startExercise(lesson, 'w', 'guided');
  const guide = connection.state;
  released.resolve();
  await pending;
  expect(connection.state.learning).toBe(guide.learning);
  expect(connection.state.shell.route.page).toBe('exercise');
});

test('les callbacks et résultats tardifs d’une analyse annulée ne remplacent pas le guide', async () => {
  const context = gameContext(analyzedState());
  const entered = deferred();
  const released = deferred();
  const connection = front({
    ...context.business,
    analysis: {
      ...context.business.analysis,

      analyze: async (id, options) => {
        const view = (await context.business.analysis.get(id))!;
        entered.resolve();
        await released.promise;
        options?.onProgress?.(view);
        return view;
      },
    },
  });
  await connection.actions.initialize();
  await connection.actions.analysis.open('finished');
  const pending = connection.actions.analysis.analyze();
  await entered.promise;
  expect(connection.state.analysis.details?.statusMessage).toBe('Analyse : 5 / 5 positions');
  connection.actions.navigate('learn');
  const lesson = context.business.catalogue.openings()[0]!.variationIds[0]!;
  connection.actions.learning.startExercise(lesson, 'w', 'guided');
  const guide = connection.state;
  released.resolve();
  await pending;
  expect(connection.state.learning).toBe(guide.learning);
  expect(connection.state.analysis).toMatchObject({ view: null, analyzing: false });
});

test('le choix de camp et de difficulté reprend les préférences de l’installation', async () => {
  const context = gameContext(
    R.set(createEmptyState(), 'preferences', { color: 'b', level: 'club', onboarded: true }),
  );
  await context.connection.actions.initialize();
  expect(context.connection.state.game.options).toEqual({ color: 'b', level: 'club' });
  context.connection.actions.game.changeColor('w');
  context.connection.actions.game.changeLevel('casual');
  await context.connection.actions.game.start();
  expect(context.connection.state.game.options).toEqual({ color: 'w', level: 'casual' });
  expect(await context.repository.progression.preferences()).toMatchObject({
    color: 'w',
    level: 'casual',
  });
});
