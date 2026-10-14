import { createBundledCatalogueDataService } from '../src/services-business/adapters/catalogue-data/bundled-catalogue-data-service';
import * as R from 'remeda';
import packageInfo from '../package.json';
import { createCatalogueService } from '../src/services-business/catalogue/catalogue-service';
import { createChessJsRulesService } from '../src/services-business/adapters/rules/chess-js-rules-service';
import type { LearningState, LearningActions } from '../src/services/learning/learning-types';
import type { GameState, GameActions } from '../src/services/game/game-types';
import type { AnalysisState, AnalysisActions } from '../src/services/analysis/analysis-types';
import type { ProgressionState } from '../src/services/progression/progression-types';
import type { BoardState, BoardActions } from '../src/services/board/board-types';
import type { ShellState } from '../src/services/orchestration/orchestration-types';
import type { ProgressionSummary } from '../src/services-business/progression/progression-types';
import type { GameSession } from '../src/services-business/game/game-types';

export const noop = () => {
  return;
};

export const noopAsync = async () => {
  return;
};

const catalogue = createCatalogueService(createBundledCatalogueDataService());
const rules = createChessJsRulesService();
const exercise = catalogue.get('opening-italienne-1')!;
const opening = catalogue.openings()[0]!;
export const initialPosition = rules.position();
export const shellState: ShellState = {
  status: 'ready',
  route: { page: 'list', destination: 'home' },
  title: 'Chess69',
  scrollKey: 'stories-home',
  version: packageInfo.version,
  error: null,
};
export const learningState: LearningState = {
  kind: 'opening',
  theme: null,
  difficulty: null,
  themes: ['Partie italienne'],
  catalogue: catalogue.list().slice(0, 3),
  openings: catalogue.openings().slice(0, 3),
  opening,
  openingExercises: opening.variationIds.map((id) => ({ id, title: catalogue.get(id)!.title })),
  color: 'w',
  session: {
    exercise,
    color: 'w',
    mode: 'guided',
    fen: exercise.fen,
    ply: 0,
    status: 'playing',
    legalMoves: initialPosition.legalMoves,
    expectedMove: exercise.moves[0]!,
    lastMove: null,
    errorCount: 0,
    assisted: false,
    hint: null,
    feedback: null,
  },
  selectedPly: 0,
  position: initialPosition,
  busy: false,
  message: null,
  error: null,
};
export const learningActions: LearningActions = {
  filter: noop,
  openOpening: noop,
  changeColor: noop,
  startExercise: noop,
  move: noopAsync,
  hint: noop,
  reveal: noopAsync,
  selectPly: noop,
  retry: noopAsync,
  leave: noop,
};
export const gameSession: GameSession = {
  record: {
    id: 'story-game',
    color: 'w',
    level: 'beginner',
    moves: ['e2e4', 'e7e5'],
    startedAt: '2026-10-14T08:00:00.000Z',
    finishedAt: null,
    result: null,
    day: null,
  },
  position: rules.position(undefined, ['e2e4', 'e7e5']),
};
export const completedGame = R.set(
  gameSession,
  'record',
  R.pipe(
    gameSession.record,
    R.set('finishedAt', '2026-10-14T08:30:00.000Z'),
    R.set('result', '1-0'),
    R.set('day', '2026-10-14'),
  ),
);
export const gameState: GameState = {
  options: { color: 'w', level: 'beginner' },
  activeGame: null,
  session: gameSession,
  history: [completedGame],
  busy: false,
  thinking: false,
  message: 'À vous de jouer.',
  error: null,
  replacementRequired: false,
  resignationRequired: false,
};
export const gameActions: GameActions = {
  changeColor: noop,
  changeLevel: noop,
  start: noopAsync,
  dismissReplacement: noop,
  resume: noopAsync,
  move: noopAsync,
  requestResign: noop,
  confirmResign: noopAsync,
  dismissResign: noop,
  showHistory: noopAsync,
  think: noopAsync,
  refresh: noopAsync,
  retry: noopAsync,
  leave: noop,
};
export const summary: ProgressionSummary = {
  successes: 4,
  assisted: 1,
  toReview: 1,
  attempts: 6,
  activeDays: ['2026-10-13', '2026-10-14'],
  streak: 2,
  due: [
    { contentId: exercise.id, color: 'w', stage: 2, streak: 2, due: '2026-10-14T08:00:00.000Z' },
  ],
  mastered: 1,
  learning: 2,
  finishedGames: 1,
  byKind: {
    opening: { success: 2, assisted: 1, failed: 1 },
    puzzle: { success: 2, assisted: 0, failed: 0 },
    endgame: { success: 0, assisted: 0, failed: 0 },
  },
};
export const emptySummary: ProgressionSummary = {
  successes: 0,
  assisted: 0,
  toReview: 0,
  attempts: 0,
  activeDays: [],
  streak: 0,
  due: [],
  mastered: 0,
  learning: 0,
  finishedGames: 0,
  byKind: {
    opening: { success: 0, assisted: 0, failed: 0 },
    puzzle: { success: 0, assisted: 0, failed: 0 },
    endgame: { success: 0, assisted: 0, failed: 0 },
  },
};
export const progressionState: ProgressionState = {
  summary,
  titles: { [exercise.id]: exercise.title },
  onboarding: false,
  busy: false,
  error: null,
};
export const analysisState: AnalysisState = {
  session: completedGame,
  view: {
    record: {
      gameId: gameSession.record.id,
      positions: [
        {
          ply: 0,
          fen: initialPosition.fen,
          bestMove: 'e2e4',
          score: { type: 'cp', value: 30 },
          pv: ['e2e4', 'e7e5'],
        },
      ],
      complete: false,
    },
    assessments: [],
    totalPositions: 3,
  },
  selectedPly: 0,
  position: initialPosition,
  details: {
    evaluationMessage: 'Évaluation : +0,3 pion pour les blancs.',
    bestMoveMessage: 'Meilleur coup : e2e4.',
    continuationMessage: 'Suite principale : e2e4 · e7e5.',
    assessmentMessage: null,
    statusMessage: '1 / 3 positions analysées.',
    actionLabel: 'Continuer l’analyse',
  },
  busy: false,
  analyzing: false,
  message: null,
  error: null,
};
export const analysisActions: AnalysisActions = {
  open: noopAsync,
  analyze: noopAsync,
  cancel: noopAsync,
  selectPly: noop,
  retry: noopAsync,
  leave: noop,
};
export const boardState: BoardState = {
  context: {
    key: 'stories-initial',
    fen: initialPosition.fen,
    color: 'w',
    legalMoves: initialPosition.legalMoves,
    lastMove: null,
    checkSquare: null,
    disabled: false,
  },
  pieces: Object.fromEntries(
    initialPosition.board.map((piece) => [
      piece.square,
      piece.color === 'w' ? piece.type.toUpperCase() : piece.type,
    ]),
  ),
  selected: null,
  targets: [],
  promotion: [],
  turnMessage: 'Trait aux blancs',
};
const promotionPosition = rules.position('7k/P7/8/8/8/8/8/7K w - - 0 1');
export const promotionBoard: BoardState = {
  context: {
    key: 'stories-promotion',
    fen: promotionPosition.fen,
    color: 'w',
    legalMoves: promotionPosition.legalMoves,
    lastMove: null,
    checkSquare: null,
    disabled: false,
  },
  pieces: { a7: 'P', h1: 'K', h8: 'k' },
  selected: 'a7',
  targets: ['a8'],
  promotion: ['a7a8q', 'a7a8r', 'a7a8b', 'a7a8n'],
  turnMessage: 'Trait aux blancs',
};
export const boardActions: Pick<BoardActions, 'select' | 'promote' | 'cancelPromotion'> = {
  select: noop,
  promote: noop,
  cancelPromotion: noop,
};
export const puzzles = catalogue.list({ kind: 'puzzle' }).slice(0, 3);
export const endgames = catalogue.list({ kind: 'endgame' }).slice(0, 3);

