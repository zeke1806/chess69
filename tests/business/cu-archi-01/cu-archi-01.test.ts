import { expect, test } from '@jest/globals';
import {
  createEmptyState,
  storedStateSchema,
} from '../../../src/services-business/adapters/repository/repository-types';
import {
  exerciseSchema,
  openingSchema,
} from '../../../src/services-business/catalogue/catalogue-types';
import { engineEvaluationSchema } from '../../../src/services-business/adapters/engine/engine-types';

const legacy = {
  ...createEmptyState(),
  games: [
    {
      id: 'ancienne-partie',
      color: 'w',
      level: 'club',
      moves: ['e2e4'],
      startedAt: '2026-10-13',
      finishedAt: null,
      result: null,
      day: null,
    },
  ],
  analyses: {
    'ancienne-partie': {
      gameId: 'ancienne-partie',
      complete: false,
      positions: [
        {
          ply: 0,
          fen: 'ancienne-fen',
          bestMove: 'e2e4',
          score: { type: 'cp', value: 12 },
          pv: ['e2e4'],
        },
      ],
    },
  },
};

test('01 — les données version 1 restent lisibles et leurs branches sont immuables', () => {
  const state = storedStateSchema.parse(legacy);
  expect(state).toEqual(legacy);
  expect(Object.isFrozen(state.preferences)).toBe(true);
  expect(Object.isFrozen(state.games)).toBe(true);
  expect(Object.isFrozen(state.games[0]?.moves)).toBe(true);
  expect(Object.isFrozen(state.analyses['ancienne-partie']?.positions[0]?.score)).toBe(true);
  expect(Object.isFrozen(state.analyses['ancienne-partie']?.positions[0]?.pv)).toBe(true);
});

test('02 — le parsing direct du catalogue et du moteur protège leurs collections imbriquées', () => {
  const exercise = exerciseSchema.parse({
    id: 'ancienne-leçon',
    kind: 'opening',
    title: 'Italienne',
    theme: 'Centre',
    difficulty: 'beginner',
    fen: 'fen',
    moves: ['e2e4'],
    alternatives: [['d2d4']],
    explanation: 'Centre',
    hints: ['Centre'],
    side: 'w',
    goal: 'opening-plan',
    objective: 'Centre',
    notes: ['Note'],
    source: { provider: 'source', id: '1', url: 'url', license: 'CC' },
  });
  const opening = openingSchema.parse({
    id: 'ancienne-ouverture',
    title: 'Italienne',
    description: 'Centre',
    ideas: ['Centre'],
    mistakes: ['Retard'],
    variationIds: ['a', 'b', 'c'],
  });
  const evaluation = engineEvaluationSchema.parse({
    bestMove: 'a7a8q',
    score: { type: 'mate', value: 0 },
    pv: ['a7a8q'],
  });
  expect(Object.isFrozen(exercise.alternatives[0])).toBe(true);
  expect(Object.isFrozen(exercise.notes)).toBe(true);
  expect(Object.isFrozen(exercise.source)).toBe(true);
  expect(Object.isFrozen(opening.variationIds)).toBe(true);
  expect(Object.isFrozen(evaluation.score)).toBe(true);
  expect(Object.isFrozen(evaluation.pv)).toBe(true);
});
