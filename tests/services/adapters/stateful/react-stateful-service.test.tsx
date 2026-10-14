import { expect, test } from '@jest/globals';
import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { useStatefulService } from '../../../../src/services/adapters/stateful/react-stateful-service';
import type {
  StatefulConnection,
  StatefulService,
} from '../../../../src/services/adapters/stateful/stateful-types';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type State = Readonly<{ count: number; values: readonly number[] }>;
type Bindings = Readonly<{ visit: () => void }>;
type Actions = Readonly<{
  increment: () => void;
  active: () => boolean;
  visit: () => void;
  finishLater: (waiting: Promise<void>) => Promise<void>;
}>;
const service: StatefulService<State, Actions, Bindings> = {
  createInitialState: () => {
    return { count: 0, values: [] };
  },
  connect: (connector) => {
    return {
      increment: () => {
        connector.setState((state) => ({
          count: state.count + 1,
          values: [...state.values, state.count + 1],
        }));
      },
      active: connector.isActive,
      visit: () => {
        if (connector.isActive()) {
          connector.bindings.visit();
        }
      },
      finishLater: async (waiting) => {
        await waiting;
        // setState must itself refuse updates, even when a caller forgets to guard it.
        connector.setState((state) => ({
          count: state.count + 1,
          values: [...state.values, state.count + 1],
        }));
        if (connector.isActive()) {
          connector.bindings.visit();
        }
      },
    };
  },
};

function Probe({
  bindings,
  observe,
}: Readonly<{
  bindings: Bindings;
  observe: (connection: StatefulConnection<State, Actions>) => void;
}>) {
  observe(useStatefulService(service, bindings));
  return null;
}

async function mount(
  observe: (connection: StatefulConnection<State, Actions>) => void,
  bindings: Bindings,
) {
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(createElement(Probe, { observe, bindings }));
  });
  return renderer;
}

test('le raccordement conserve les actions et lit l’état ainsi que les bindings actuels', async () => {
  let current!: StatefulConnection<State, Actions>;
  let firstVisits = 0;
  let secondVisits = 0;
  const observe = (connection: StatefulConnection<State, Actions>): void => {
    current = connection;
  };
  const renderer = await mount(observe, {
    visit: () => {
      firstVisits += 1;
    },
  });
  const initial = current.state;
  const actions = current.actions;
  expect(actions.active()).toBe(true);
  await act(async () => {
    actions.increment();
    actions.increment();
  });
  expect(current.actions).toBe(actions);
  expect(current.state).toEqual({ count: 2, values: [1, 2] });
  expect(initial).toEqual({ count: 0, values: [] });
  await act(async () => {
    renderer.update(
      createElement(Probe, {
        observe,
        bindings: {
          visit: () => {
            secondVisits += 1;
          },
        },
      }),
    );
  });
  actions.visit();
  expect(firstVisits).toBe(0);
  expect(secondVisits).toBe(1);
  await act(async () => {
    renderer.unmount();
  });
});

test('deux raccordements isolent leur état et le démontage bloque les résultats tardifs', async () => {
  let first!: StatefulConnection<State, Actions>;
  let second!: StatefulConnection<State, Actions>;
  let observations = 0;
  let visits = 0;
  const bindings = {
    visit: (): void => {
      visits += 1;
    },
  };
  const one = await mount((connection) => {
    first = connection;
    observations += 1;
  }, bindings);
  const two = await mount((connection) => {
    second = connection;
  }, bindings);
  expect(first.state).not.toBe(second.state);
  expect(first.actions).not.toBe(second.actions);
  await act(async () => {
    first.actions.increment();
  });
  expect(second.state.count).toBe(0);
  let release = (): void => {};
  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });
  const pending = first.actions.finishLater(waiting);
  await act(async () => {
    one.unmount();
  });
  const count = observations;
  await act(async () => {
    release();
    await pending;
  });
  expect(first.actions.active()).toBe(false);
  expect(observations).toBe(count);
  expect(visits).toBe(0);
  await act(async () => {
    two.unmount();
  });
});
