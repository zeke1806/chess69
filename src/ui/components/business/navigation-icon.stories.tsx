import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { NavigationIcon } from './navigation-icon';

const meta = {
  title: 'Business/Chess/NavigationIcon',
  component: NavigationIcon,
  args: { kind: 'home', color: '#FF9F43' },
} satisfies Meta<typeof NavigationIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Home = {
  args: { kind: 'home' },
  parameters: { smoke: { svg: true } },
} satisfies Story;

export const Learn = {
  args: { kind: 'learn' },
  parameters: { smoke: { svg: true } },
} satisfies Story;

export const Play = {
  args: { kind: 'play' },
  parameters: { smoke: { svg: true } },
} satisfies Story;

export const Progress = {
  args: { kind: 'progress' },
  parameters: { smoke: { svg: true } },
} satisfies Story;

export const Back = {
  args: { kind: 'back' },
  parameters: { smoke: { svg: true } },
} satisfies Story;
