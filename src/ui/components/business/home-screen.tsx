import { Text, View } from 'react-native';
import { Button } from '../common/button';
import { Panel } from '../common/panel';
import { ActionRow } from '../common/action-row';
import { colors, layout } from '../common/theme';
import { screenStyles as styles } from './screen-styles';
import type { ProgressionState } from '../../../services/progression/progression-types';
import type { GameState } from '../../../services/game/game-types';
import type { Exercise } from '../../../services-business/catalogue/catalogue-types';

type ScreenProps = Readonly<{
  state: ProgressionState & Pick<GameState, 'activeGame'>;
  events: Readonly<{
    onOnboard: () => void;
    onRecommended: () => void;
    onPractice: (kind: Exercise['kind']) => void;
    onResume: () => void;
    onPlay: () => void;
  }>;
}>;

export function HomeScreen({ state, events }: ScreenProps) {
  const summary = state.summary;
  const due = summary?.due ?? [];
  return (
    <View style={layout.stack}>
      <Text accessibilityRole="header" style={layout.title}>
        Votre prochain coup
      </Text>
      <Text style={layout.body}>Un peu de pratique aujourd’hui, de meilleurs réflexes demain.</Text>
      {state.onboarding && (
        <Panel>
          <Text style={layout.section}>Bienvenue à l’échiquier</Text>
          <Text style={layout.body}>
            Touchez une pièce, puis sa destination. Les cases marquées indiquent les coups légaux.
            Apprenez une ouverture avec le guide, puis rejouez-la de mémoire. Les indices vous
            aident, et le résultat distingue les réussites sans aide.
          </Text>
          <Button label="J’ai compris" onPress={events.onOnboard} disabled={state.busy} />
        </Panel>
      )}
      <View style={styles.focus}>
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
        <Button
          label={due.length ? 'Commencer la révision' : 'Découvrir les ouvertures'}
          secondary
          onPress={events.onRecommended}
        />
      </View>
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
      <ActionRow
        title="Résoudre un puzzle"
        detail="Calculer une séquence, comprendre une idée"
        onPress={() => events.onPractice('puzzle')}
      />
      <ActionRow
        title="Travailler une finale"
        detail="Mats, pions et tours"
        onPress={() => events.onPractice('endgame')}
      />
      <ActionRow
        title="Jouer contre Stockfish"
        detail="Trois niveaux, sans pendule"
        onPress={events.onPlay}
      />
      <Text style={layout.muted}>
        Tout fonctionne sur ce téléphone, sans compte ni connexion. La progression est conservée
        après fermeture et mise à jour. Désinstaller ou effacer les données la supprime.
      </Text>
    </View>
  );
}
