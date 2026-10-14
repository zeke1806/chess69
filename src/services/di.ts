import type { ServicesBusiness } from '../services-business/di';
import { createLearningService } from './learning/learning-service';
import { createGameService } from './game/game-service';
import { createAnalysisService } from './analysis/analysis-service';
import { createProgressionService } from './progression/progression-service';
import { createBoardService } from './board/board-service';
import { createOrchestrationService } from './orchestration/orchestration-service';
import type { OrchestrationService } from './orchestration/orchestration-types';

export interface ServicesFront {
  readonly orchestration: Readonly<{ createOrchestrationService: () => OrchestrationService }>;
}
type Dependencies = Readonly<{ version: string; business: ServicesBusiness }>;

export function createServicesFront({ version, business }: Dependencies): ServicesFront {
  const learning = createLearningService({
    catalogue: business.catalogue,
    createLearning: business.createLearning,
    rules: business.rules,
  });
  const game = createGameService({
    game: business.game,
    preferences: business.progression.preferences,
  });
  const analysis = createAnalysisService({
    analysis: business.analysis,
    game: business.game,
    rules: business.rules,
  });
  const progression = createProgressionService({
    progression: business.progression,
    catalogue: business.catalogue,
  });
  const board = createBoardService();
  return {
    orchestration: {
      createOrchestrationService: () => {
        return createOrchestrationService({
          version,
          learning,
          game,
          analysis,
          progression,
          board,
          initialize: business.initialize,
          dispose: business.dispose,
          cancelAnalysis: business.analysis.cancel,
          cancelThinking: business.game.cancelThinking,
        });
      },
    },
  };
}
