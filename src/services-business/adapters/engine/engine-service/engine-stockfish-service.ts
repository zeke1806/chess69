import { Chess } from 'chess.js';
import { requireNativeModule } from 'expo';
import type { EngineEvaluation, EngineService, NativeStockfish } from '../engine-types';
import { createEngineLifecycle } from './engine-lifecycle';
const skills = { beginner: 0, casual: 5, club: 20 } as const;

export const createStockfishEngineService = (): EngineService => {
  let native: NativeStockfish | null = null;
  return createEngineLifecycle({
    initialize: async () => {
      native ??= requireNativeModule<NativeStockfish>('Chess69Stockfish');
      const response = await native.initialize();
      if (
        !response.includes('Stockfish 17.1') ||
        !response.includes('uciok') ||
        !response.includes('readyok')
      ) {
        throw new Error('Le moteur embarqué n’est pas prêt. Réessayez.');
      }
    },

    evaluate: async (fen, options) => {
      // Validate legal positions before passing them to C++, which assumes a valid FEN.
      const position = new Chess(fen);
      if (position.isGameOver()) {
        return {
          bestMove: null,
          score: { type: position.isCheckmate() ? 'mate' : 'cp', value: 0 },
          pv: [],
        };
      }
      if (!native) {
        throw new Error('Le moteur local doit être initialisé.');
      }
      const result = parseEvaluation(
        await native.evaluate(
          fen,
          skills[options.level],
          Math.round(Math.max(50, Math.min(5000, options.movetime))),
        ),
      );
      if (result.bestMove) {
        const move = result.bestMove;
        position.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: move[4] });
      }
      return result;
    },

    cancel: async () => {
      await native?.cancel();
    },

    dispose: async () => {
      await native?.dispose();
      native = null;
    },
  });
};

/** Native code returns Stockfish's UCI scores, preserving mate announcements. */
const parseEvaluation = (output: string): EngineEvaluation => {
  const score = /\bscore (cp|mate) (-?\d+)/.exec(output);
  const bestMove = /\bbestmove (\S+)/.exec(output)?.[1];
  if (!score || !bestMove) {
    throw new Error('Le moteur n’a pas terminé son calcul. Réessayez.');
  }
  const pv = /\bpv ([^\n]+)/.exec(output)?.[1]?.trim().split(/\s+/) ?? [];
  return {
    bestMove: bestMove === '(none)' || bestMove === '0000' ? null : bestMove,
    score: { type: score[1] === 'mate' ? 'mate' : 'cp', value: Number(score[2]) },
    pv,
  };
};
