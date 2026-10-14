import type { Exercise, Opening } from '../../catalogue/catalogue-types';

export interface CatalogueDataService {
  readonly read: () => Readonly<{ exercises: readonly Exercise[]; openings: readonly Opening[] }>;
  readonly find: (id: string) => Exercise | undefined;
}
