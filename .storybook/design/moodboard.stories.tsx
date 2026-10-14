import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Moodboard } from './moodboard';

function sampleAction() {}

const meta = {
  title: 'Common/Design/Moodboard',
  component: Moodboard,
  args: { onSampleAction: sampleAction, onNavigate: sampleAction },
  parameters: { presentationFrame: 'design-moodboard' },
} satisfies Meta<typeof Moodboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PaletteA = {
  parameters: { smoke: { text: 'Charbon & sauge' } },
} satisfies Story;
