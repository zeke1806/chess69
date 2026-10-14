import { describe, expect, it } from '@jest/globals';
import { createMemoryEngineService } from '../../src/services-business/adapters/engine/engine-service';

const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const options = { level: 'beginner' as const, movetime: 100 };

it('annule une évaluation et ignore son résultat tardif avant de réutiliser le moteur', async () => {
  let resolve:
    | ((result: { bestMove: string; score: { type: 'cp'; value: number }; pv: string[] }) => void)
    | undefined;
  const engine = createMemoryEngineService({
    evaluatePosition: () => {
      return new Promise((done) => {
        resolve = done;
      });
    },
  });
  await engine.initialize();
  const evaluation = engine.evaluate(fen, options);
  await Promise.resolve();
  await engine.cancel();
  resolve?.({ bestMove: 'e2e4', score: { type: 'cp', value: 15 }, pv: ['e2e4'] });
  await expect(evaluation).rejects.toMatchObject({ name: 'AbortError' });
  await engine.dispose();
});

it('rejoue un coup légal après annulation et réinitialisation', async () => {
  const engine = createMemoryEngineService();
  await engine.initialize();
  const controller = new AbortController();
  controller.abort();
  await expect(engine.evaluate(fen, options, controller.signal)).rejects.toMatchObject({
    name: 'AbortError',
  });
  const result = await engine.evaluate(fen, options);
  expect(result.bestMove).toBe('a2a3');
  await engine.dispose();
  await expect(engine.evaluate(fen, options)).rejects.toThrow('initialisé');
  await engine.initialize();
  expect((await engine.evaluate(fen, options)).bestMove).toBe('a2a3');
});
