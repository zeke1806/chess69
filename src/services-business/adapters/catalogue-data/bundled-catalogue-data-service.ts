import type { CatalogueDataService } from './catalogue-data-types';
import * as R from 'remeda';
import { exerciseSchema, openingSchema } from '../../catalogue/catalogue-types';
import exercisesData from './exercises.json';
import openingsData from './openings.json';

export function createBundledCatalogueDataService(): CatalogueDataService {
  const exercises = Object.freeze(
    R.map(exercisesData, (value) => freezeContent(exerciseSchema.parse(value))),
  );
  const openings = Object.freeze(
    R.map(openingsData, (value) => freezeContent(openingSchema.parse(value))),
  );
  const byId = new Map(R.map(exercises, (exercise) => [exercise.id, exercise]));
  return {
    read: () => {
      return { exercises, openings };
    },

    find: (id) => {
      return byId.get(id);
    },
  };
}

function freezeContent<T extends object>(value: T): T {
  for (const child of Object.values(value)) {
    if (child && typeof child === 'object') {
      freezeContent(child);
    }
  }
  return Object.freeze(value);
}
