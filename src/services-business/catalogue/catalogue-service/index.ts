import * as R from 'remeda';
import type { CatalogueService } from '../catalogue-types';
import type { CatalogueDataService } from '../../adapters/catalogue-data/catalogue-data-types';

export function createCatalogueService(data: CatalogueDataService): CatalogueService {
  return {
    list: (filter = {}) => {
      return Object.freeze(
        R.filter(
          data.read().exercises,
          (exercise) =>
            (!filter.kind || exercise.kind === filter.kind) &&
            (!filter.theme || exercise.theme === filter.theme) &&
            (!filter.difficulty || exercise.difficulty === filter.difficulty),
        ),
      );
    },

    get: (id) => {
      return data.find(id);
    },

    openings: () => {
      return data.read().openings;
    },
  };
}
