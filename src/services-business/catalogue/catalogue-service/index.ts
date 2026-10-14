import * as R from 'remeda';
import { exerciseSchema, openingSchema, type CatalogueService } from '../catalogue-types';
import exercisesData from './exercises.json';
import openingsData from './openings.json';

export function createCatalogueService(): CatalogueService {
  const exercises = Object.freeze(
    R.map(exercisesData, (value) => freezeContent(exerciseSchema.parse(value))),
  );
  const openings = Object.freeze(
    R.map(openingsData, (value) => freezeContent(openingSchema.parse(value))),
  );
  const byId = new Map(R.map(exercises, (exercise) => [exercise.id, exercise]));
  return {
    list: (filter = {}) => {
      return Object.freeze(
        R.filter(
          exercises,
          (exercise) =>
            (!filter.kind || exercise.kind === filter.kind) &&
            (!filter.theme || exercise.theme === filter.theme) &&
            (!filter.difficulty || exercise.difficulty === filter.difficulty),
        ),
      );
    },

    get: (id) => {
      return byId.get(id);
    },

    openings: () => {
      return openings;
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
