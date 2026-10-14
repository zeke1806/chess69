import { expect, test } from '@jest/globals';

import { createChessJsRulesService } from '../../src/services-business/adapters/rules/chess-js-rules-service';

test('legal positions can be replayed with SAN history and special moves', () => {
  const rules = createChessJsRulesService();
  const moves = ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4', 'g8f6'];
  const castle = rules.play(undefined, moves, 'e1g1');
  expect(castle?.board).toEqual(
    expect.arrayContaining([
      { square: 'g1', type: 'k', color: 'w' },
      { square: 'f1', type: 'r', color: 'w' },
    ]),
  );
  expect(castle?.history.at(-1)).toBe('O-O');
  expect(rules.play(undefined, [], 'e2e5')).toBeNull();
});

test('en passant removes the captured pawn and promotions require a chosen piece', () => {
  const rules = createChessJsRulesService();
  const enPassant = rules.play(undefined, ['e2e4', 'a7a6', 'e4e5', 'd7d5'], 'e5d6');
  expect(enPassant?.history.at(-1)).toBe('exd6');
  expect(enPassant?.board.some((piece) => piece.square === 'd5')).toBe(false);
  const fen = '7k/P7/8/8/8/8/8/7K w - - 0 1';
  expect(rules.play(fen, [], 'a7a8')).toBeNull();
  for (const promotion of ['q', 'r', 'b', 'n']) {
    expect(rules.play(fen, [], `a7a8${promotion}`)?.board).toContainEqual({
      square: 'a8',
      type: promotion,
      color: 'w',
    });
  }
});

test.each([
  ['7k/6Q1/5K2/8/8/8/8/8 b - - 0 1', 'checkmate', '1-0'],
  ['7k/5K2/6Q1/8/8/8/8/8 b - - 0 1', 'stalemate', '1/2-1/2'],
  ['7k/8/8/8/8/8/8/7K w - - 0 1', 'insufficient-material', '1/2-1/2'],
  ['7k/8/8/8/8/8/8/R6K w - - 100 1', 'fifty-move', '1/2-1/2'],
])('terminal position %s is identified as %s', (fen, endReason, result) => {
  const position = createChessJsRulesService().position(fen);
  expect(position).toMatchObject({ endReason, result, legalMoves: [] });
});

test('replaying the complete move history detects threefold repetition', () => {
  const moves = ['g1f3', 'g8f6', 'f3g1', 'f6g8', 'g1f3', 'g8f6', 'f3g1', 'f6g8'];
  expect(createChessJsRulesService().position(undefined, moves)).toMatchObject({
    endReason: 'threefold-repetition',
    result: '1/2-1/2',
  });
});
