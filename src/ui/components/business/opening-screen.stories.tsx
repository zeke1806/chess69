import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import * as R from 'remeda';
import { OpeningScreen } from './opening-screen';
import { learningState, learningActions } from '../../../../.storybook/fixtures';

const meta = {
  title: 'Business/Pages/OpeningScreen',
  component: OpeningScreen,
  args: {
    help: {
      expanded: false,

      onToggle: () => {},
    },
    state: learningState,
    actions: learningActions,
  },
} satisfies Meta<typeof OpeningScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const White = { parameters: { smoke: { text: 'Les variantes' } } } satisfies Story;

export const Black = {
  args: { state: R.set(learningState, 'color', 'b') },
  parameters: { smoke: { text: 'Travailler les noirs' } },
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
