export type ChessColor = 'w' | 'b';
export type ChessPiece = Readonly<{ square: string; type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k'; color: ChessColor }>;
export type ChessResult = '1-0' | '0-1' | '1/2-1/2';
export type ChessEndReason = 'checkmate' | 'stalemate' | 'insufficient-material' | 'threefold-repetition' | 'fifty-move';
export type RulesPosition = Readonly<{
  fen: string;
  turn: ChessColor;
  legalMoves: readonly string[];
  board: readonly ChessPiece[];
  checkSquare: string | null;
  result: ChessResult | null;
  endReason: ChessEndReason | null;
  history: readonly string[];
}>;
export type RulesService = Readonly<{
  /** Replays every move, preserving repetition and half-move counters. Invalid records throw. */
  position: (fen?: string, moves?: readonly string[]) => RulesPosition;
  /** Returns null for an illegal UCI move; promotions require their suffix. */
  play: (fen: string | undefined, moves: readonly string[], uci: string) => RulesPosition | null;
}>;
