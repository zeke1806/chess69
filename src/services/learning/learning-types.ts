import type { ChessColor } from '../../services-business/adapters/rules/rules-types';
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
  color: ChessColor;
  session: LearningSnapshot | null;
  selectedPly: number;
  position: RulesPosition | null;
  busy: boolean;
  message: string | null;
  error: string | null;
}>;
export interface LearningActions {
  readonly filter: (
    kind: Exercise['kind'],
    theme?: string | null,
    difficulty?: Exercise['difficulty'] | null,
  ) => void;
  readonly openOpening: (id: string) => void;
  readonly changeColor: (color: ChessColor) => void;
  readonly startExercise: (id: string, color?: ChessColor, mode?: 'guided' | 'memory') => void;
  readonly move: (move: string) => Promise<void>;
  readonly hint: () => void;
  readonly reveal: () => Promise<void>;
  readonly selectPly: (ply: number) => void;
  readonly retry: () => Promise<void>;
  readonly leave: () => void;
}

export interface LearningUiService extends StatefulService<
  LearningState,
  LearningActions,
  LearningBindings
> {}
export interface LearningBindings {
  readonly enter: (page: 'opening' | 'exercise' | 'list') => ContextLease;
  readonly refreshGlobal: () => Promise<void>;
}
