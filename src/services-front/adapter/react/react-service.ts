import { useSyncExternalStore } from 'react';
import type {
  InstallationCheckFrontService,
  InstallationCheckFrontSnapshot,
} from '../../installation-check/installation-check-type';
import type { ReactService } from './react-type';

export const createReactService = (): ReactService => ({
  useInstallationCheckState,
});

function useInstallationCheckState(
  service: InstallationCheckFrontService,
): InstallationCheckFrontSnapshot {
  return useSyncExternalStore(
    service.subscribe,
    service.getSnapshot,
    service.getSnapshot,
  );
}
