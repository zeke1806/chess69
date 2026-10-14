import { Text, View } from 'react-native';
import { Choice } from '../common/choice';
import { ActionRow } from '../common/action-row';
import { layout } from '../common/theme';
import type { LearningState, LearningActions } from '../../../services/learning/learning-types';
import { kindLabels } from './presentation-labels';

type ScreenProps = Readonly<{
  state: LearningState;
  actions: Pick<LearningActions, 'filter' | 'openOpening' | 'startExercise'>;
}>;

export function LearnScreen({ state, actions }: ScreenProps) {
  const themes = state.themes;
  return (
    <View style={layout.stack}>
      <Text accessibilityRole="header" style={layout.title}>
        Apprendre
      </Text>
      <View style={layout.row}>
        {(['opening', 'puzzle', 'endgame'] as const).map((kind) => (
          <Choice
            key={kind}
            label={kindLabels[kind]}
            selected={state.kind === kind}
            onPress={() => actions.filter(kind)}
          />
        ))}
      </View>
      {state.kind === 'opening' ? (
        <>
          <Text style={layout.body}>
            Explorez les idées d’une ouverture, puis entraînez votre camp de mémoire.
          </Text>
          {state.openings.map((opening) => (
            <ActionRow
              key={opening.id}
              title={opening.title}
              detail={`${opening.variationIds.length} variantes · ${opening.description}`}
              onPress={() => actions.openOpening(opening.id)}
            />
          ))}
        </>
      ) : (
        <>
          <Text style={layout.body}>
            Trouvez toute la suite. Votre adversaire répond automatiquement. Un indice ou une
            solution reste une tentative avec aide.
          </Text>
          <Text style={layout.muted}>Filtrer par difficulté</Text>
          <View style={layout.row}>
            <Choice
              label="Toutes"
              selected={!state.difficulty}
              onPress={() => actions.filter(state.kind, state.theme, null)}
            />
            <Choice
              label="Débutant"
              selected={state.difficulty === 'beginner'}
              onPress={() => actions.filter(state.kind, state.theme, 'beginner')}
            />
            <Choice
              label="Intermédiaire"
              selected={state.difficulty === 'intermediate'}
              onPress={() => actions.filter(state.kind, state.theme, 'intermediate')}
            />
          </View>
          <Text style={layout.muted}>Filtrer par thème</Text>
          <View style={layout.row}>
            <Choice
              label="Tous"
              selected={!state.theme}
              onPress={() => actions.filter(state.kind, null, state.difficulty)}
            />
            {themes.map((theme) => (
              <Choice
                key={theme}
                label={theme}
                selected={state.theme === theme}
                onPress={() => actions.filter(state.kind, theme, state.difficulty)}
              />
            ))}
          </View>
          <Text style={layout.section}>{state.catalogue.length} exercices</Text>
          {state.catalogue.length === 0 && (
            <Text style={layout.body}>
              Aucun exercice avec ces filtres. Choisissez « Tous » et « Toutes ».
            </Text>
          )}
          {state.catalogue.map((exercise) => (
            <ActionRow
              key={exercise.id}
              title={exercise.title}
              detail={`${exercise.theme} · ${exercise.difficulty === 'beginner' ? 'Débutant' : 'Intermédiaire'}`}
              onPress={() => actions.startExercise(exercise.id)}
            />
          ))}
        </>
      )}
    </View>
  );
}
