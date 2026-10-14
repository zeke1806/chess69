import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import * as R from 'remeda';
import { LearnScreen } from './learn-screen';
import { learningState, learningActions, puzzles, endgames } from '../../../../.storybook/fixtures';

const meta = {
  title: 'Business/LearnScreen',
  component: LearnScreen,
  args: { state: learningState, actions: learningActions },
} satisfies Meta<typeof LearnScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Openings = { parameters: { smoke: { text: 'Partie italienne' } } } satisfies Story;

export const Puzzles = {
  args: { state: R.pipe(learningState, R.set('kind', 'puzzle'), R.set('catalogue', puzzles)) },
  parameters: { smoke: { text: 'Filtrer par difficulté' } },
} satisfies Story;

export const Endgames = {
  args: { state: R.pipe(learningState, R.set('kind', 'endgame'), R.set('catalogue', endgames)) },
  parameters: { smoke: { text: 'Filtrer par difficulté' } },
} satisfies Story;

export const Empty = {
  args: { state: R.pipe(learningState, R.set('kind', 'puzzle'), R.set('catalogue', [])) },
  parameters: { smoke: { text: 'Filtrer par difficulté' } },
} satisfies Story;
