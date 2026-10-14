import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from './theme';

export type ButtonProps = Readonly<{
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}>;

export function Button({ label, onPress, secondary = false, disabled = false }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      android_ripple={{ color: '#FFFFFF30' }}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, secondary && styles.secondaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    paddingHorizontal: 20,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 28,
    overflow: 'hidden',
  },
  secondary: { backgroundColor: colors.surfaceHigh },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.8 },
  label: {
    color: colors.onPrimary,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  secondaryLabel: { color: colors.onSurface },
});
