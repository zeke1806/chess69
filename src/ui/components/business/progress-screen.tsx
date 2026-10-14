import { Text, View } from 'react-native';
import { Button } from '../common/button';
import { ActionRow } from '../common/action-row';
import { colors, layout } from '../common/theme';
import { screenStyles as styles } from './screen-styles';
import type { ProgressionState } from '../../../services/progression/progression-types';
import { kindLabels } from './presentation-labels';

type ScreenProps = Readonly<{
  state: ProgressionState;
  onExercise: (id: string, color?: 'w' | 'b') => void;
  onHistory: () => void;
}>;

export function ProgressScreen({ state, onExercise, onHistory }: ScreenProps) {
  const summary = state.summary;
  if (!summary) {
    return null;
  }
  return (
    <View style={layout.stack}>
      <Text style={layout.title}>Votre progression</Text>
      <Text style={layout.body}>
        {summary.streak} jour{summary.streak === 1 ? '' : 's'} de suite ·{' '}
        {summary.activeDays.length} jour{summary.activeDays.length === 1 ? '' : 's'} actif
        {summary.activeDays.length === 1 ? '' : 's'}
      </Text>
      <Text style={layout.section}>Résultats d’apprentissage</Text>
      {(['opening', 'puzzle', 'endgame'] as const).map((kind) => (
        <View style={styles.statRow} key={kind}>
          <Text style={layout.body}>{kindLabels[kind]}</Text>
          <Text style={layout.muted}>
            {summary.byKind[kind].success} sans aide · {summary.byKind[kind].assisted} avec aide ·{' '}
            {summary.byKind[kind].failed} à revoir
          </Text>
        </View>
      ))}
      <Text style={layout.body}>
        {summary.toReview} exercice{summary.toReview === 1 ? '' : 's'} à retravailler ·{' '}
        {summary.finishedGames} partie{summary.finishedGames === 1 ? '' : 's'} terminée
        {summary.finishedGames === 1 ? '' : 's'}
      </Text>
      <Text style={layout.section}>Mémoire des ouvertures</Text>
      <Text style={layout.body}>
        {summary.mastered} variante{summary.mastered === 1 ? '' : 's'} consolidée
        {summary.mastered === 1 ? '' : 's'} · {summary.learning} en apprentissage
      </Text>
      <Text style={layout.muted}>
        Consolidée : trois révisions consécutives sans aide. Échéances après réussite : 1, 3, 7, 14
        puis 30 jours. Une erreur remet la variante au premier palier.
      </Text>
      {summary.due.length ? (
        <>
          <Text style={layout.section}>Révisions dues</Text>
          {summary.due.map((review) => (
            <ActionRow
              key={`${review.contentId}:${review.color ?? 'w'}`}
              title={state.titles[review.contentId] ?? 'Variante à réviser'}
              detail={`${review.color === 'b' ? 'Noirs' : 'Blancs'} · Palier ${review.stage} · échéance ${new Date(review.due).toLocaleDateString('fr-FR')}`}
              onPress={() => onExercise(review.contentId, review.color)}
            />
          ))}
        </>
      ) : (
        <Text style={layout.body}>
          Aucune révision due. Entraînez une variante de mémoire pour lancer son calendrier.
        </Text>
      )}
      <Text style={layout.section}>Activité quotidienne</Text>
      {summary.activeDays.length === 0 ? (
        <Text style={layout.body}>
          Terminez un exercice ou une partie pour enregistrer votre première journée.
        </Text>
      ) : (
        summary.activeDays
          .slice(-14)
          .reverse()
          .map((day) => (
            <View key={day} style={styles.statRow}>
              <Text style={layout.body}>{day.split('-').reverse().join('/')}</Text>
              <Text style={[layout.muted, { color: colors.success }]}>Journée active</Text>
            </View>
          ))
      )}
      <Button label="Consulter l’historique des parties" secondary onPress={onHistory} />
      <Text style={layout.muted}>
        Cette progression appartient à cette installation. Gardez Chess69 installé lors des mises à
        jour.
      </Text>
    </View>
  );
}
