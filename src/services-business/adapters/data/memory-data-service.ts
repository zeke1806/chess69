import type { DataService, StateData } from './data-types';

export function createMemoryDataService(): DataService {
  return { createData };
}

function createData<State>(initialState: State): StateData<State> {
  let state: Readonly<State> = initialState;

  return {
    read: () => {
      return state;
    },

    update: (transition) => {
      state = transition(state);
      return state;
    },
  };
}
