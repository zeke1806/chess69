import type { StateData } from '../adapters/data/data-types';
import { z } from 'zod';
import { engineLevelSchema } from '../adapters/engine/engine-types';
import { chessColorSchema } from '../adapters/rules/rules-types';
import type { ClockService } from '../adapters/clock/clock-types';
import type { IdentityService } from '../adapters/identity/identity-types';
import type { EngineLevel, EngineService } from '../adapters/engine/engine-types';
import type { ChessColor, RulesPosition, RulesService } from '../adapters/rules/rules-types';

export const gameRecordSchema = z
  .object({
    id: z.string(),
    color: chessColorSchema,
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
export interface GameService {
  readonly start: (options: GameOptions, replaceConfirmed?: boolean) => Promise<GameSession>;
  readonly resume: () => Promise<GameSession | null>;
  readonly play: (uci: string) => Promise<GameSession>;
  readonly think: () => Promise<GameSession | null>;
  readonly cancelThinking: () => Promise<void>;
  readonly resign: () => Promise<GameSession>;
  readonly history: () => Promise<readonly GameSession[]>;
  readonly get: (id: string) => Promise<GameSession | null>;
}
export type GameDependencies = Readonly<{
  data: StateData<GameExecutionData>;
  repository: GameRepository;
  rules: RulesService;
  engine: Pick<EngineService, 'evaluate' | 'cancel'>;
  clock: ClockService;
  ids: IdentityService;
}>;
export interface GameRepository {
  readonly active: () => Promise<GameRecord | null>;
  readonly get: (id: string) => Promise<GameRecord | null>;
  readonly history: () => Promise<readonly GameRecord[]>;
  readonly start: (
    input: Readonly<{
      record: GameRecord;
      options: GameOptions;
      expectedActiveId: string | null;
      replaced: GameRecord | null;
    }>,
  ) => Promise<boolean>;
  readonly save: (
    expected: GameRecord,
    updated: GameRecord,
    isCurrent?: () => boolean,
  ) => Promise<boolean>;
}

export type GameExecutionData = Readonly<{
  busy: boolean;
  generation: number;
  thinking: AbortController | null;
}>;
