import type { DataService } from '../../../services-business/adapters/data/data-types';
export interface StateConnector<State, Bindings = undefined> {
  readonly data: DataService;
  readonly isActive: () => boolean;
  readonly getState: () => State;
  readonly setState: (update: (state: State) => State) => void;
  readonly bindings: Bindings;
}

export interface StatefulService<State, Actions, Bindings = undefined> {
  readonly createInitialState: () => State;
  readonly connect: (connector: StateConnector<State, Bindings>) => Actions;
}

export interface StatefulConnection<State, Actions> {
  readonly state: State;
  readonly actions: Actions;
}

export type ContextLease = Readonly<{
  isCurrent: () => boolean;
  ready: Promise<void>;
}>;
