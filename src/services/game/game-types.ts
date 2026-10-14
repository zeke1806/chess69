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
export interface GameActions {
  readonly changeColor: (color: GameOptions['color']) => void;
  readonly changeLevel: (level: GameOptions['level']) => void;
  readonly start: (confirmed?: boolean) => Promise<void>;
  readonly dismissReplacement: () => void;
  readonly resume: () => Promise<void>;
  readonly move: (move: string) => Promise<void>;
  readonly requestResign: () => void;
  readonly confirmResign: () => Promise<void>;
  readonly dismissResign: () => void;
  readonly showHistory: () => Promise<void>;
  readonly think: () => Promise<void>;
  readonly refresh: () => Promise<void>;
  readonly retry: () => Promise<void>;
  readonly leave: () => void;
}

export interface GameUiService extends StatefulService<GameState, GameActions, GameBindings> {}
export interface GameBindings {
  readonly enter: (page: 'game' | 'history') => ContextLease;
  readonly current: () => ContextLease;
  readonly refreshGlobal: () => Promise<void>;
}
