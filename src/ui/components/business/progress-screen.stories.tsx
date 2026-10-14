import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import * as R from 'remeda';
import { ProgressScreen } from './progress-screen';
import { progressionState, emptySummary, noop } from '../../../../.storybook/fixtures';

const meta = {
  title: 'Business/ProgressScreen',
  component: ProgressScreen,
  args: { state: progressionState, onExercise: noop, onHistory: noop },
} satisfies Meta<typeof ProgressScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Activity = { parameters: { smoke: { text: 'Révisions dues' } } } satisfies Story;

export const Empty = {
  args: { state: R.set(progressionState, 'summary', emptySummary) },
  parameters: { smoke: { text: 'Aucune révision due' } },
} satisfies Story;
