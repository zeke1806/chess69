import { createServicesBusiness } from '../../../src/services-business/di';
import { createMemoryRepositoryService } from '../../../src/services-business/adapters/repository/repository-service';
import { createEmptyState } from '../../../src/services-business/adapters/repository/repository-types';
import type {
  EngineEvaluation,
  EngineService,
} from '../../../src/services-business/adapters/engine/engine-types';
import { recordedGame } from '../../services/fixtures';
import { expect, test } from '@jest/globals';
import { createBoardService } from '../../../src/services/board/board-service';
import type {
  BoardContext,
  BoardState,
  BoardActions,
  BoardBindings,
} from '../../../src/services/board/board-types';
import type { StatefulService } from '../../../src/services/adapters/stateful/stateful-types';
import * as R from 'remeda';
import {
  gameContext,
  connect as connectOrchestration,
  deferred,
  analyzedState,
  front,
} from '../../services/fixtures';

function connect<State, Actions, Bindings>(
  service: StatefulService<State, Actions, Bindings>,
  bindings: Bindings,
) {
  let state = service.createInitialState();
  let active = true;
  const actions = service.connect({
    getState: () => {
      return state;
    },
    setState: (updater) => {
      if (active) {
        state = updater(state);
      }
    },
    isActive: () => {
      return active;
    },
    bindings,
  });
  return {
    actions,
    get state() {
      return state;
    },
    stop: () => {
      active = false;
    },
  };
}

const context: BoardContext = {
  key: 'game:a',
  fen: '8/P7/8/8/8/8/8/8 w - - 0 1',
  color: 'w',
  legalMoves: ['a7a8q', 'a7a8r', 'a7a8b', 'a7a8n'],
  lastMove: null,
  checkSquare: null,
  disabled: false,
};
function board() {
  const moves: string[] = [];
  const connection = connect<BoardState, BoardActions, BoardBindings>(createBoardService(), {
    play: async (move) => {
      moves.push(move);
    },
  });
  connection.actions.synchronize(context);
  return { connection, moves };
}

test.each(['q', 'r', 'b', 'n'] as const)(
  '01 — la promotion %s émet un seul coup et préserve les anciens états',
  (piece) => {
    const { connection, moves } = board();
    const initial = connection.state;
    connection.actions.select('a7');
    const selected = connection.state;
    connection.actions.select('a8');
    const promotion = connection.state;
    connection.actions.promote(piece);
    connection.actions.promote(piece);
    expect(moves).toEqual([`a7a8${piece}`]);
    expect(initial.selected).toBeNull();
    expect(selected.promotion).toEqual([]);
    expect(promotion.promotion).toHaveLength(4);
    expect(connection.state.promotion).toEqual([]);
  },
);

test('02 — changement de position, annulation et désactivation invalident la promotion', () => {
  const { connection, moves } = board();
  connection.actions.select('a7');
  connection.actions.select('a8');
  connection.actions.cancelPromotion();
  expect(connection.state.selected).toBe('a7');
  connection.actions.promote('q');
  expect(moves).toEqual([]);
  connection.actions.select('a8');
  connection.actions.synchronize({ ...context, key: 'guide:b' });
  connection.actions.promote('q');
  expect(moves).toEqual([]);
  connection.actions.select('a7');
  connection.actions.select('a8');
  connection.actions.synchronize({ ...context, key: 'guide:b', disabled: true });
  connection.actions.promote('q');
  expect(moves).toEqual([]);
});

test('03 — sélection illégale et connexion arrêtée ne jouent aucun coup', () => {
  const { connection, moves } = board();
  connection.actions.select('h8');
  expect(connection.state.selected).toBeNull();
  connection.actions.select('a7');
  connection.actions.select('a8');
  connection.stop();
  connection.actions.promote('q');
  expect(moves).toEqual([]);
});

