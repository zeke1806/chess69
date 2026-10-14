import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import * as R from 'remeda';
import { GameScreen } from './game-screen';
import { gameState, completedGame, gameActions, noop } from '../../../../.storybook/fixtures';
import { Chessboard } from './chessboard';
import { boardState, boardActions } from '../../../../.storybook/fixtures';

const meta = {
  title: 'Business/Pages/GameScreen',
  component: GameScreen,
  args: {
    state: gameState,
    actions: gameActions,
    onHome: noop,
    onAnalysis: noop,
    board: <Chessboard state={boardState} actions={boardActions} pieceSize={42} />,
  },
} satisfies Meta<typeof GameScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PlayerTurn = {
  parameters: { smoke: { text: 'À vous de jouer', svg: true } },
} satisfies Story;

export const Thinking = {
  args: {
    state: R.pipe(gameState, R.set('thinking', true), R.set('message', 'Stockfish réfléchit…')),
  },
  parameters: { smoke: { text: 'Stockfish réfléchit', svg: true } },
} satisfies Story;

export const Completed = {
  args: { state: R.set(gameState, 'session', completedGame) },
  parameters: { smoke: { text: 'Partie terminée', svg: true } },
} satisfies Story;

export const Saved = {
  args: { state: R.set(gameState, 'session', null) },
  parameters: { smoke: { text: 'La partie est sauvegardée' } },
} satisfies Story;
