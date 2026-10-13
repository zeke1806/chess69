import { Chess } from 'chess.js';
import type { MemoryEngineDependencies, EngineService } from '../engine-type';
import { createEngineLifecycle } from './engine-lifecycle';

/** Deterministic legal-move double; this is never the production opponent. */
export const createMemoryEngineService = ({ evaluatePosition }: MemoryEngineDependencies = {}): EngineService => createEngineLifecycle({
  initialize: async () => undefined,
  cancel: async () => undefined,
  dispose: async () => undefined,
  evaluate: evaluatePosition ?? (async (fen) => {
    const move = new Chess(fen).moves({ verbose: true })[0];
    const bestMove = move ? `${move.from}${move.to}${move.promotion ?? ''}` : null;
    return { bestMove, score: { type: 'cp', value: 0 }, pv: bestMove ? [bestMove] : [] };
  }),
});
