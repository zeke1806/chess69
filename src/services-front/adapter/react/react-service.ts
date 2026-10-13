import { useSyncExternalStore } from 'react';
import type { ApplicationService, ApplicationSnapshot } from '../../application/application-type';
import type { ReactService } from './react-type';
export const createReactService = ():ReactService => ({useApplicationState});
function useApplicationState(service:ApplicationService):ApplicationSnapshot {
  return useSyncExternalStore(service.subscribe,service.getSnapshot,service.getSnapshot);
}
