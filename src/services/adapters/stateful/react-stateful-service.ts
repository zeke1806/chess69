import { createMemoryDataService } from '../../../services-business/adapters/data/memory-data-service';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { StatefulConnection, StatefulService } from './stateful-types';

export function useStatefulService<State, Actions>(
  service: StatefulService<State, Actions>,
): StatefulConnection<State, Actions>;
export function useStatefulService<State, Actions, Bindings>(
  service: StatefulService<State, Actions, Bindings>,
  bindings: Bindings,
): StatefulConnection<State, Actions>;

export function useStatefulService<State, Actions, Bindings>(
  service: StatefulService<State, Actions, Bindings>,
  bindings?: Bindings,
): StatefulConnection<State, Actions> {
  const [state, setState] = useState(service.createInitialState);
  const [data] = useState(createMemoryDataService);
  const stateRef = useRef(state);
  const bindingsRef = useRef(bindings);
  const mounted = useRef(false);
  const [actions] = useState(() =>
    service.connect({
      data,

      isActive: () => {
        return mounted.current;
      },

      getState: () => {
        return stateRef.current;
      },

      setState: (update) => {
        if (!mounted.current) {
          return;
        }
        const next = update(stateRef.current);
        stateRef.current = next;
        setState(() => next);
      },

      get bindings() {
        return bindingsRef.current as Bindings;
      },
    }),
  );

  useLayoutEffect(() => {
    bindingsRef.current = bindings;
  }, [bindings]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return { state, actions };
}
