import type { ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import atlasUrl from './assets/illustrations.png?url';
import { ChessPiece } from '../../src/ui/components/business/chess-piece';
import { NavigationIcon } from '../../src/ui/components/business/navigation-icon';
import { palette as p } from './palette';

export type IllustrationKind = 'knight' | 'book' | 'puzzle' | 'rook';
const atlasCells = { knight: [0, 0], book: [1, 0], puzzle: [0, 1], rook: [1, 1] } as const;

export function Illustration({
  kind,
  size = 84,
}: Readonly<{ kind: IllustrationKind; size?: number }>) {
  const [column, row] = atlasCells[kind];
  return (
    <View accessible={false} style={{ width: size, height: size, overflow: 'hidden' }}>
      <Image
        source={{ uri: atlasUrl }}
        resizeMode="stretch"
        style={{
          position: 'absolute',
          width: size * 2,
          height: size * 2,
          left: -column * size,
          top: -row * size,
        }}
      />
    </View>
  );
}

export function DesignButton({
  label,
  onPress,
  secondary = false,
  disabled = false,
}: Readonly<{ label: string; onPress: () => void; secondary?: boolean; disabled?: boolean }>) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        { opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
      ]}
    >
      <Text style={[styles.buttonText, secondary && { color: p.ink }]}>{label}</Text>
    </Pressable>
  );
}

export function DesignCard({
  children,
  selected = false,
  onPress,
}: Readonly<{ children: ReactNode; selected?: boolean; onPress?: () => void }>) {
  const style = [styles.card, selected && styles.selected];
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={onPress}
        style={({ pressed }) => [...style, { opacity: pressed ? 0.85 : 1 }]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={style}>{children}</View>;
}

export function DesignBubble({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <View style={styles.bubble}>
      <View style={styles.bubbleTip} />
      {children}
    </View>
  );
}

const initialPieces: Readonly<Record<string, string>> = Object.fromEntries([
  ...'rnbqkbnr'.split('').map((piece, index) => [`${'abcdefgh'[index]}8`, piece]),
  ...'abcdefgh'.split('').flatMap((file) => [
    [`${file}7`, 'p'],
    [`${file}2`, 'P'],
  ]),
  ...'RNBQKBNR'.split('').map((piece, index) => [`${'abcdefgh'[index]}1`, piece]),
]);
const middlePieces = {
  ...initialPieces,
  e2: '',
  e7: '',
  g1: '',
  b8: '',
  f1: '',
  e4: 'P',
  e5: 'p',
  f3: 'N',
  c6: 'n',
  c4: 'B',
};
const pieceNames: Readonly<Record<string, string>> = {
  p: 'pion',
  n: 'cavalier',
  b: 'fou',
  r: 'tour',
  q: 'dame',
  k: 'roi',
};

export function DesignBoard({
  compact = false,
  selected,
  onSelect,
  view = 'middle',
}: Readonly<{
  compact?: boolean;
  selected?: string;
  onSelect?: (square: string) => void;
  view?: 'initial' | 'middle';
}>) {
  const pieces: Readonly<Record<string, string>> =
    view === 'initial' ? initialPieces : middlePieces;
  return (
    <View style={{ width: '100%', borderRadius: 12, overflow: 'hidden' }}>
      {'87654321'.split('').map((rank, row) => (
        <View key={rank} style={{ flexDirection: 'row' }}>
          {'abcdefgh'.split('').map((file, column) => {
            const square = file + rank;
            const piece = pieces[square];
            const dark = (row + column) % 2 === 1;
            return (
              <Pressable
                key={square}
                accessibilityRole="button"
                accessibilityLabel={`${square}${piece ? `, ${piece === piece.toUpperCase() ? 'blanc' : 'noir'} ${pieceNames[piece.toLowerCase()]}` : ', vide'}`}
                accessibilityState={{ selected: square === selected, disabled: !onSelect }}
                disabled={!onSelect}
                onPress={() => onSelect?.(square)}
                style={{
                  width: '12.5%',
                  aspectRatio: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor:
                    square === selected ? p.accent : dark ? p.boardDark : p.boardLight,
                }}
              >
                {piece && <ChessPiece piece={piece} size={compact ? 15 : 32} />}
                {!compact && column === 0 && (
                  <Text
                    style={{
                      position: 'absolute',
                      top: 2,
                      left: 3,
                      fontSize: 10,
                      color: dark ? '#F0EDE5' : '#354332',
                    }}
                  >
                    {rank}
                  </Text>
                )}
                {!compact && row === 7 && (
                  <Text
                    style={{
                      position: 'absolute',
                      bottom: 1,
                      right: 3,
                      fontSize: 10,
                      color: dark ? '#F0EDE5' : '#354332',
                    }}
                  >
                    {file}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export type DesignDestination = 'home' | 'learn' | 'play' | 'progress';
const destinations = [
  { id: 'home', label: 'Accueil', kind: 'knight' },
  { id: 'learn', label: 'Apprendre', kind: 'book' },
  { id: 'play', label: 'Jouer', kind: 'rook' },
  { id: 'progress', label: 'Progrès', kind: 'puzzle' },
] as const;

export function DesignNavigation({
  active,
  onNavigate,
}: Readonly<{ active: DesignDestination; onNavigate: (destination: DesignDestination) => void }>) {
  return (
    <View accessibilityRole="tablist" style={styles.navigation}>
      {destinations.map((destination) => (
        <Pressable
          key={destination.id}
          accessibilityRole="tab"
          accessibilityLabel={destination.label}
          accessibilityState={{ selected: destination.id === active }}
          onPress={() => onNavigate(destination.id)}
          style={[styles.navItem, destination.id === active && styles.navSelected]}
        >
          <Illustration kind={destination.kind} size={38} />
          <Text
            style={{
              color: destination.id === active ? p.accent : p.muted,
              fontSize: 11,
              fontWeight: '600',
            }}
          >
            {destination.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function DesignArrow({ color = p.onAccent }: Readonly<{ color?: string }>) {
  return (
    <View style={{ transform: [{ rotate: '180deg' }] }}>
      <NavigationIcon kind="back" color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: p.accent,
  },
  secondary: { backgroundColor: p.raised },
  buttonText: { fontSize: 16, lineHeight: 22, fontWeight: '700', color: p.onAccent },
  card: {
    backgroundColor: p.card,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: p.border,
    borderBottomWidth: 5,
    gap: 8,
  },
  selected: { backgroundColor: p.selected, borderColor: p.accent },
  bubble: { backgroundColor: p.raised, borderRadius: 20, padding: 16, gap: 8, marginTop: 6 },
  bubbleTip: {
    position: 'absolute',
    top: -6,
    left: 24,
    width: 14,
    height: 14,
    backgroundColor: p.raised,
    transform: [{ rotate: '45deg' }],
  },
  navigation: {
    flexDirection: 'row',
    backgroundColor: p.card,
    borderRadius: 26,
    padding: 5,
    margin: 12,
    marginTop: 8,
  },
  navItem: {
    flex: 1,
    minHeight: 66,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  navSelected: { backgroundColor: p.selected },
});
