import { test, expect } from '@jest/globals';
import { createProgressionService } from '../../src/services-business/progression/progression-service';
import { createEmptyState, type RepositoryService, type StoredState } from '../../src/services-business/adapter/repository/repository-type';

function setup(initial: StoredState) {
  let state = initial;
  const repository: RepositoryService = { initialize: async () => {}, dispose: async () => {}, readState: async () => state, updateState: async (update) => (state = update(state)) };
  return createProgressionService({ repository, clock: { now: () => new Date(2026, 9, 13, 14) } });
}

test('une réouverture et plusieurs résultats le même jour ne doublent pas les jours actifs', async () => {
  const state = createEmptyState();
  state.attempts = [
    { id: '1',contentId: 'x',kind: 'puzzle',outcome:'success',at:'2026-10-12T14:00:00Z',day:'2026-10-12' },
    { id: '2',contentId: 'x',kind: 'puzzle',outcome:'assisted',at:'2026-10-13T14:00:00Z',day:'2026-10-13' },
    { id: '3',contentId: 'y',kind: 'endgame',outcome:'failed',at:'2026-10-13T14:00:00Z',day:'2026-10-13' },
  ];
  const service = setup(state);
  expect(await service.summary()).toMatchObject({ activeDays: ['2026-10-12','2026-10-13'], streak: 2, successes: 1, assisted: 1, toReview: 2 });
});

test('la série inclut hier avant activité aujourd’hui et les parties terminées comptent', async () => {
  const state = createEmptyState();
  state.games = [{ id:'g',color:'w',level:'beginner',moves:[],startedAt:'2026-10-12T10:00:00Z',finishedAt:'2026-10-12T11:00:00Z',result:'abandon',day:'2026-10-12' }];
  expect(await setup(state).summary()).toMatchObject({ streak:1,finishedGames:1 });
});

test('les révisions dues et la maîtrise reflètent uniquement les résultats conservés', async () => {
  const state = createEmptyState();
  state.reviews = {
    a:{ contentId:'a',stage:3,streak:3,due:'2026-10-10T12:00:00Z' },
    b:{ contentId:'b',stage:1,streak:1,due:'2026-10-20T12:00:00Z' },
  };
  expect(await setup(state).summary()).toMatchObject({ mastered:1,learning:1,due:[{ contentId:'a' }] });
});
