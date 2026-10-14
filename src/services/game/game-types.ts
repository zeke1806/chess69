import type { GameOptions, GameSession } from '../../services-business/game/game-types';
import type { StatefulService, ContextLease } from '../adapters/stateful/stateful-types';
export type GameState = Readonly<{
  options: GameOptions;
  activeGame: GameSession | null;
  session: GameSession | null;
  history: readonly GameSession[];
  busy: boolean;
  thinking: boolean;
  message: string | null;
  error: string | null;
  replacementRequired: boolean;
  resignationRequired: boolean;
}>;
export type GameActions = Readonly<{
  changeColor: (color: GameOptions['color']) => void;
  changeLevel: (level: GameOptions['level']) => void;
  start: (confirmed?: boolean) => Promise<void>;
  dismissReplacement: () => void;
  resume: () => Promise<void>;
  move: (move: string) => Promise<void>;
  requestResign: () => void;
  confirmResign: () => Promise<void>;
  dismissResign: () => void;
  showHistory: () => Promise<void>;
  think: () => Promise<void>;
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
  leave: () => void;
}>;

export type GameUiService = StatefulService<GameState, GameActions, GameBindings>;
export type GameBindings = Readonly<{
  enter: (page: 'game' | 'history') => ContextLease;
  current: () => ContextLease;
  refreshGlobal: () => Promise<void>;
}>;
