import { Text, View } from 'react-native';
import { HelpDisclosure } from '../common/help-disclosure';
import { Illustration } from './illustration';
import { Button } from '../common/button';
import { Choice } from '../common/choice';
import { Panel } from '../common/panel';
import { layout } from '../common/theme';
import type { LearningState, LearningActions } from '../../../services/learning/learning-types';

type ScreenProps = Readonly<{
  help?: Readonly<{ expanded: boolean; onToggle: () => void }>;
  state: LearningState;
  actions: Pick<LearningActions, 'changeColor' | 'startExercise'>;
}>;

export function OpeningScreen({ state, actions, help }: ScreenProps) {
  const color = state.color;
  const opening = state.opening;
  if (!opening) {
    return null;
  }
  return (
    <View style={layout.stack}>
      <Illustration kind="book" size={88} />
      <Text accessibilityRole="header" style={layout.title}>
        {opening.title}
      </Text>
      <View style={layout.row}>
        <Choice
          label="Travailler les blancs"
          selected={color === 'w'}
          onPress={() => actions.changeColor('w')}
        />
        <Choice
          label="Travailler les noirs"
          selected={color === 'b'}
          onPress={() => actions.changeColor('b')}
        />
      </View>
      <Text style={layout.section}>Les variantes</Text>
      {state.openingExercises.map((exercise) => {
        const id = exercise.id;
        return (
          <Panel key={id}>
            <Text style={layout.body}>{exercise?.title ?? id}</Text>
            <Button
              label="Explorer avec le guide"
              secondary
              onPress={() => actions.startExercise(id, color, 'guided')}
            />
            <Button
              label="Jouer de mémoire"
              onPress={() => actions.startExercise(id, color, 'memory')}
            />
          </Panel>
        );
      })}
      <HelpDisclosure expanded={help?.expanded ?? true} onToggle={help?.onToggle ?? (() => {})}>
        <Text style={layout.body}>{opening.description}</Text>
        <Text style={layout.section}>Les idées à retenir</Text>
        {opening.ideas.map((idea) => (
          <Text key={idea} style={layout.body}>
            • {idea}
          </Text>
        ))}
        <Text style={layout.section}>Les pièges à éviter</Text>
        {opening.mistakes.map((idea) => (
          <Text key={idea} style={layout.body}>
            • {idea}
          </Text>
        ))}
      </HelpDisclosure>
    </View>
  );
}
