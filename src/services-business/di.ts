import { createLifecycleService } from './lifecycle/lifecycle-service';
import type { LifecycleService } from './lifecycle/lifecycle-types';
import { createNativeClockService } from './adapters/clock/native-clock-service';
import { createNativeIdentityService } from './adapters/identity/native-identity-service';
import { createStockfishEngineService } from './adapters/engine/engine-service';
import { createSQLiteRepositoryService } from './adapters/repository/repository-service';
import { createChessJsRulesService } from './adapters/rules/chess-js-rules-service';
import { createCatalogueService } from './catalogue/catalogue-service';
import { createLearningService } from './learning/learning-service';
import { createGameService } from './game/game-service';
import { createAnalysisService } from './analysis/analysis-service';
import { createProgressionService } from './progression/progression-service';
import type { CatalogueService } from './catalogue/catalogue-types';
import type { LearningService } from './learning/learning-types';
import type { GameService } from './game/game-types';
import type { AnalysisService } from './analysis/analysis-types';
import type { ProgressionService } from './progression/progression-types';
import type { RulesService } from './adapters/rules/rules-types';
import type { RepositoryService } from './adapters/repository/repository-types';
import type { EngineService } from './adapters/engine/engine-types';
import type { ClockService } from './adapters/clock/clock-types';
import type { IdentityService } from './adapters/identity/identity-types';
export interface ServicesBusiness {
  readonly catalogue: CatalogueService;
  readonly createLearning: () => LearningService;
  readonly game: GameService;
  readonly analysis: AnalysisService;
  readonly progression: ProgressionService;
  readonly rules: RulesService;
  readonly lifecycle: LifecycleService;
}
export type ServicesBusinessDependencies = Readonly<{
  repository?: RepositoryService;
  engine?: EngineService;
  clock?: ClockService;
  ids?: IdentityService;
}>;

export const createServicesBusiness = (
  dependencies: ServicesBusinessDependencies = {},
): ServicesBusiness => {
  const repository = dependencies.repository ?? createSQLiteRepositoryService();
  const engine = dependencies.engine ?? createStockfishEngineService();
  const rules = createChessJsRulesService();
  const clock = dependencies.clock ?? createNativeClockService();
  const ids = dependencies.ids ?? createNativeIdentityService();
  const catalogue = createCatalogueService();

  const createLearning = () => {
    return createLearningService({
      repository: repository.learning,
      rules,
      clock,
      ids,
      catalogue,
    });
  };

  const game = createGameService({ repository: repository.game, rules, clock, ids, engine });
  const analysis = createAnalysisService({ repository: repository.analysis, rules, engine });
  const progression = createProgressionService({ repository: repository.progression, clock });
  const lifecycle = createLifecycleService([repository, engine]);

  return { catalogue, rules, createLearning, game, analysis, progression, lifecycle };
};
