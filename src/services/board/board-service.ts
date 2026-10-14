import * as R from 'remeda';
import type { BoardContext, BoardUiService } from './board-types';

export function createBoardService(): BoardUiService {
  return {
    createInitialState: () => {
      return {
        context: null,
        pieces: {},
        selected: null,
        targets: [],
        promotion: [],
        turnMessage: '',
      };
    },
    connect: (connector) => {
      const actions = {
        synchronize: (context: BoardContext | null): void => {
          const current = connector.getState();
          if (sameContext(current.context, context)) {
            return;
          }
          const reset =
            !context ||
            context.disabled ||
            current.context?.key !== context.key ||
            current.context.fen !== context.fen;
          connector.setState((state) => {
            return R.pipe(
              state,
              R.set('context', context),
              R.set('pieces', context ? pieces(context.fen) : {}),
              R.set('selected', reset ? null : state.selected),
              R.set('targets', reset ? [] : state.targets),
              R.set('promotion', reset ? [] : state.promotion),
              R.set(
                'turnMessage',
                context
                  ? `${context.fen.split(' ')[1] === 'w' ? 'Trait aux blancs' : 'Trait aux noirs'}${context.checkSquare ? ' · Roi en échec' : ''}`
                  : '',
              ),
            );
          });
        },
        select: (square: string): void => {
          const state = connector.getState();
          const context = state.context;
          if (!connector.isActive() || !context || context.disabled || state.promotion.length) {
            return;
          }
          const moves = state.selected
            ? R.filter(context.legalMoves, (move) => move.slice(0, 4) === state.selected + square)
            : [];
          if (moves.length > 1) {
            connector.setState(R.set('promotion', moves));
            return;
          }
          if (moves[0]) {
            actions.reset();
            void connector.bindings.play(moves[0]);
            return;
          }
          const selected = context.legalMoves.some((move) => move.startsWith(square))
            ? square
            : null;
          const targets = R.map(
            R.filter(context.legalMoves, (move) => move.startsWith(selected ?? '-')),
            (move) => move.slice(2, 4),
          );
          connector.setState((value) => {
            return R.pipe(value, R.set('selected', selected), R.set('targets', targets));
          });
        },
        promote: (piece: 'q' | 'r' | 'b' | 'n'): void => {
          const state = connector.getState();
          if (!connector.isActive() || !state.context || state.context.disabled) {
            return;
          }
          const move = R.find(
            state.promotion,
            (candidate) =>
              candidate.endsWith(piece) && state.context!.legalMoves.includes(candidate),
          );
          if (!move) {
            return;
          }
          actions.reset();
          void connector.bindings.play(move);
        },
        cancelPromotion: (): void => {
          connector.setState(R.set('promotion', []));
        },
        reset: (): void => {
          connector.setState((state) => {
            return R.pipe(
              state,
              R.set('selected', null),
              R.set('targets', []),
              R.set('promotion', []),
            );
          });
        },
      };
      return actions;
    },
  };
}

function sameContext(left: BoardContext | null, right: BoardContext | null): boolean {
  if (!left || !right) {
    return left === right;
  }
  return (
    left.key === right.key &&
    left.fen === right.fen &&
    left.color === right.color &&
    left.disabled === right.disabled &&
    left.lastMove === right.lastMove &&
    left.checkSquare === right.checkSquare &&
    R.isDeepEqual(left.legalMoves, right.legalMoves)
  );
}

function pieces(fen: string): Readonly<Record<string, string>> {
  const result: Record<string, string> = {};
  fen
    .split(' ')[0]!
    .split('/')
    .forEach((row, index) => {
      let file = 0;
      for (const value of row) {
        if (/\d/.test(value)) {
          file += Number(value);
        } else {
          result['abcdefgh'[file]! + String(8 - index)] = value;
          file += 1;
        }
      }
    });
  return result;
}