export const completedAnalysisView = {
  record: {
    gameId: completedGame.record.id,
    complete: true,
    positions: [
      {
        ply: 0,
        fen: initialPosition.fen,
        bestMove: 'e2e4',
        score: { type: 'cp' as const, value: 30 },
        pv: ['e2e4', 'e7e5'],
      },
      {
        ply: 1,
        fen: rules.position(undefined, ['e2e4']).fen,
        bestMove: 'e7e5',
        score: { type: 'cp' as const, value: 25 },
        pv: ['e7e5'],
      },
      {
        ply: 2,
        fen: completedGame.position.fen,
        bestMove: 'g1f3',
        score: { type: 'cp' as const, value: 30 },
        pv: ['g1f3'],
      },
    ],
  },
  assessments: [],
  totalPositions: 3,
};
const checkPosition = rules.position('4k3/8/8/8/8/8/4r3/4K3 w - - 0 1');
export const checkBoard: BoardState = {
  context: {
    key: 'stories-check',
    fen: checkPosition.fen,
    color: 'w',
    legalMoves: checkPosition.legalMoves,
    lastMove: null,
    checkSquare: checkPosition.checkSquare,
    disabled: false,
  },
  pieces: { e1: 'K', e2: 'r', e8: 'k' },
  selected: null,
  targets: [],
  promotion: [],
  turnMessage: 'Trait aux blancs · Roi en échec',
};
