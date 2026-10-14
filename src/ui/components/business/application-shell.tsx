import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Destination, ShellState } from '../../../services/orchestration/orchestration-types';
import { Button } from '../common/button';
import { colors, layout } from '../common/theme';
import { NavigationIcon } from './navigation-icon';
import { screenStyles as styles } from './screen-styles';

export type ApplicationShellProps = Readonly<{
  state: ShellState;
  logoSource: ImageSourcePropType;
  children?: ReactNode;
  onNavigate: (destination: Destination) => void;
  onBack: () => void;
  onRetry: () => void;
}>;

const destinationLabels = {
  home: 'Accueil',
  learn: 'Apprendre',
  play: 'Jouer',
  progress: 'Progrès',
};

const accessibilityDestinations = { ...destinationLabels, progress: 'Progression' };

export function ApplicationShell({
  state,
  logoSource,
  children,
  onNavigate,
  onBack,
  onRetry,
}: ApplicationShellProps) {
  const nested = state.route.page !== 'list';
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.topbar}>
        {nested ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retour"
            onPress={onBack}
            android_ripple={{ color: '#FFFFFF20' }}
            style={styles.backButton}
          >
            <NavigationIcon kind="back" color={colors.onSurface} />
          </Pressable>
        ) : (
          <Image source={logoSource} style={styles.logo} accessibilityLabel="Logo Chess69" />
        )}
        <Text accessibilityRole="header" numberOfLines={1} style={styles.brand}>
          {state.title}
        </Text>
        {nested ? (
          <Image source={logoSource} style={styles.smallLogo} accessibilityLabel="Logo Chess69" />
        ) : (
          <Text style={layout.muted}>v{state.version}</Text>
        )}
      </View>
      <ScrollView key={state.scrollKey} contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          {state.status === 'loading' && (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.primary} />
              <Text style={layout.body}>Préparation des données locales et du moteur…</Text>
            </View>
          )}
          {state.error && (
            <View accessibilityLiveRegion="polite" style={styles.error}>
              <Text style={[layout.body, { color: colors.error }]}>{state.error}</Text>
              <Button label="Réessayer" secondary onPress={onRetry} />
            </View>
          )}
          {state.status === 'ready' && children}
        </View>
      </ScrollView>
      <View accessibilityRole="tablist" style={styles.navigation}>
        {(Object.keys(destinationLabels) as Destination[]).map((destination) => (
          <Pressable
            key={destination}
            accessibilityRole="tab"
            accessibilityLabel={accessibilityDestinations[destination]}
            accessibilityState={{ selected: state.route.destination === destination }}
            onPress={() => onNavigate(destination)}
            android_ripple={{ color: '#FFFFFF20' }}
            style={styles.navItem}
          >
            <View
              collapsable={false}
              style={[
                styles.navIndicator,
                state.route.destination === destination && styles.navSelected,
              ]}
            >
              <NavigationIcon
                kind={destination}
                color={state.route.destination === destination ? colors.primary : colors.muted}
              />
            </View>
            <Text
              numberOfLines={1}
              style={[
                styles.navLabel,
                state.route.destination === destination && styles.navLabelSelected,
              ]}
            >
              {destinationLabels[destination]}
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}
