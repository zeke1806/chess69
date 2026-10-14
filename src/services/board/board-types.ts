import type { StatefulService, ContextLease } from '../adapters/stateful/stateful-types';
export type BoardContext = Readonly<{
  key: string;
  fen: string;
  color: 'w' | 'b';
  legalMoves: readonly string[];
  lastMove: string | null;
  checkSquare: string | null;
  disabled: boolean;
}>;
export type BoardState = Readonly<{
  context: BoardContext | null;
  pieces: Readonly<Record<string, string>>;
  selected: string | null;
  targets: readonly string[];
  promotion: readonly string[];
  turnMessage: string;
}>;
export type BoardActions = Readonly<{
  synchronize: (context: BoardContext | null) => void;
  select: (square: string) => void;
  promote: (piece: 'q' | 'r' | 'b' | 'n') => void;
  cancelPromotion: () => void;
  reset: () => void;
}>;

export type BoardUiService = StatefulService<BoardState, BoardActions, BoardBindings>;
export type BoardBindings = Readonly<{ play: (move: string) => Promise<void> }>;