test('04 — le nouveau parcours attend la fin réelle de l’annulation du moteur', async () => {
  const base = gameContext();
  const entered = deferred();
  const released = deferred();
  let armed = true;
  let started = 0;
  const connection = front({
    ...base.business,
    game: {
      ...base.business.game,
      cancelThinking: async () => {
        if (armed) {
          armed = false;
          entered.resolve();
          await released.promise;
        }
      },
      start: async (...args) => {
        started += 1;
        return base.business.game.start(...args);
      },
    },
  });
  await connection.actions.initialize();
  connection.actions.navigate('play');
  const pending = connection.actions.game.start();
  await entered.promise;
  expect(started).toBe(0);
  released.resolve();
  await pending;
  expect(started).toBe(1);
  expect(connection.state.game.session).not.toBeNull();
});

test('05 — une annulation échouée bloque le lancement et Réessayer retente l’arrêt', async () => {
  const base = gameContext();
  let fail = true;
  let started = 0;
  const connection = front({
    ...base.business,
    game: {
      ...base.business.game,
      cancelThinking: async () => {
        if (fail) {
          throw new Error('native stop');
        }
      },
      start: async (...args) => {
        started += 1;
        return base.business.game.start(...args);
      },
    },
  });
  await connection.actions.initialize();
  await connection.actions.game.start();
  expect(started).toBe(0);
  expect(connection.state.shell.error).not.toBeNull();
  fail = false;
  await connection.actions.retry();
  expect(started).toBe(1);
  expect(connection.state.game.error).toBeNull();
});

test('06 — deux connexions partagent la définition sans partager leur apprentissage', async () => {
  const base = gameContext();
  const first = base.connection;
  const second = connectOrchestration(base.definition);
  await first.actions.initialize();
  await second.actions.initialize();
  const opening = base.business.catalogue.openings()[0]!;
  first.actions.learning.openOpening(opening.id);
  first.actions.learning.startExercise(opening.variationIds[0]!, 'w', 'guided');
  const oldFirst = first.state;
  second.actions.openPractice('puzzle');
  second.actions.learning.startExercise(base.business.catalogue.list({ kind: 'puzzle' })[0]!.id);
  const secondOld = second.state;
  first.actions.learning.hint();
  expect(first.state.learning.session?.exercise.id).toBe(opening.variationIds[0]);
  expect(second.state).toBe(secondOld);
  expect(second.state.learning.session?.exercise.id).not.toBe(
    first.state.learning.session?.exercise.id,
  );
  expect(oldFirst.learning.session?.hint).toBeNull();
});

test('07 — le rafraîchissement global conserve les options saisies et le curseur d’analyse', async () => {
  const { connection } = gameContext(analyzedState());
  await connection.actions.initialize();
  connection.actions.game.changeColor('b');
  connection.actions.game.changeLevel('club');
  await connection.actions.analysis.open('finished');
  connection.actions.analysis.selectPly(3);
  const old = connection.state.analysis;
  await connection.actions.foreground();
  expect(connection.state.analysis).toBe(old);
  expect(connection.state.game.options).toEqual({ color: 'b', level: 'club' });
});

test('08 — le remplacement confirmé utilise les options demandées et une double soumission ne crée pas deux parties', async () => {
  const context = gameContext();
  const { connection } = context;
  await connection.actions.initialize();
  await connection.actions.game.start();
  connection.actions.game.changeColor('b');
  connection.actions.game.changeLevel('club');
  await connection.actions.game.start();
  expect(connection.state.game.replacementRequired).toBe(true);
  connection.actions.game.changeColor('w');
  connection.actions.game.changeLevel('casual');
  await Promise.all([connection.actions.game.start(true), connection.actions.game.start(true)]);
  const data = await context.repository.progression.read();
  expect(data.games).toHaveLength(2);
  expect(data.games[1]).toMatchObject({ color: 'b', level: 'club' });
  expect(connection.state.game.options).toEqual({ color: 'b', level: 'club' });
});

