import * as R from 'remeda';
import type { ProgressionService } from '../../services-business/progression/progression-types';
import type { CatalogueService } from '../../services-business/catalogue/catalogue-types';
import type { ProgressionUiService } from './progression-types';

export function createProgressionService(
  dependencies: Readonly<{
    progression: ProgressionService;
    catalogue: Pick<CatalogueService, 'list'>;
  }>,
): ProgressionUiService {
  return {
    createInitialState: () => {
      return {
        summary: null,
        titles: Object.fromEntries(
          dependencies.catalogue.list().map((exercise) => [exercise.id, exercise.title]),
        ),
        onboarding: false,
        busy: false,
        error: null,
      };
    },
    connect: (connector) => {
      let generation = 0;
      let retry: (() => Promise<void>) | null = null;
      const actions = {
        refresh: async (): Promise<void> => {
          const token = ++generation;
          const [summary, preferences] = await Promise.all([
            dependencies.progression.summary(),
            dependencies.progression.preferences(),
          ]);
          if (!connector.isActive() || token !== generation) {
            return;
          }
          connector.setState((state) => {
            return R.pipe(
              state,
              R.set('summary', summary),
              R.set('onboarding', !preferences.onboarded),
            );
          });
        },
        dismissOnboarding: async (): Promise<void> => {
          if (!connector.isActive() || connector.getState().busy) {
            return;
          }
          connector.setState((state) => {
            return R.pipe(state, R.set('busy', true), R.set('error', null));
          });
          retry = actions.dismissOnboarding;
          try {
            await dependencies.progression.markOnboarded();
            if (!connector.isActive()) {
              return;
            }
            retry = null;
            connector.setState(R.set('onboarding', false));
          } catch {
            if (connector.isActive()) {
              connector.setState(R.set('error', 'Le guide n’a pas pu être enregistré. Réessayez.'));
            }
          } finally {
            if (connector.isActive()) {
              connector.setState(R.set('busy', false));
            }
          }
        },
        retry: async (): Promise<void> => {
          if (retry) {
            await retry();
          }
        },
      };
      return actions;
    },
  };
}
