import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, layout, fontFamilies } from './theme';

export type HelpDisclosureProps = PropsWithChildren<
  Readonly<{
    expanded: boolean;
    onToggle: () => void;
    label?: string;
  }>
>;

export function HelpDisclosure({
  children,
  expanded,
  onToggle,
  label = 'Comprendre',
}: HelpDisclosureProps) {
  return (
    <View style={styles.disclosure}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={onToggle}
        style={styles.toggle}
      >
        <Text style={[layout.body, styles.label]}>{expanded ? 'Fermer l’aide' : label}</Text>
      </Pressable>
      {expanded && (
        <View style={styles.bubble}>
          <View style={styles.tip} />
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  disclosure: { gap: 6 },
  toggle: {
    minHeight: 48,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: colors.surfaceHigh,
  },
  label: { color: colors.primary, fontFamily: fontFamilies.semibold, fontWeight: 'normal' },
  bubble: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: 20,
    padding: 16,
    gap: 8,
    marginTop: 6,
  },
  tip: {
    position: 'absolute',
    top: -6,
    left: 24,
    width: 14,
    height: 14,
    backgroundColor: colors.surfaceHigh,
    transform: [{ rotate: '45deg' }],
  },
});
