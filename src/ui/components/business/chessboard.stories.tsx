import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import * as R from 'remeda';
import { Chessboard } from './chessboard';
import { BoardInteraction } from '../../../../.storybook/board-interaction';
import {
  boardState,
  promotionBoard,
  checkBoard,
  boardActions,
} from '../../../../.storybook/fixtures';

const meta = {
  title: 'Business/Chessboard',
  component: Chessboard,
  args: { state: boardState, actions: boardActions, pieceSize: 42 },
} satisfies Meta<typeof Chessboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const White = {
  parameters: { smoke: { text: 'Trait aux blancs', svg: true, board: true } },
} satisfies Story;

export const Black = {
  args: { state: R.setPath(boardState, ['context', 'color'], 'b') },
  parameters: { smoke: { text: 'Trait aux blancs', svg: true, board: true } },
} satisfies Story;

export const Selected = {
  args: { state: R.pipe(boardState, R.set('selected', 'e2'), R.set('targets', ['e3', 'e4'])) },
  parameters: { smoke: { text: 'Trait aux blancs', svg: true, board: true, selection: true } },
} satisfies Story;

export const ReadOnly = {
  args: { state: R.set(boardState, 'context', R.set(boardState.context!, 'disabled', true)) },
  parameters: { smoke: { text: 'Trait aux blancs', svg: true, board: true, readOnly: true } },
} satisfies Story;

export const Check = {
  args: { state: checkBoard },
  parameters: { smoke: { text: 'Roi en échec', svg: true, board: true } },
} satisfies Story;

export const Promotion = {
  render: () => {
    return <BoardInteraction initialState={promotionBoard} />;
  },

  args: { state: promotionBoard },
  parameters: { smoke: { text: 'Promouvoir le pion', svg: true, board: true, promotion: true } },
} satisfies Story;

export const Interactive = {
  render: () => {
    return <BoardInteraction initialState={boardState} />;
  },

  parameters: { smoke: { text: 'Aucun coup transmis', board: true, interactive: true } },
} satisfies Story;
