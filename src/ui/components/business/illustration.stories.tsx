import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Illustration } from './illustration';

const meta = {
  title: 'Business/Layout/Illustration',
  component: Illustration,
  parameters: { smoke: { image: true } },
  args: { kind: 'knight', size: 84 },
} satisfies Meta<typeof Illustration>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Knight: Story = {};
export const Book: Story = { args: { kind: 'book' } };
export const Puzzle: Story = { args: { kind: 'puzzle' } };
export const Rook: Story = { args: { kind: 'rook' } };
