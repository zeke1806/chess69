import type { Exercise, Opening } from '../../services-business/catalogue/catalogue-types';
import type { LearningSnapshot } from '../../services-business/learning/learning-types';
import type { RulesPosition } from '../../services-business/adapters/rules/rules-types';
import type { StatefulService, ContextLease } from '../adapters/stateful/stateful-types';
export type LearningState = Readonly<{
  kind: Exercise['kind'];
  theme: string | null;
  difficulty: Exercise['difficulty'] | null;
  themes: readonly string[];
  catalogue: readonly Exercise[];
  openings: readonly Opening[];
  opening: Opening | null;
  openingExercises: readonly Readonly<{ id: string; title: string }>[];
  color: 'w' | 'b';
  session: LearningSnapshot | null;
  selectedPly: number;
  position: RulesPosition | null;
  busy: boolean;
  message: string | null;
  error: string | null;
}>;
export type LearningActions = Readonly<{
  filter: (
    kind: Exercise['kind'],
    theme?: string | null,
    difficulty?: Exercise['difficulty'] | null,
  ) => void;
  openOpening: (id: string) => void;
  changeColor: (color: 'w' | 'b') => void;
  startExercise: (id: string, color?: 'w' | 'b', mode?: 'guided' | 'memory') => void;
  move: (move: string) => Promise<void>;
  hint: () => void;
  reveal: () => Promise<void>;
  selectPly: (ply: number) => void;
  retry: () => Promise<void>;
  leave: () => void;
}>;

export type LearningUiService = StatefulService<LearningState, LearningActions, LearningBindings>;
export type LearningBindings = Readonly<{
  enter: (page: 'opening' | 'exercise' | 'list') => ContextLease;
  refreshGlobal: () => Promise<void>;
}>;
