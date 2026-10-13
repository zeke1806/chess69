import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { PropsWithChildren } from 'react';
import { colors, layout } from './theme';

export function Button({ label, onPress, secondary = false, disabled = false }: Readonly<{ label: string; onPress: () => void; secondary?: boolean; disabled?: boolean }>) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} android_ripple={{ color: '#FFFFFF30' }} style={({ pressed }) => [styles.button, secondary && styles.secondary, disabled && styles.disabled, pressed && styles.pressed]}><Text style={[styles.label, secondary && styles.secondaryLabel]}>{label}</Text></Pressable>;
}
export function Choice({ label, selected, onPress }: Readonly<{ label: string; selected: boolean; onPress: () => void }>) {
  return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={onPress} style={[styles.choice, selected && styles.selected]}><Text style={[layout.body, selected && styles.selectedLabel]}>{label}</Text></Pressable>;
}
export function Panel({ children }: PropsWithChildren) { return <View style={layout.panel}>{children}</View>; }
const styles = StyleSheet.create({
  button: { minHeight: 52, paddingHorizontal: 20, paddingVertical: 14, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary, borderRadius: 28, overflow: 'hidden' },
  secondary: { backgroundColor: colors.surfaceHigh }, disabled: { opacity: 0.45 }, pressed: { opacity: 0.8 },
  label: { color: colors.onPrimary, fontSize: 16, lineHeight: 24, fontWeight: '700', textAlign: 'center' },
  secondaryLabel: { color: colors.onSurface },
  choice: { minHeight: 48, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: colors.outline, borderRadius: 12, justifyContent: 'center' },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary }, selectedLabel: { color: colors.onPrimary, fontWeight: '600' },
});
