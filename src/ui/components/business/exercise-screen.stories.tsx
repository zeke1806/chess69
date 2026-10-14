import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import * as R from 'remeda';
import { ExerciseScreen } from './exercise-screen';
import { learningState, learningActions } from '../../../../.storybook/fixtures';
import { Chessboard } from './chessboard';
import { boardState, boardActions } from '../../../../.storybook/fixtures';

const meta = {
  title: 'Business/Pages/ExerciseScreen',
  component: ExerciseScreen,
  args: {
    state: learningState,
    actions: learningActions,
    board: <Chessboard state={boardState} actions={boardActions} pieceSize={42} />,
  },
} satisfies Meta<typeof ExerciseScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Guided = {
  parameters: { smoke: { text: 'Coup du guide', svg: true } },
} satisfies Story;

export const Memory = {
  args: {
    state: R.pipe(
      learningState,
      R.setPath(['session', 'mode'], 'memory'),
      R.setPath(['session', 'expectedMove'], null),
    ),
  },
  parameters: { smoke: { text: 'De mémoire', svg: true } },
} satisfies Story;

export const Hint = {
  args: {
    state: R.setPath(learningState, ['session', 'hint'], 'Occupez le centre avec le pion e.'),
  },
  parameters: { smoke: { text: 'Occupez le centre', svg: true } },
} satisfies Story;

export const Completed = {
  args: {
    state: R.pipe(
      learningState,
      R.setPath(['session', 'status'], 'completed'),
      R.set('message', 'Bravo, la variante est réussie sans aide.'),
    ),
  },
  parameters: { smoke: { text: 'Bravo, la variante', svg: true } },
} satisfies Story;

export const Saving = {
  args: { state: R.set(learningState, 'busy', true) },
  parameters: { smoke: { text: 'Un indice', svg: true } },
} satisfies Story;
