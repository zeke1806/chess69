import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { HelpDisclosure } from '../common/help-disclosure';
import { Illustration } from './illustration';
import { Button } from '../common/button';
import { Panel } from '../common/panel';
import { ActionRow } from '../common/action-row';
import { colors, layout } from '../common/theme';
import { screenStyles as styles } from './screen-styles';
import type { ProgressionState } from '../../../services/progression/progression-types';
import type { GameState } from '../../../services/game/game-types';
import type { Exercise } from '../../../services-business/catalogue/catalogue-types';

type ScreenProps = Readonly<{
  help?: Readonly<{ expanded: boolean; onToggle: () => void }>;
  state: ProgressionState & Pick<GameState, 'activeGame'>;
  events: Readonly<{
    onOnboard: () => void;
    onRecommended: () => void;
    onPractice: (kind: Exercise['kind']) => void;
    onResume: () => void;
    onPlay: () => void;
  }>;
}>;

export function HomeScreen({ state, events, help }: ScreenProps) {
  const summary = state.summary;
  const due = summary?.due ?? [];
  return (
    <View style={layout.stack}>
      <Text accessibilityRole="header" style={layout.title}>
        À vous de jouer.
      </Text>
      {state.onboarding && (
        <Panel>
          <Text style={layout.section}>Bienvenue à l’échiquier</Text>
          <Text style={layout.body}>Touchez une pièce, puis sa destination.</Text>
          <Button label="J’ai compris" onPress={events.onOnboard} disabled={state.busy} />
        </Panel>
      )}
      <View style={[styles.focus, local.hero]}>
        <View style={local.heroCopy}>
          <Text style={styles.focusTitle}>
            {due.length
              ? `${due.length} révision${due.length > 1 ? 's' : ''} à travailler`
              : 'Prêt à progresser ?'}
          </Text>
          <Text style={[layout.body, { color: colors.onPrimary }]}>
            {due.length
              ? 'Retrouvez les variantes arrivées à échéance.'
              : 'Découvrez une ouverture, puis testez votre mémoire.'}
          </Text>
        </View>
        <Illustration kind="knight" size={96} />
      </View>
      <Button
        label={due.length ? 'Commencer la révision' : 'Découvrir les ouvertures'}
        secondary
        onPress={events.onRecommended}
      />
      {state.activeGame && (
        <Panel>
          <Text style={layout.body}>Votre partie contre Stockfish vous attend.</Text>
          <Button label="Reprendre la partie" onPress={events.onResume} />
        </Panel>
      )}
      <Text style={layout.section}>Votre pratique</Text>
      <Text style={layout.body}>
        {summary?.successes ?? 0} réussites sans aide · {summary?.streak ?? 0} jour
        {summary?.streak === 1 ? '' : 's'} de suite
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={local.rail}
      >
        <View style={local.card}>
          <ActionRow
            illustration={<Illustration kind="puzzle" size={72} />}
            title="Résoudre un puzzle"
            detail="Calculer une séquence"
            onPress={() => events.onPractice('puzzle')}
          />
        </View>
        <View style={local.card}>
          <ActionRow
            illustration={<Illustration kind="rook" size={72} />}
            title="Travailler une finale"
            detail="Mats, pions et tours"
            onPress={() => events.onPractice('endgame')}
          />
        </View>
      </ScrollView>
      <ActionRow
        title="Jouer contre Stockfish"
        detail="Trois niveaux, sans pendule"
        onPress={events.onPlay}
      />
      <HelpDisclosure expanded={help?.expanded ?? true} onToggle={help?.onToggle ?? (() => {})}>
        <Text style={layout.body}>
          Touchez une pièce, puis sa destination. Les cases marquées indiquent les coups légaux.
          Apprenez avec le guide, puis rejouez de mémoire. Les résultats distinguent les réussites
          sans aide.
        </Text>
        <Text style={layout.muted}>
          Tout fonctionne sur ce téléphone, sans compte ni connexion. La progression est conservée
          après fermeture et mise à jour. Désinstaller ou effacer les données la supprime.
        </Text>
      </HelpDisclosure>
    </View>
  );
}

const local = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', borderRadius: 24 },
  heroCopy: { flex: 1, gap: 8 },
  rail: { gap: 12, paddingBottom: 8 },
  card: { width: 198, gap: 4 },
});
