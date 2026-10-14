import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { Button } from '../common/button';
import { Panel } from '../common/panel';
import { HelpDisclosure } from '../common/help-disclosure';
import { colors, layout } from '../common/theme';
import type { LearningState, LearningActions } from '../../../services/learning/learning-types';

type ScreenProps = Readonly<{
  state: LearningState;
  actions: Pick<LearningActions, 'selectPly' | 'hint' | 'reveal' | 'startExercise'>;
  board: ReactNode;
  help?: Readonly<{ expanded: boolean; onToggle: () => void }>;
}>;

export function ExerciseScreen({ state, actions, board, help }: ScreenProps) {
  const session = state.session;
  if (!session) {
    return null;
  }
  const done = session.status !== 'playing';
  return (
    <View style={layout.stack}>
      <Text style={layout.title}>{session.exercise.title}</Text>
      <Text style={layout.muted}>
        {session.exercise.theme} · {session.mode === 'guided' ? 'Mode guidé' : 'De mémoire'} ·{' '}
        {session.color === 'w' ? 'Blancs' : 'Noirs'}
      </Text>
      {board}
      <View style={styles.bubble}>
        <Text style={layout.body}>{session.exercise.objective}</Text>
      </View>
      {session.mode === 'guided' && (
        <>
          <View style={styles.transport}>
            <Button
              label="Précédent"
              secondary
              disabled={state.selectedPly === 0}
              onPress={() => actions.selectPly(state.selectedPly - 1)}
            />
            <Text style={layout.body}>
              {state.selectedPly} / {session.exercise.moves.length}
            </Text>
            <Button
              label="Suivant"
              secondary
              disabled={state.selectedPly === session.exercise.moves.length}
              onPress={() => actions.selectPly(state.selectedPly + 1)}
            />
          </View>
          {session.exercise.notes?.[Math.max(0, state.selectedPly - 1)] && (
            <Text style={layout.body}>
              {session.exercise.notes[Math.max(0, state.selectedPly - 1)]}
            </Text>
          )}
        </>
      )}
      {session.expectedMove && (
        <Text style={layout.body}>Coup du guide : {session.expectedMove}</Text>
      )}
      {state.message && (
        <Text accessibilityLiveRegion="polite" style={layout.body}>
          {state.message}
        </Text>
      )}
      {session.hint && (
        <Panel>
          <Text style={layout.body}>{session.hint}</Text>
        </Panel>
      )}
      {!done && (
        <View style={layout.stack}>
          <Button label="Un indice" secondary onPress={actions.hint} disabled={state.busy} />
          <Button
            label="Voir la solution"
            secondary
            onPress={actions.reveal}
            disabled={state.busy}
          />
        </View>
      )}
      {(done || session.mode === 'guided') &&
        (help ? (
          <HelpDisclosure expanded={help.expanded} onToggle={help.onToggle}>
            <Text style={layout.body}>{session.exercise.explanation}</Text>
            {done && <Text style={layout.body}>Suite : {session.exercise.moves.join(' · ')}</Text>}
          </HelpDisclosure>
        ) : (
          <Panel>
            <Text style={layout.section}>Comprendre la position</Text>
            <Text style={layout.body}>{session.exercise.explanation}</Text>
            {done && <Text style={layout.body}>Suite : {session.exercise.moves.join(' · ')}</Text>}
          </Panel>
        ))}
      {done && (
        <Button
          label="Rejouer de mémoire"
          onPress={() => actions.startExercise(session.exercise.id, session.color)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { backgroundColor: colors.surfaceHigh, padding: 16, borderRadius: 20 },
  transport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
});
