import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { BoardState, BoardActions } from '../../../services/board/board-types';
import { ChessPiece } from './chess-piece';
import { Button } from '../common/button';
import { colors, layout } from '../common/theme';

export type ChessboardProps = Readonly<{
  state: BoardState;
  actions: Pick<BoardActions, 'select' | 'promote' | 'cancelPromotion'>;
  pieceSize: number;
}>;

const names: Readonly<Record<string, string>> = {
  p: 'pion',
  n: 'cavalier',
  b: 'fou',
  r: 'tour',
  q: 'dame',
  k: 'roi',
};

const promotionLabels = [
  ['q', 'Dame'],
  ['r', 'Tour'],
  ['b', 'Fou'],
  ['n', 'Cavalier'],
] as const;

export function Chessboard({ state, actions, pieceSize }: ChessboardProps) {
  const context = state.context;
  if (!context) {
    return null;
  }
  const files = context.color === 'w' ? 'abcdefgh' : 'hgfedcba';
  const ranks = context.color === 'w' ? '87654321' : '12345678';
  return (
    <View style={styles.wrapper}>
      <Text style={[layout.muted, styles.turn]}>{state.turnMessage}</Text>
      <View
        style={styles.board}
        accessibilityLabel="Échiquier. Touchez une pièce, puis une case de destination."
      >
        {[...ranks].map((rank, row) => (
          <View style={styles.rank} key={rank}>
            {[...files].map((file, column) => {
              const square = file + rank;
              const piece = state.pieces[square];
              const isLast =
                context.lastMove?.slice(0, 2) === square ||
                context.lastMove?.slice(2, 4) === square;
              const dark = (Number(rank) + file.charCodeAt(0) - 97) % 2 === 1;
              return (
                <Pressable
                  key={square}
                  accessibilityRole="button"
                  accessibilityLabel={`${square}${piece ? `, ${piece === piece.toUpperCase() ? 'blanc' : 'noir'} ${names[piece.toLowerCase()]}` : ', vide'}${state.targets.includes(square) ? ', coup possible' : ''}${context.checkSquare === square ? ', roi en échec' : ''}`}
                  accessibilityState={{
                    selected: state.selected === square,
                    disabled: context.disabled,
                  }}
                  disabled={context.disabled}
                  onPress={() => actions.select(square)}
                  style={[
                    styles.square,
                    { backgroundColor: dark ? colors.boardDark : colors.boardLight },
                    isLast && styles.last,
                    state.selected === square && styles.selected,
                    context.checkSquare === square && styles.check,
                  ]}
                >
                  {column === 0 && (
                    <Text
                      style={[
                        styles.coordinate,
                        { color: dark ? colors.surface : colors.onPrimary },
                      ]}
                    >
                      {rank}
                    </Text>
                  )}
                  {row === 7 && (
                    <Text
                      style={[styles.file, { color: dark ? colors.surface : colors.onPrimary }]}
                    >
                      {file}
                    </Text>
                  )}
                  {piece && <ChessPiece piece={piece} size={pieceSize} />}
                  {state.targets.includes(square) && (
                    <View style={piece ? styles.capture : styles.dot} />
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
      <Modal
        visible={state.promotion.length > 0}
        transparent
        animationType="fade"
        onRequestClose={actions.cancelPromotion}
      >
        <View style={styles.scrim}>
          <View style={styles.dialog}>
            <Text style={layout.section}>Promouvoir le pion</Text>
            {promotionLabels.map(([piece, label]) => (
              <Button key={piece} label={label} onPress={() => actions.promote(piece)} />
            ))}
            <Button label="Annuler" secondary onPress={actions.cancelPromotion} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  turn: { alignSelf: 'flex-start' },
  board: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
  },
  rank: { flexDirection: 'row' },
  square: { width: '12.5%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  coordinate: { position: 'absolute', top: 1, left: 3, fontSize: 10, fontWeight: '700' },
  file: { position: 'absolute', bottom: 1, right: 3, fontSize: 10, fontWeight: '700' },
  selected: { backgroundColor: colors.boardSelected },
  last: { backgroundColor: colors.boardSelected },
  check: { backgroundColor: '#BF6057' },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#29231988',
    position: 'absolute',
  },
  capture: {
    position: 'absolute',
    width: '92%',
    height: '92%',
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  scrim: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#000000BB' },
  dialog: { backgroundColor: colors.surfaceContainer, padding: 24, borderRadius: 24, gap: 8 },
});
