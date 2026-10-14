import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Panel } from './panel';
import { Text } from 'react-native';
import { layout } from './theme';

const meta = {
  title: 'Common/Containers/Panel',
  component: Panel,
  args: { children: <Text style={layout.body}>Comprendre la position</Text> },
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Explanation = {
  parameters: { smoke: { text: 'Comprendre la position' } },
} satisfies Story;

export const Hint = {
  args: { children: <Text style={layout.body}>Développez le cavalier vers le centre.</Text> },
  parameters: { smoke: { text: 'Développez le cavalier' } },
} satisfies Story;
