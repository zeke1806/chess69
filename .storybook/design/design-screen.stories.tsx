import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { DesignDemo } from './demo';

const meta = {
  title: 'Design/Proposition',
  component: DesignDemo,
  parameters: { presentationFrame: 'design', designStatus: 'integrated' },
  args: { initialPage: 'home' },
} satisfies Meta<typeof DesignDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Home = {
  name: 'Accueil',
  parameters: { smoke: { text: 'Votre prochain coup' } },
} satisfies Story;

export const Learn = {
  name: 'Apprentissage',
  args: { initialPage: 'learn' },
  parameters: { smoke: { text: 'À découvrir' } },
} satisfies Story;

export const Exercise = {
  name: 'Exercice',
  args: { initialPage: 'exercise' },
  parameters: { smoke: { text: 'Trouvez la fourchette' } },
} satisfies Story;

export const History = {
  name: 'Historique',
  args: { initialPage: 'history' },
  parameters: { smoke: { text: 'Vos parties' } },
} satisfies Story;

export const Analysis = {
  name: 'Analyse',
  args: { initialPage: 'analysis' },
  parameters: { smoke: { text: 'Analyse de la partie' } },
} satisfies Story;
