import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, layout, typography, fontFamilies } from './theme';

export type ActionRowProps = Readonly<{
  title: string;
  detail: string;
  illustration?: ReactNode;
  onPress: () => void;
}>;

export function ActionRow({ title, detail, illustration, onPress }: ActionRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      android_ripple={{ color: '#FFFFFF20' }}
      style={styles.action}
    >
      {illustration}
      <Text style={styles.title}>{title}</Text>
      <Text style={layout.muted}>{detail}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  action: {
    minHeight: 64,
    padding: 16,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 5,
    borderColor: colors.outline,
    gap: 4,
  },
  title: {
    ...typography,
    color: colors.onSurface,
    fontSize: 18,
    lineHeight: 26,
    fontFamily: fontFamilies.semibold,
    fontWeight: 'normal',
  },
});
