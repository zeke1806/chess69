import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import * as R from 'remeda';
import { HomeScreen } from './home-screen';
import { progressionState, gameSession, emptySummary, noop } from '../../../../.storybook/fixtures';

const meta = {
  title: 'Business/Pages/HomeScreen',
  component: HomeScreen,
  args: {
    help: { expanded: false, onToggle: noop },
    state: { ...progressionState, activeGame: null },
    events: {
      onOnboard: noop,
      onRecommended: noop,
      onPractice: noop,
      onResume: noop,
      onPlay: noop,
    },
  },
} satisfies Meta<typeof HomeScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Revisions = {
  parameters: { smoke: { text: '1 révision à travailler' } },
} satisfies Story;

export const FirstLaunch = {
  args: {
    state: R.pipe(
      { ...progressionState, activeGame: null },
      R.set('onboarding', true),
      R.set('summary', emptySummary),
    ),
  },
  parameters: { smoke: { text: 'Bienvenue à l’échiquier' } },
} satisfies Story;

export const Resume = {
  args: { state: { ...progressionState, activeGame: gameSession } },
  parameters: { smoke: { text: 'Reprendre la partie' } },
} satisfies Story;

export const Help = {
  args: {
    help: {
      expanded: true,

      onToggle: () => {},
    },
  },
  parameters: { smoke: { text: 'Fermer l’aide' } },
} satisfies Story;
