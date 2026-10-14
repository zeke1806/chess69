import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Text } from 'react-native';
import { noop } from '../../../../.storybook/fixtures';
import { HelpDisclosure } from './help-disclosure';
import { layout } from './theme';

const meta = {
  title: 'Common/Containers/Help disclosure',
  component: HelpDisclosure,
  args: {
    expanded: false,
    onToggle: noop,
    children: <Text style={layout.body}>Les détails restent disponibles à la demande.</Text>,
  },
} satisfies Meta<typeof HelpDisclosure>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Collapsed: Story = { parameters: { smoke: { text: 'Comprendre' } } };
export const Expanded: Story = {
  args: { expanded: true },
  parameters: { smoke: { text: 'Les détails restent disponibles' } },
};
