import type { ClockService, IdentityService } from '../adapter/clock/clock-type';
import type { EngineLevel, EngineService } from '../adapter/engine/engine-type';
import type { GameRecord, RepositoryService } from '../adapter/repository/repository-type';
import type { ChessColor, RulesPosition, RulesService } from '../adapter/rules/rules-type';

export type GameOptions = Readonly<{ color: ChessColor | 'random'; level: EngineLevel }>;
export type GameSession = Readonly<{ record: Readonly<Omit<GameRecord, 'moves'>> & { readonly moves: readonly string[] }; position: RulesPosition }>;
export type GameErrorCode = 'replacement-required' | 'busy' | 'no-active-game' | 'not-player-turn' | 'not-engine-turn' | 'illegal-move' | 'engine-error' | 'conflict';
export type GameService = Readonly<{
  start: (options: GameOptions, replaceConfirmed?: boolean) => Promise<GameSession>;
  resume: () => Promise<GameSession | null>;
  play: (uci: string) => Promise<GameSession>;
  think: () => Promise<GameSession | null>;
  cancelThinking: () => Promise<void>;
  resign: () => Promise<GameSession>;
  history: () => Promise<readonly GameSession[]>;
  get: (id: string) => Promise<GameSession | null>;
}>;
export type GameDependencies = Readonly<{ repository: RepositoryService; rules: RulesService; engine: EngineService; clock: ClockService; ids: IdentityService }>;
