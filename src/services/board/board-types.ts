import type { ChessColor } from '../../services-business/adapters/rules/rules-types';
import type { StatefulService, ContextLease } from '../adapters/stateful/stateful-types';
export type BoardContext = Readonly<{
  key: string;
  fen: string;
  color: ChessColor;
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
export interface BoardActions {
  readonly synchronize: (context: BoardContext | null) => void;
  readonly select: (square: string) => void;
  readonly promote: (piece: 'q' | 'r' | 'b' | 'n') => void;
  readonly cancelPromotion: () => void;
  readonly reset: () => void;
}

export interface BoardUiService extends StatefulService<BoardState, BoardActions, BoardBindings> {}
export interface BoardBindings {
  readonly play: (move: string) => Promise<void>;
}
