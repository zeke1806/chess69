import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import * as R from 'remeda';
import { ApplicationShell } from './application-shell';
import { Text } from 'react-native';
import logoUrl from './logo.png?url';
import { shellState, noop } from '../../../../.storybook/fixtures';
import { layout } from '../common/theme';

const meta = {
  title: 'Business/ApplicationShell',
  component: ApplicationShell,
  args: {
    state: shellState,
    logoSource: { uri: logoUrl },
    onNavigate: noop,
    onBack: noop,
    onRetry: noop,
    children: <Text style={layout.body}>Votre prochain coup</Text>,
  },
} satisfies Meta<typeof ApplicationShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready = {
  parameters: { smoke: { text: 'Votre prochain coup', logo: true, svg: true } },
} satisfies Story;

export const Loading = {
  args: { state: R.set(shellState, 'status', 'loading') },
  parameters: { smoke: { text: 'Préparation des données', logo: true } },
} satisfies Story;

export const Error = {
  args: {
    state: R.pipe(
      shellState,
      R.set('status', 'error'),
      R.set('error', 'Le moteur ne répond pas. Réessayez.'),
    ),
  },
  parameters: { smoke: { text: 'Le moteur ne répond pas', logo: true } },
} satisfies Story;

export const Nested = {
  args: {
    state: R.pipe(
      shellState,
      R.set('route', { page: 'exercise', destination: 'learn' }),
      R.set('title', 'Giuoco Piano'),
    ),
  },
  parameters: { smoke: { text: 'Giuoco Piano', logo: true, svg: true } },
} satisfies Story;
