import { expect, test } from '@jest/globals';
import { Chess } from 'chess.js';
import { createCatalogueService } from '../../src/services-business/catalogue/catalogue-service';

test('le catalogue embarque huit répertoires, 24 variantes, 120 tactiques et 24 finales sans doublon', () => {
  const catalogue = createCatalogueService();
  expect(catalogue.openings()).toHaveLength(8);
  expect(catalogue.list({ kind: 'opening' })).toHaveLength(24);
  expect(catalogue.list({ kind: 'puzzle' })).toHaveLength(120);
  expect(catalogue.list({ kind: 'endgame' })).toHaveLength(24);
  expect(new Set(catalogue.list().map((e) => e.id)).size).toBe(168);
  expect(new Set(catalogue.list({ kind: 'puzzle' }).map((e) => e.fen)).size).toBe(120);
  for (const opening of catalogue.openings()) {
    expect(opening.variationIds.map((id) => catalogue.get(id)?.openingId)).toEqual([
      opening.id,
      opening.id,
      opening.id,
    ]);
  }
});

test('chaque position et chaque réponse prévue sont légales et atteignent le véritable objectif annoncé', () => {
  const catalogue = createCatalogueService();
  const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

  const material = (chess: Chess, side: 'w' | 'b') => {
    return chess
      .board()
      .flat()
      .reduce(
        (total, piece) =>
          total + (piece ? (piece.color === side ? 1 : -1) * values[piece.type] : 0),
        0,
      );
  };

  for (const exercise of catalogue.list()) {
    expect(exercise.objective.length).toBeGreaterThan(10);
    expect(exercise.explanation.length).toBeGreaterThan(40);
    const start = new Chess(exercise.fen);
    expect(
      new Chess(
        exercise.fen.replace(` ${start.turn()} `, ` ${start.turn() === 'w' ? 'b' : 'w'} `),
      ).isCheck(),
    ).toBe(false);
    const initial = material(start, exercise.side);
    for (const moves of [exercise.moves, ...exercise.alternatives]) {
      const chess = new Chess(exercise.fen);
      const played = moves.map((move) => chess.move(move));
      for (const move of played) {
        expect(move).toBeTruthy();
      }
      if (exercise.goal === 'checkmate') {
        expect(chess.isCheckmate()).toBe(true);
      }
      if (exercise.goal === 'win-material') {
        expect(material(chess, exercise.side) - initial).toBeGreaterThanOrEqual(1);
      }
      if (exercise.goal === 'promote') {
        expect(played.some((move) => move.color === exercise.side && Boolean(move.promotion))).toBe(
          true,
        );
      }
      if (exercise.kind === 'opening') {
        expect(exercise.notes).toHaveLength(moves.length);
      }
    }
  }
});

test('les six thèmes tactiques proposent chacun vingt positions et des filtres combinables', () => {
  const catalogue = createCatalogueService();
  for (const theme of [
    'Mat',
    'Fourchette',
    'Clouage',
    'Enfilade',
    'Attaque à la découverte',
    'Élimination du défenseur',
  ]) {
    expect(catalogue.list({ kind: 'puzzle', theme })).toHaveLength(20);
    const beginners = catalogue.list({ kind: 'puzzle', theme, difficulty: 'beginner' });
    expect(
      beginners.every((exercise) => exercise.theme === theme && exercise.difficulty === 'beginner'),
    ).toBe(true);
  }
  expect(catalogue.get('absent')).toBeUndefined();
  expect(catalogue.list({ theme: 'absent' })).toEqual([]);
  expect(
    catalogue.list({ kind: 'puzzle' }).every((exercise) => exercise.source?.license === 'CC0-1.0'),
  ).toBe(true);
});
