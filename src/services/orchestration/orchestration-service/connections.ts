import type { StateConnector } from '../../adapters/stateful/stateful-types';
import type { OrchestrationState } from '../orchestration-types';

export function createSliceConnector<Key extends keyof OrchestrationState, Bindings>(
  connector: StateConnector<OrchestrationState>,
  key: Key,
  bindings: Bindings,
  isActive: () => boolean,
  publish: (update: (state: OrchestrationState) => OrchestrationState) => void,
): StateConnector<OrchestrationState[Key], Bindings> {
  return {
    data: connector.data,
    isActive,

    getState: () => {
      return connector.getState()[key];
    },

    setState: (update) => {
      publish((state) => {
        // A computed generic key retains its precise type with the language object construction.
        return { ...state, [key]: update(state[key]) };
      });
    },

    bindings,
  };
}
