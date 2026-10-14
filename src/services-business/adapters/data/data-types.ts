export interface StateData<State> {
  readonly read: () => Readonly<State>;
  readonly update: (transition: (state: Readonly<State>) => Readonly<State>) => Readonly<State>;
}

export interface DataService {
  readonly createData: <State>(initialState: State) => StateData<State>;
}
