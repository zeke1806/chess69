import { Text, View } from 'react-native';
import { Button } from '../common/button';
import { Choice } from '../common/choice';
import { Panel } from '../common/panel';
import { layout } from '../common/theme';
import type { LearningState, LearningActions } from '../../../services/learning/learning-types';

type ScreenProps = Readonly<{
  state: LearningState;
  actions: Pick<LearningActions, 'changeColor' | 'startExercise'>;
}>;

export function OpeningScreen({ state, actions }: ScreenProps) {
  const color = state.color;
  const opening = state.opening;
  if (!opening) {
    return null;
  }
  return (
    <View style={layout.stack}>
      <Text style={layout.title}>{opening.title}</Text>
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
    </View>
  );
}
