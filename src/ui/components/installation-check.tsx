import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type InstallationCheckProps = Readonly<{
  version: string;
  message: string;
  confirmed: boolean;
  onTest: () => void;
}>;

export const InstallationCheck = (
  { version, message, confirmed, onTest }: InstallationCheckProps,
) => (
  <SafeAreaView style={styles.screen}>
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        <View style={styles.identity}>
          <Text accessibilityRole="header" style={styles.heading}>Chess69</Text>
          <Text style={styles.version}>Version {version}</Text>
        </View>

        <View style={styles.interaction}>
          <Text
            accessibilityLiveRegion="polite"
            style={[styles.message, confirmed && styles.confirmedMessage]}
          >
            {message}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityHint="Affiche une confirmation pour vérifier le toucher."
            android_ripple={{ color: '#24150620' }}
            onPress={onTest}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          >
            <Text style={styles.buttonLabel}>Tester</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  </SafeAreaView>
);

const colors = {
  surface: '#111318',
  onSurface: '#F3F0E8',
  onSurfaceVariant: '#BCC1CC',
  primary: '#FF9F43',
  primaryPressed: '#E9892D',
  onPrimary: '#241506',
} as const;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 480,
    gap: 48,
  },
  identity: {
    gap: 8,
  },
  heading: {
    color: colors.onSurface,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
  },
  version: {
    color: colors.onSurfaceVariant,
    fontSize: 16,
    lineHeight: 24,
  },
  interaction: {
    gap: 16,
  },
  message: {
    color: colors.onSurface,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '500',
  },
  confirmedMessage: {
    color: colors.primary,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: colors.primary,
  },
  buttonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  buttonLabel: {
    color: colors.onPrimary,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
  },
});
