import { createClockService, createIdentityService } from './adapter/clock/clock-service';
import { createStockfishEngineService } from './adapter/engine/engine-service';
import { createSQLiteRepositoryService } from './adapter/repository/repository-service';
import { createRulesService } from './adapter/rules/rules-service';
import { createCatalogueService } from './catalogue/catalogue-service';
import { createLearningService } from './learning/learning-service';
import { createGameService } from './game/game-service';
import { createAnalysisService } from './analysis/analysis-service';
import { createProgressionService } from './progression/progression-service';
import type { CatalogueService } from './catalogue/catalogue-type';
import type { LearningService } from './learning/learning-type';
import type { GameService } from './game/game-type';
import type { AnalysisService } from './analysis/analysis-type';
import type { ProgressionService } from './progression/progression-type';
import type { RulesService } from './adapter/rules/rules-type';
import type { RepositoryService } from './adapter/repository/repository-type';
import type { EngineService } from './adapter/engine/engine-type';
import type { ClockService, IdentityService } from './adapter/clock/clock-type';

export type ServicesBusiness = Readonly<{
  catalogue: CatalogueService; learning: LearningService; game: GameService;
  analysis: AnalysisService; progression: ProgressionService; rules: RulesService;
  initialize: () => Promise<void>; dispose: () => Promise<void>;
}>;

export type ServicesBusinessDependencies = Readonly<{
  repository?: RepositoryService; engine?: EngineService; clock?: ClockService; ids?: IdentityService;
}>;

export const createServicesBusiness = (dependencies: ServicesBusinessDependencies = {}): ServicesBusiness => {
  const repository = dependencies.repository ?? createSQLiteRepositoryService();
  const engine = dependencies.engine ?? createStockfishEngineService();
  const rules = createRulesService();
  const clock = dependencies.clock ?? createClockService();
  const ids = dependencies.ids ?? createIdentityService();
  const catalogue = createCatalogueService();
  let initialized = false;
  let pending: Promise<unknown> = Promise.resolve();
  const enqueue = (operation: () => Promise<void>): Promise<void> => {
    const result = pending.then(operation);
    pending = result.catch(() => undefined);
    return result;
  };
  const closeResources = async (): Promise<void> => {
    initialized = false;
    const results = await Promise.allSettled([engine.dispose(), repository.dispose()]);
    for (const result of results) {
      if (result.status === 'rejected') throw result.reason;
    }
  };
  return {
    catalogue, rules,
    learning: createLearningService({ repository, rules, clock, ids, catalogue }),
    game: createGameService({ repository, rules, clock, ids, engine }),
    analysis: createAnalysisService({ repository, rules, engine }),
    progression: createProgressionService({ repository, clock }),
    initialize: () => enqueue(async () => {
      if (initialized) return;
      try {
        await repository.initialize();
        await engine.initialize();
        initialized = true;
      } catch (error) {
        // Preserve the initialization error while releasing partial resources.
        await closeResources().catch(() => undefined);
        throw error;
      }
    }),
    dispose: () => enqueue(closeResources),
  };
};
