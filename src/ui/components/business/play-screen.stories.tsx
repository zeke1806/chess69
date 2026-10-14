import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import * as R from 'remeda';
import { PlayScreen } from './play-screen';
import { gameState, gameSession, gameActions } from '../../../../.storybook/fixtures';

const meta = {
  title: 'Business/Pages/PlayScreen',
  component: PlayScreen,
  args: {
    help: {
      expanded: false,

      onToggle: () => {},
    },
    state: gameState,
    actions: gameActions,
  },
} satisfies Meta<typeof PlayScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NewGame = { parameters: { smoke: { text: 'Commencer une partie' } } } satisfies Story;

export const Resume = {
  args: { state: R.set(gameState, 'activeGame', gameSession) },
  parameters: { smoke: { text: 'Reprendre ma partie' } },
} satisfies Story;

export const Creating = {
  args: { state: R.set(gameState, 'busy', true) },
  parameters: { smoke: { text: 'Commencer une partie' } },
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