test('09 — une erreur de rafraîchissement au retour au premier plan reste récupérable', async () => {
  const base = gameContext();
  let fail = false;
  const connection = front({
    ...base.business,
    progression: {
      ...base.business.progression,
      summary: async () => {
        if (fail) {
          throw new Error('read');
        }
        return base.business.progression.summary();
      },
    },
  });
  await connection.actions.initialize();
  fail = true;
  await connection.actions.foreground();
  expect(connection.state.shell.error).toContain('relire');
  fail = false;
  await connection.actions.retry();
  expect(connection.state.shell.status).toBe('ready');
  expect(connection.state.shell.error).toBeNull();
});

test('10 — une lecture globale échouée après sauvegarde ne rejoue pas le coup engagé', async () => {
  const base = gameContext();
  let fail = false;
  const connection = front({
    ...base.business,
    progression: {
      ...base.business.progression,
      summary: async () => {
        if (fail) {
          throw new Error('read');
        }
        return base.business.progression.summary();
      },
    },
  });
  await connection.actions.initialize();
  await connection.actions.game.start();
  fail = true;
  await connection.actions.game.move('e2e4');
  expect(connection.state.game.error).not.toBeNull();
  fail = false;
  await connection.actions.retry();
  expect(connection.state.game.error).toBeNull();
  expect((await base.repository.progression.read()).games[0]?.moves[0]).toBe('e2e4');
});

test('11 — une sauvegarde d’apprentissage terminée après démontage ne publie ni nouvelle position ni erreur', async () => {
  const base = gameContext();
  const entered = deferred();
  const released = deferred();
  const original = base.business.createLearning;
  const connection = front({
    ...base.business,
    createLearning: () => {
      const learning = original();
      return {
        ...learning,
        finish: async () => {
          entered.resolve();
          await released.promise;
          return learning.finish();
        },
      };
    },
  });
  await connection.actions.initialize();
  const puzzle = base.business.catalogue.list({ kind: 'puzzle' })[0]!;
  connection.actions.learning.startExercise(puzzle.id);
  const pending = connection.actions.learning.reveal();
  await entered.promise;
  connection.stop();
  const old = connection.state;
  released.resolve();
  await pending;
  expect(connection.state).toBe(old);
  expect((await base.repository.progression.read()).attempts).toHaveLength(1);
});

test('12 — une case valide émet un seul coup et un changement de FEN réinitialise la sélection', () => {
  const { connection, moves } = board();
  connection.actions.synchronize({ ...context, legalMoves: ['a7a8q'] });
  connection.actions.select('a7');
  const before = connection.state;
  connection.actions.select('a8');
  connection.actions.select('a8');
  expect(moves).toEqual(['a7a8q']);
  expect(before.selected).toBe('a7');
  connection.actions.select('a7');
  connection.actions.synchronize({ ...context, fen: 'Q7/8/8/8/8/8/8/8 b - - 0 1' });
  expect(connection.state.selected).toBeNull();
});

test('13 — la reprise après une réponse moteur sauvegardée rafraîchit sans relancer le moteur', async () => {
  const base = gameContext();
  let fail = true;
  const connection = front({
    ...base.business,
    progression: {
      ...base.business.progression,
      summary: async () => {
        if (fail && (await base.repository.progression.read()).games[0]?.moves.length === 2) {
          throw new Error('read');
        }
        return base.business.progression.summary();
      },
    },
  });
  await connection.actions.initialize();
  await connection.actions.game.start();
  await connection.actions.game.move('e2e4');
  expect(connection.state.game.error).not.toBeNull();
  fail = false;
  await connection.actions.retry();
  expect(connection.state.game.error).toBeNull();
  expect((await base.repository.progression.read()).games[0]?.moves).toHaveLength(2);
});

