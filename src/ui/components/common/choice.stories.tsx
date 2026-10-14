import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Choice } from './choice';
import { noop } from '../../../../.storybook/fixtures';

const meta = {
  title: 'Common/Inputs/Choice',
  component: Choice,
  args: { label: 'Travailler les blancs', selected: false, onPress: noop },
} satisfies Meta<typeof Choice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Available = {
  parameters: { smoke: { text: 'Travailler les blancs' } },
} satisfies Story;

export const Selected = {
  args: { selected: true },
  parameters: { smoke: { text: 'Travailler les blancs', checked: true } },
} satisfies Story;
