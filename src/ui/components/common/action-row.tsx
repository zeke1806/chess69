import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, layout } from './theme';

export type ActionRowProps = Readonly<{ title: string; detail: string; onPress: () => void }>;

export function ActionRow({ title, detail, onPress }: ActionRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      android_ripple={{ color: '#FFFFFF20' }}
      style={styles.action}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={layout.muted}>{detail}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  action: {
    minHeight: 64,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: colors.outline,
    gap: 4,
  },
  title: { color: colors.onSurface, fontSize: 18, lineHeight: 26, fontWeight: '600' },
});
