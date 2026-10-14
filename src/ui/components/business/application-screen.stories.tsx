import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import type {
  OrchestrationState,
  Route,
} from '../../../services/orchestration/orchestration-types';
import * as R from 'remeda';
import { ApplicationScreen } from './application-screen';
import logoUrl from './logo.png?url';
import {
  applicationState,
  applicationActions,
  emptySummary,
  puzzles,
  endgames,
  gameSession,
} from '../../../../.storybook/fixtures';

const pageState = (route: Route, title: string): OrchestrationState => {
  return R.set(applicationState, 'shell', {
    ...applicationState.shell,
    route,
    title,
    scrollKey: `stories-${route.page}-${route.destination}`,
  });
};

const meta = {
  title: 'Business/Pages/Application',
  component: ApplicationScreen,
  args: {
    state: applicationState,
    actions: applicationActions,
    logoSource: { uri: logoUrl },
    pieceSize: 43.65,
  },
  parameters: { presentationFrame: 'application' },

  render: (args, context) => {
    const width = Number(context.globals.catalogueWidth ?? 412);
    return <ApplicationScreen {...args} pieceSize={Math.min((width - 24) / 8, 60) * 0.9} />;
  },
} satisfies Meta<typeof ApplicationScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Home = {
  name: 'Accueil',
  parameters: { smoke: { text: 'À vous de jouer.', logo: true, image: true } },
} satisfies Story;

export const FirstLaunch = {
  name: 'Premier lancement',
  args: {
    state: R.set(applicationState, 'progression', {
      ...applicationState.progression,
      onboarding: true,
      summary: emptySummary,
    }),
  },
  parameters: { smoke: { text: 'Bienvenue à l’échiquier', logo: true } },
} satisfies Story;

export const Resume = {
  name: 'Accueil · partie à reprendre',
  args: {
    state: R.set(applicationState, 'game', { ...applicationState.game, activeGame: gameSession }),
  },
  parameters: { smoke: { text: 'Reprendre la partie', logo: true } },
} satisfies Story;

export const Openings = {
  name: 'Apprendre · ouvertures',
  args: { state: pageState({ page: 'list', destination: 'learn' }, 'Apprendre') },
  parameters: { smoke: { text: 'Partie italienne', image: true } },
} satisfies Story;

export const Puzzles = {
  name: 'Apprendre · puzzles',
  args: {
    state: R.set(pageState({ page: 'list', destination: 'learn' }, 'Apprendre'), 'learning', {
      ...applicationState.learning,
      kind: 'puzzle',
      catalogue: puzzles,
    }),
  },
  parameters: { smoke: { text: 'Filtrer par difficulté' } },
} satisfies Story;

export const Endgames = {
  name: 'Apprendre · finales',
  args: {
    state: R.set(pageState({ page: 'list', destination: 'learn' }, 'Apprendre'), 'learning', {
      ...applicationState.learning,
      kind: 'endgame',
      catalogue: endgames,
    }),
  },
  parameters: { smoke: { text: 'Filtrer par difficulté' } },
} satisfies Story;

export const Opening = {
  name: 'Ouverture · variantes',
  args: { state: pageState({ page: 'opening', destination: 'learn' }, 'Partie italienne') },
  parameters: { smoke: { text: 'Giuoco Piano' } },
} satisfies Story;

export const Exercise = {
  name: 'Exercice guidé',
  args: { state: pageState({ page: 'exercise', destination: 'learn' }, 'Giuoco Piano') },
  parameters: { smoke: { text: 'Trait aux blancs', board: true, image: true } },
} satisfies Story;

export const Play = {
  name: 'Jouer · options',
  args: { state: pageState({ page: 'list', destination: 'play' }, 'Jouer') },
  parameters: { smoke: { text: 'Commencer une partie' } },
} satisfies Story;

export const Game = {
  name: 'Partie en cours',
  args: {
    state: R.set(pageState({ page: 'game', destination: 'play' }, 'Partie'), 'board', {
      ...applicationState.board,
      context: {
        ...applicationState.board.context!,
        fen: gameSession.position.fen,
        legalMoves: gameSession.position.legalMoves,
        lastMove: 'e7e5',
      },
      pieces: Object.fromEntries(
        gameSession.position.board.map((piece) => [
          piece.square,
          piece.color === 'w' ? piece.type.toUpperCase() : piece.type,
        ]),
      ),
    }),
  },
  parameters: { smoke: { text: 'À vous de jouer', board: true } },
} satisfies Story;

export const History = {
  name: 'Historique',
  args: { state: pageState({ page: 'history', destination: 'play' }, 'Historique') },
  parameters: { smoke: { text: 'Revoir la partie' } },
} satisfies Story;

export const Analysis = {
  name: 'Analyse partielle',
  args: {
    state: R.set(pageState({ page: 'analysis', destination: 'play' }, 'Analyse'), 'board', {
      ...applicationState.board,
      context: { ...applicationState.board.context!, disabled: true },
    }),
  },
  parameters: { smoke: { text: 'Continuer l’analyse', board: true, readOnly: true } },
} satisfies Story;

export const Progress = {
  name: 'Progression',
  args: { state: pageState({ page: 'list', destination: 'progress' }, 'Progression') },
  parameters: { smoke: { text: 'Votre progression' } },
} satisfies Story;

export const EmptyProgress = {
  name: 'Progression · vide',
  args: {
    state: R.set(
      pageState({ page: 'list', destination: 'progress' }, 'Progression'),
      'progression',
      { ...applicationState.progression, summary: emptySummary },
    ),
  },
  parameters: { smoke: { text: 'Votre progression' } },
} satisfies Story;

export const Loading = {
  name: 'Chargement',
  args: {
    state: R.set(applicationState, 'shell', { ...applicationState.shell, status: 'loading' }),
  },
  parameters: { smoke: { text: 'Préparation des données', logo: true } },
} satisfies Story;

export const Error = {
  name: 'Erreur · réessai',
  args: {
    state: R.set(applicationState, 'shell', {
      ...applicationState.shell,
      status: 'error',
      error: 'Le moteur ne répond pas. Réessayez.',
    }),
  },
  parameters: { smoke: { text: 'Le moteur ne répond pas', logo: true } },
} satisfies Story;
