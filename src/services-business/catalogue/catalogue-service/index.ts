import { exerciseSchema, openingSchema, type CatalogueService } from '../catalogue-type';
import exercisesData from './exercises.json';
import openingsData from './openings.json';

export function createCatalogueService(): CatalogueService {
  const exercises = Object.freeze(exercisesData.map((value) => freezeContent(exerciseSchema.parse(value))));
  const openings = Object.freeze(openingsData.map((value) => freezeContent(openingSchema.parse(value))));
  const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  return {
    list: (filter = {}) => Object.freeze(exercises.filter((exercise) =>
      (!filter.kind || exercise.kind === filter.kind)
      && (!filter.theme || exercise.theme === filter.theme)
      && (!filter.difficulty || exercise.difficulty === filter.difficulty))),
    get: (id) => byId.get(id),
    openings: () => openings,
  };
}

function freezeContent<T extends object>(value: T): T {
  for (const child of Object.values(value)) {
    if (child && typeof child === 'object') freezeContent(child);
  }
  return Object.freeze(value);
}
