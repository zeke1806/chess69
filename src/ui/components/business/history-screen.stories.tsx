import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { HistoryScreen } from './history-screen';
import { gameState, noop } from '../../../../.storybook/fixtures';

const meta = {
  title: 'Business/HistoryScreen',
  component: HistoryScreen,
  args: { state: gameState, onAnalysis: noop },
} satisfies Meta<typeof HistoryScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CompletedGames = { parameters: { smoke: { text: '1-0' } } } satisfies Story;

export const Empty = {
  args: { state: { history: [] } },
  parameters: { smoke: { text: 'Vos parties terminées apparaîtront ici' } },
} satisfies Story;
