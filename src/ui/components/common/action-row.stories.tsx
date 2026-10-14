import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { ActionRow } from './action-row';
import { noop } from '../../../../.storybook/fixtures';

const meta = {
  title: 'Common/ActionRow',
  component: ActionRow,
  args: {
    title: 'Résoudre un puzzle',
    detail: 'Calculer une séquence, comprendre une idée',
    onPress: noop,
  },
} satisfies Meta<typeof ActionRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = { parameters: { smoke: { text: 'Résoudre un puzzle' } } } satisfies Story;

export const LongContent = {
  args: {
    title: 'Apprendre les variantes de la partie italienne',
    detail:
      'Comprendre le développement, préparer le roque et occuper le centre avant de lancer une attaque',
  },
  parameters: { smoke: { text: 'Apprendre les variantes' } },
} satisfies Story;
