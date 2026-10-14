import { expect, test } from '@jest/globals';
import * as R from 'remeda';
import { createMemoryDataService } from '../../../../src/services-business/adapters/data/memory-data-service';

test('deux stockages sont isolés et les transitions conservent les anciennes valeurs', () => {
  const data = createMemoryDataService();
  const initial = { form: { title: 'Draft' }, todos: [] } as const;
  const first =
    data.createData<Readonly<{ form: Readonly<{ title: string }>; todos: readonly string[] }>>(
      initial,
    );
  const second = data.createData(initial);
  first.update(R.setPath(['form', 'title'], 'Edited'));
  expect(first.read().form.title).toBe('Edited');
  expect(second.read()).toBe(initial);
  expect(initial.form.title).toBe('Draft');
  expect(first.read().todos).toBe(initial.todos);
});

test('un updater en erreur ne remplace pas les données et une transition suivante lit la valeur courante', () => {
  const state = createMemoryDataService().createData({ version: 0 });
  state.update(R.set('version', 1));
  expect(() =>
    state.update(() => {
      throw new Error('invalid transition');
    }),
  ).toThrow('invalid transition');
  expect(state.read().version).toBe(1);
  state.update((current) => R.set(current, 'version', current.version + 1));
  expect(state.read().version).toBe(2);
});
