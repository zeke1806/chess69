import { createBundledCatalogueDataService } from './adapters/catalogue-data/bundled-catalogue-data-service';
import type { CatalogueDataService } from './adapters/catalogue-data/catalogue-data-types';
import { createMemoryDataService } from './adapters/data/memory-data-service';
import type { DataService } from './adapters/data/data-types';
import type { GameExecutionData } from './game/game-types';
import type { AnalysisExecutionData } from './analysis/analysis-types';
import { createInitialLifecycleData } from './lifecycle/lifecycle-types';
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
  readonly learning: LearningService;
  readonly game: GameService;
  readonly analysis: AnalysisService;
  readonly progression: ProgressionService;
  readonly rules: RulesService;
  readonly lifecycle: LifecycleService;
}
export type ServicesBusinessDependencies = Readonly<{
  data?: DataService;
  catalogueData?: CatalogueDataService;
  repository?: RepositoryService;
  engine?: EngineService;
  clock?: ClockService;
  ids?: IdentityService;
}>;

export const createServicesBusiness = (
  dependencies: ServicesBusinessDependencies = {},
): ServicesBusiness => {
  const data = dependencies.data ?? createMemoryDataService();
  const gameData = data.createData<GameExecutionData>({
    busy: false,
    generation: 0,
    thinking: null,
  });
  const analysisData = data.createData<AnalysisExecutionData>({ generation: 0, controller: null });
  const lifecycleData = data.createData(createInitialLifecycleData());
  const repository = dependencies.repository ?? createSQLiteRepositoryService();
  const engine = dependencies.engine ?? createStockfishEngineService();
  const rules = createChessJsRulesService();
  const clock = dependencies.clock ?? createNativeClockService();
  const ids = dependencies.ids ?? createNativeIdentityService();
  const catalogueData = dependencies.catalogueData ?? createBundledCatalogueDataService();
  const catalogue = createCatalogueService(catalogueData);
  const game = createGameService({
    data: gameData,
    repository: repository.game,
    rules,
    clock,
    ids,
    engine,
  });
  const analysis = createAnalysisService({
    data: analysisData,
    repository: repository.analysis,
    rules,
    engine,
  });
  const progression = createProgressionService({ repository: repository.progression, clock });
  const lifecycle = createLifecycleService([repository, engine], lifecycleData);

  const learning = createLearningService({
    repository: repository.learning,
    rules,
    clock,
    ids,
    catalogue,
  });

  return { catalogue, rules, learning, game, analysis, progression, lifecycle };
};
