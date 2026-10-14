import { Chess } from 'chess.js';
import type { MemoryEngineDependencies, EngineService } from '../engine-types';
import { createEngineLifecycle } from './engine-lifecycle';

/** Deterministic legal-move double; this is never the production opponent. */
export const createMemoryEngineService = ({
  evaluatePosition,
}: MemoryEngineDependencies = {}): EngineService => {
  return createEngineLifecycle({
    initialize: async () => {
      return undefined;
    },

    cancel: async () => {
      return undefined;
    },

    dispose: async () => {
      return undefined;
    },

    evaluate:
      evaluatePosition ??
      (async (fen) => {
        const move = new Chess(fen).moves({ verbose: true })[0];
        const bestMove = move ? `${move.from}${move.to}${move.promotion ?? ''}` : null;
        return { bestMove, score: { type: 'cp', value: 0 }, pv: bestMove ? [bestMove] : [] };
      }),
  });
};
