import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Button } from './button';
import { noop } from '../../../../.storybook/fixtures';

const meta = {
  title: 'Common/Buttons/Button',
  component: Button,
  args: { label: 'Commencer une partie', onPress: noop },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary = { parameters: { smoke: { text: 'Commencer une partie' } } } satisfies Story;

export const Secondary = {
  args: { secondary: true },
  parameters: { smoke: { text: 'Commencer une partie' } },
} satisfies Story;

export const Disabled = {
  args: { disabled: true },
  parameters: { smoke: { text: 'Commencer une partie', disabled: true } },
} satisfies Story;

export const LongLabel = {
  args: { label: 'Revenir à l’accueil · partie sauvegardée' },
  parameters: { smoke: { text: 'Revenir à l’accueil' } },
} satisfies Story;
