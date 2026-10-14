import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { Button } from '../common/button';
import { HelpDisclosure } from '../common/help-disclosure';
import { colors, layout, fontFamilies } from '../common/theme';
import type { AnalysisState, AnalysisActions } from '../../../services/analysis/analysis-types';
import { levels } from './presentation-labels';

type ScreenProps = Readonly<{
  state: AnalysisState;
  actions: Pick<AnalysisActions, 'selectPly' | 'cancel' | 'analyze'>;
  board: ReactNode;
  help?: Readonly<{ expanded: boolean; onToggle: () => void }>;
}>;

export function AnalysisScreen({ state, actions, board, help }: ScreenProps) {
  const session = state.session;
  const details = state.details;
  if (!session || !state.position || !details) {
    return null;
  }
  return (
    <View style={layout.stack}>
      <Text style={layout.title}>Analyse de la partie</Text>
      <Text style={layout.muted}>
        {session.record.result} · {levels[session.record.level]} ·{' '}
        {new Date(session.record.startedAt).toLocaleDateString('fr-FR')}
      </Text>
      {board}
      <View style={styles.transport}>
        <Button
          label="Précédent"
          secondary
          disabled={state.selectedPly === 0}
          onPress={() => actions.selectPly(state.selectedPly - 1)}
        />
        <Text style={layout.body}>
          {state.selectedPly} / {session.record.moves.length}
        </Text>
        <Button
          label="Suivant"
          secondary
          disabled={state.selectedPly === session.record.moves.length}
          onPress={() => actions.selectPly(state.selectedPly + 1)}
        />
      </View>
      <View style={styles.insight}>
        <Text style={[layout.body, styles.evaluation]}>{details.evaluationMessage}</Text>
        {details.assessmentMessage && <Text style={layout.body}>{details.assessmentMessage}</Text>}
      </View>
      {details.bestMoveMessage && (
        <View style={styles.bubble}>
          <Text style={layout.body}>{details.bestMoveMessage}</Text>
        </View>
      )}
      <Text accessibilityLiveRegion="polite" style={layout.body}>
        {details.statusMessage}
      </Text>
      {state.analyzing ? (
        <Button label="Annuler l’analyse" secondary onPress={actions.cancel} />
      ) : (
        <Button
          label={details.actionLabel}
          onPress={actions.analyze}
          disabled={state.busy || state.view?.record.complete}
        />
      )}
      {help ? (
        <HelpDisclosure expanded={help.expanded} onToggle={help.onToggle}>
          {details.continuationMessage && (
            <Text style={layout.body}>{details.continuationMessage}</Text>
          )}
          <Text style={layout.muted}>
            Écarts : imprécision à partir de 0,5 pion, erreur à partir de 1 pion, grosse erreur à
            partir de 2 pions. Les annonces de mat sont traitées séparément. Une analyse rapide
            guide l’apprentissage ; ses évaluations peuvent varier avec le calcul.
          </Text>
        </HelpDisclosure>
      ) : (
        <View style={styles.bubble}>
          {details.continuationMessage && (
            <Text style={layout.body}>{details.continuationMessage}</Text>
          )}
          <Text style={layout.muted}>
            Écarts : imprécision à partir de 0,5 pion, erreur à partir de 1 pion, grosse erreur à
            partir de 2 pions. Les annonces de mat sont traitées séparément. Les évaluations peuvent
            varier avec le calcul.
          </Text>
        </View>
      )}
      <Text style={layout.section}>Les coups joués</Text>
      <View style={styles.moves}>
        {session.position.history.map((move, index) => (
          <Pressable
            key={index}
            accessibilityRole="button"
            accessibilityLabel={`Coup ${index + 1} : ${move}`}
            accessibilityState={{ selected: state.selectedPly === index + 1 }}
            onPress={() => actions.selectPly(index + 1)}
            style={[styles.move, state.selectedPly === index + 1 && styles.selectedMove]}
          >
            <Text style={[layout.muted, state.selectedPly === index + 1 && styles.selectedLabel]}>
              {Math.floor(index / 2) + 1}
              {index % 2 === 0 ? '.' : '…'}
            </Text>
            <Text style={[layout.body, state.selectedPly === index + 1 && styles.selectedLabel]}>
              {move}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  transport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  insight: { gap: 6, paddingVertical: 6 },
  evaluation: {
    color: colors.primary,
    fontFamily: fontFamilies.bold,
    fontWeight: 'normal',
    fontSize: 20,
    lineHeight: 28,
  },
  bubble: { backgroundColor: colors.surfaceHigh, padding: 16, borderRadius: 20, gap: 8 },
  moves: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  move: {
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceContainer,
  },
  selectedMove: { backgroundColor: colors.primary },
  selectedLabel: { color: colors.onPrimary },
});