function blockedEngine() {
  let calls = 0;
  let failing = true;
  let release = (_value: EngineEvaluation): void => {};
  const entered = deferred();
  const evaluation: EngineEvaluation = {
    bestMove: 'e2e4',
    score: { type: 'cp', value: 0 },
    pv: ['e2e4'],
  };
  const pending = new Promise<EngineEvaluation>((resolve) => {
    release = resolve;
  });
  const engine: EngineService = {
    initialize: async () => {},
    evaluate: async () => {
      entered.resolve();
      return pending;
    },
    cancel: async () => {
      calls += 1;
      if (failing) {
        throw new Error('native stop');
      }
      release(evaluation);
    },
    dispose: async () => {
      release(evaluation);
    },
  };
  return {
    engine,
    entered: entered.promise,
    recover: () => {
      failing = false;
    },
    get calls() {
      return calls;
    },
  };
}

test('14 — l’arrêt moteur échoué garde la partie verrouillée et la reprise rappelle réellement le moteur', async () => {
  const held = blockedEngine();
  const repository = createMemoryRepositoryService();
  const business = createServicesBusiness({ repository, engine: held.engine });
  const connection = front(business);
  await connection.actions.initialize();
  await business.game.start({ color: 'b', level: 'beginner' });
  const pending = business.game.think();
  await held.entered;
  await expect(business.game.cancelThinking()).rejects.toThrow('native stop');
  expect(held.calls).toBe(1);
  await expect(business.game.start({ color: 'w', level: 'club' }, true)).rejects.toMatchObject({
    code: 'busy',
  });
  await connection.actions.game.start();
  expect(held.calls).toBe(2);
  expect(connection.state.game.error).not.toBeNull();
  held.recover();
  await connection.actions.retry();
  await pending;
  expect(held.calls).toBe(3);
  expect(connection.state.game.replacementRequired).toBe(true);
  expect((await repository.progression.read()).games).toHaveLength(1);
});

test('15 — l’arrêt d’analyse échoué interdit une seconde analyse et la reprise rappelle réellement le moteur', async () => {
  const held = blockedEngine();
  const repository = createMemoryRepositoryService({
    initialState: R.set(createEmptyState(), 'games', [recordedGame('finished', true)]),
  });
  const business = createServicesBusiness({ repository, engine: held.engine });
  const connection = front(business);
  await connection.actions.initialize();
  const pending = business.analysis.analyze('finished');
  await held.entered;
  await expect(business.analysis.cancel()).rejects.toThrow('native stop');
  expect(held.calls).toBe(1);
  let duplicateFailure: unknown = null;
  const duplicate = business.analysis.analyze('finished').catch((error: unknown) => {
    duplicateFailure = error;
  });
  await Promise.resolve();
  expect(duplicateFailure).toMatchObject({ code: 'busy' });
  await duplicate;
  await connection.actions.analysis.open('finished');
  expect(held.calls).toBe(2);
  expect(connection.state.analysis.error).not.toBeNull();
  held.recover();
  await connection.actions.retry();
  await pending;
  expect(held.calls).toBe(3);
  expect(connection.state.analysis.session?.record.id).toBe('finished');
  await connection.actions.analysis.analyze();
  expect(connection.state.analysis.view?.record.complete).toBe(true);
});

test.each(['foreground', 'startup'] as const)(
  '16 — une erreur lifecycle %s reste récupérable après changement d’onglet',
  async (mode) => {
    const base = gameContext(R.set(createEmptyState(), 'games', [recordedGame('active', false)]));
    let failing = mode === 'startup';
    const connection = front({
      ...base.business,
      initialize: async () => {
        if (failing && mode === 'startup') throw new Error('startup');
        await base.business.initialize();
      },
      progression: {
        ...base.business.progression,
        summary: async () => {
          if (failing && mode === 'foreground') throw new Error('read');
          return base.business.progression.summary();
        },
      },
    });
    await connection.actions.initialize();
    if (mode === 'foreground') {
      failing = true;
      await connection.actions.foreground();
    }
    expect(connection.state.shell.status).toBe('error');
    connection.actions.navigate('play');
    failing = false;
    await connection.actions.retry();
    expect(connection.state.shell.status).toBe('ready');
    expect(connection.state.shell.error).toBeNull();
    expect(connection.state.game.activeGame?.record.id).toBe('active');
    expect((await base.repository.progression.read()).games).toHaveLength(1);
  },
);
