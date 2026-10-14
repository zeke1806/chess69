import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { HelpDisclosure } from '../common/help-disclosure';
import { Illustration } from './illustration';
import { Choice } from '../common/choice';
import { ActionRow } from '../common/action-row';
import { colors, layout, fontFamilies } from '../common/theme';
import type { LearningState, LearningActions } from '../../../services/learning/learning-types';
import { kindLabels } from './presentation-labels';

type ScreenProps = Readonly<{
  help?: Readonly<{ expanded: boolean; onToggle: () => void }>;
  state: LearningState;
  actions: Pick<LearningActions, 'filter' | 'openOpening' | 'startExercise'>;
}>;

export function LearnScreen({ state, actions, help }: ScreenProps) {
  const themes = state.themes;
  return (
    <View style={layout.stack}>
      <Text accessibilityRole="header" style={layout.title}>
        Apprendre
      </Text>
      <View style={local.categories}>
        {(['opening', 'puzzle', 'endgame'] as const).map((kind) => (
          <Pressable
            key={kind}
            accessibilityRole="radio"
            accessibilityState={{ checked: state.kind === kind }}
            onPress={() => actions.filter(kind)}
            style={({ pressed }) => [
              local.category,
              state.kind === kind && local.selectedCategory,
              pressed && local.pressed,
            ]}
          >
            <Illustration
              kind={kind === 'opening' ? 'book' : kind === 'puzzle' ? 'puzzle' : 'rook'}
              size={54}
            />
            <Text
              style={[
                layout.muted,
                local.categoryLabel,
                state.kind === kind && local.selectedLabel,
              ]}
            >
              {kindLabels[kind]}
            </Text>
          </Pressable>
        ))}
      </View>
      {state.kind === 'opening' ? (
        <>
          <Text style={layout.section}>À découvrir</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={local.rail}
          >
            {state.openings.map((opening) => (
              <View key={opening.id} style={local.course}>
                <ActionRow
                  key={opening.id}
                  illustration={<Illustration kind="book" size={76} />}
                  title={opening.title}
                  detail={`${opening.variationIds.length} variantes`}
                  onPress={() => actions.openOpening(opening.id)}
                />
              </View>
            ))}
          </ScrollView>
        </>
      ) : (
        <>
          <Text style={layout.body}>Trouvez toute la suite.</Text>
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
      <HelpDisclosure expanded={help?.expanded ?? true} onToggle={help?.onToggle ?? (() => {})}>
        <Text style={layout.body}>
          {state.kind === 'opening'
            ? 'Explorez les idées d’une ouverture, puis entraînez votre camp de mémoire.'
            : 'Votre adversaire répond automatiquement. Un indice ou une solution reste une tentative avec aide.'}
        </Text>
      </HelpDisclosure>
    </View>
  );
}

const local = StyleSheet.create({
  categories: { flexDirection: 'row', gap: 8 },
  category: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.outline,
    borderBottomWidth: 5,
  },
  selectedCategory: { backgroundColor: colors.surfaceHigh, borderColor: colors.primary },
  categoryLabel: {
    fontSize: 13,
    fontFamily: fontFamilies.bold,
    fontWeight: 'normal',
    textAlign: 'center',
  },
  selectedLabel: { color: colors.onSurface },
  pressed: { opacity: 0.8 },
  rail: { gap: 12, paddingBottom: 8 },
  course: { width: 198, gap: 6 },
});
