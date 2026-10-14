import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import * as R from 'remeda';
import { AnalysisScreen } from './analysis-screen';
import {
  analysisState,
  analysisActions,
  completedAnalysisView,
} from '../../../../.storybook/fixtures';
import { Chessboard } from './chessboard';
import { boardState, boardActions } from '../../../../.storybook/fixtures';

const meta = {
  title: 'Business/AnalysisScreen',
  component: AnalysisScreen,
  args: {
    state: analysisState,
    actions: analysisActions,
    board: <Chessboard state={boardState} actions={boardActions} pieceSize={42} />,
  },
} satisfies Meta<typeof AnalysisScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Partial = {
  parameters: { smoke: { text: 'Continuer l’analyse', svg: true } },
} satisfies Story;

export const Analyzing = {
  args: {
    state: R.pipe(
      analysisState,
      R.set('analyzing', true),
      R.setPath(['details', 'statusMessage'], 'Analyse en cours : 1 / 3 positions.'),
    ),
  },
  parameters: { smoke: { text: 'Annuler l’analyse', svg: true } },
} satisfies Story;

export const Completed = {
  args: {
    state: R.pipe(
      analysisState,
      R.set('view', completedAnalysisView),
      R.setPath(['details', 'statusMessage'], 'Analyse terminée : 3 / 3 positions.'),
      R.setPath(['details', 'actionLabel'], 'Analyse terminée'),
    ),
  },
  parameters: { smoke: { text: 'Analyse terminée : 3 / 3', svg: true } },
} satisfies Story;
