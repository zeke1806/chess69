import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, layout, typography, fontFamilies } from './theme';

export type ChoiceProps = Readonly<{ label: string; selected: boolean; onPress: () => void }>;

export function Choice({ label, selected, onPress }: ChoiceProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.choice, selected && styles.selected]}
    >
      <Text style={[layout.body, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  choice: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: 18,
    justifyContent: 'center',
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  selectedLabel: {
    color: colors.onPrimary,
    fontFamily: fontFamilies.semibold,
    fontWeight: 'normal',
  },
});
