import { z } from 'zod';
import { engineLevelSchema } from '../adapters/engine/engine-types';
import type { ClockService } from '../adapters/clock/clock-types';
import type { IdentityService } from '../adapters/identity/identity-types';
import type { EngineLevel, EngineService } from '../adapters/engine/engine-types';
import type { ChessColor, RulesPosition, RulesService } from '../adapters/rules/rules-types';

export const gameRecordSchema = z
  .object({
    id: z.string(),
    color: z.enum(['w', 'b']),
    level: engineLevelSchema,
    moves: z.array(z.string()).readonly(),
    startedAt: z.string(),
    finishedAt: z.string().nullable(),
    result: z.string().nullable(),
    day: z.string().nullable(),
  })
  .readonly();
export type GameRecord = z.infer<typeof gameRecordSchema>;

export type GameOptions = Readonly<{
  color: ChessColor | 'random';
  level: EngineLevel;
}>;
export type GameSession = Readonly<{
  record: Readonly<Omit<GameRecord, 'moves'>> & {
    readonly moves: readonly string[];
  };
  position: RulesPosition;
}>;
export type GameErrorCode =
  | 'replacement-required'
  | 'busy'
  | 'no-active-game'
  | 'not-player-turn'
  | 'not-engine-turn'
  | 'illegal-move'
  | 'engine-error'
  | 'conflict';
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
export type GameDependencies = Readonly<{
  repository: GameRepository;
  rules: RulesService;
  engine: Pick<EngineService, 'evaluate' | 'cancel'>;
  clock: ClockService;
  ids: IdentityService;
}>;
export type GameRepository = Readonly<{
  active: () => Promise<GameRecord | null>;
  get: (id: string) => Promise<GameRecord | null>;
  history: () => Promise<readonly GameRecord[]>;
  start: (
    input: Readonly<{
      record: GameRecord;
      options: GameOptions;
      expectedActiveId: string | null;
      replaced: GameRecord | null;
    }>,
  ) => Promise<boolean>;
  save: (expected: GameRecord, updated: GameRecord, isCurrent?: () => boolean) => Promise<boolean>;
}>;
