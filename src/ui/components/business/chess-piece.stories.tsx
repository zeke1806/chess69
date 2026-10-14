import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { ChessPiece } from './chess-piece';

const meta = {
  title: 'Business/Chess/ChessPiece',
  component: ChessPiece,
  args: { piece: 'K', size: 54 },
} satisfies Meta<typeof ChessPiece>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WhiteK = {
  args: { piece: 'K' },
  parameters: { smoke: { svg: true } },
} satisfies Story;

export const WhiteQ = {
  args: { piece: 'Q' },
  parameters: { smoke: { svg: true } },
} satisfies Story;

export const WhiteR = {
  args: { piece: 'R' },
  parameters: { smoke: { svg: true } },
} satisfies Story;

export const WhiteB = {
  args: { piece: 'B' },
  parameters: { smoke: { svg: true } },
} satisfies Story;

export const WhiteN = {
  args: { piece: 'N' },
  parameters: { smoke: { svg: true } },
} satisfies Story;

export const WhiteP = {
  args: { piece: 'P' },
  parameters: { smoke: { svg: true } },
} satisfies Story;

export const BlackK = {
  args: { piece: 'k' },
  parameters: { smoke: { svg: true } },
} satisfies Story;

export const BlackQ = {
  args: { piece: 'q' },
  parameters: { smoke: { svg: true } },
} satisfies Story;

export const BlackR = {
  args: { piece: 'r' },
  parameters: { smoke: { svg: true } },
} satisfies Story;

export const BlackB = {
  args: { piece: 'b' },
  parameters: { smoke: { svg: true } },
} satisfies Story;

export const BlackN = {
  args: { piece: 'n' },
  parameters: { smoke: { svg: true } },
} satisfies Story;

export const BlackP = {
  args: { piece: 'p' },
  parameters: { smoke: { svg: true } },
} satisfies Story;
