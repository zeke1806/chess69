import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChessPiece } from './chess-piece';
import { colors, layout, fontFamilies } from '../common/theme';
import type { GameState } from '../../../services/game/game-types';
import { levels } from './presentation-labels';

type ScreenProps = Readonly<{
  state: Pick<GameState, 'history'>;
  onAnalysis: (id: string) => void;
}>;

export function HistoryScreen({ state, onAnalysis }: ScreenProps) {
  return (
    <View style={layout.stack}>
      <Text style={layout.title}>Vos parties</Text>
      {state.history.length === 0 && (
        <Text style={layout.body}>
          Vos parties terminées apparaîtront ici. Jouez une partie contre Stockfish pour commencer.
        </Text>
      )}
      {state.history.map((session) => (
        <Pressable
          key={session.record.id}
          accessibilityRole="button"
          accessibilityLabel={`Revoir la partie : ${session.record.result ?? 'Partie'}, ${levels[session.record.level]}`}
          onPress={() => onAnalysis(session.record.id)}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
          <View style={styles.main}>
            <View
              style={styles.miniBoard}
              accessible
              accessibilityLabel="Position finale de la partie"
            >
              {[...'87654321'].map((rank) => (
                <View key={rank} style={styles.rank}>
                  {[...'abcdefgh'].map((file, column) => {
                    const piece = session.position.board.find(
                      (item) => item.square === file + rank,
                    );
                    return (
                      <View
                        key={file}
                        style={[
                          styles.square,
                          {
                            backgroundColor:
                              (Number(rank) + column) % 2 === 1
                                ? colors.boardDark
                                : colors.boardLight,
                          },
                        ]}
                      >
                        {piece && (
                          <ChessPiece
                            piece={piece.color === 'w' ? piece.type.toUpperCase() : piece.type}
                            size={13}
                          />
                        )}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
            <View style={styles.copy}>
              <Text style={[layout.body, styles.result]}>{session.record.result ?? 'Partie'}</Text>
              <Text style={layout.body}>{levels[session.record.level]}</Text>
              <Text style={layout.muted}>
                {new Date(session.record.startedAt).toLocaleDateString('fr-FR')} ·{' '}
                {session.record.moves.length} demi-coups
              </Text>
            </View>
          </View>
          <Text style={styles.action}>Revoir la partie</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainer,
    padding: 18,
    borderRadius: 24,
    gap: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  pressed: { opacity: 0.85 },
  main: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  copy: { flex: 1, gap: 4 },
  miniBoard: { width: 112, borderRadius: 10, overflow: 'hidden' },
  rank: { flexDirection: 'row' },
  square: { width: '12.5%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  result: {
    fontSize: 21,
    lineHeight: 28,
    fontFamily: fontFamilies.bold,
    fontWeight: 'normal',
    color: colors.primary,
  },
  action: { color: colors.primary, fontFamily: fontFamilies.regular, fontSize: 14, lineHeight: 21 },
});
