import { Chess } from 'chess.js';
import { uciMoveSchema } from './rules-types';
import type { ChessEndReason, ChessPiece, RulesPosition, RulesService } from './rules-types';
export const createChessJsRulesService = (): RulesService => {
  return {
    position: (fen, moves = []) => {
      return snapshot(replay(fen, moves));
    },
    play: (fen, moves, uci) => {
      const chess = replay(fen, moves);
      if (chess.isGameOver() || !isUci(uci)) {
        return null;
      }
      try {
        chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
        return snapshot(chess);
      } catch {
        return null;
      }
    },
  };
};
const replay = (fen: string | undefined, moves: readonly string[]): Chess => {
  const chess = fen ? new Chess(fen) : new Chess();
  for (const uci of moves) {
    if (!isUci(uci)) {
      throw new Error('Invalid stored UCI move');
    }
    chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
  }
  return chess;
};
const snapshot = (chess: Chess): RulesPosition => {
  const board: ChessPiece[] = chess
    .board()
    .flatMap((row) =>
      row.flatMap((piece) =>
        piece ? [{ square: piece.square, type: piece.type, color: piece.color }] : [],
      ),
    );
  const endReason: ChessEndReason | null = chess.isCheckmate()
    ? 'checkmate'
    : chess.isStalemate()
      ? 'stalemate'
      : chess.isInsufficientMaterial()
        ? 'insufficient-material'
        : chess.isThreefoldRepetition()
          ? 'threefold-repetition'
          : chess.isDrawByFiftyMoves()
            ? 'fifty-move'
            : null;
  return {
    fen: chess.fen(),
    turn: chess.turn(),
    board,
    legalMoves: chess.isGameOver()
      ? []
      : chess
          .moves({ verbose: true })
          .map((move) => `${move.from}${move.to}${move.promotion ?? ''}`),
    checkSquare: chess.isCheck()
      ? (board.find((piece) => piece.type === 'k' && piece.color === chess.turn())?.square ?? null)
      : null,
    result:
      endReason === 'checkmate'
        ? chess.turn() === 'w'
          ? '0-1'
          : '1-0'
        : endReason
          ? '1/2-1/2'
          : null,
    endReason,
    history: chess.history(),
  };
};
const isUci = (move: string): boolean => {
  return uciMoveSchema.safeParse(move).success;
};
