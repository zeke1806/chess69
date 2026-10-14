import { createRepositoryPorts } from './repository-ports';
import type { SQLiteDatabase } from 'expo-sqlite';
import { createEmptyState, storedStateSchema } from '../repository-types';
import type {
  RepositoryService,
  StoredState,
  SQLiteRepositoryDependencies,
} from '../repository-types';

/** All operations share one queue. A failed write never poisons later retries. */
export const createSQLiteRepositoryService = ({
  databaseName = 'chess69.db',
}: SQLiteRepositoryDependencies = {}): RepositoryService => {
  let database: SQLiteDatabase | null = null;
  let pending: Promise<unknown> = Promise.resolve();
  return createRepositoryPorts({
    initialize: () => {
      return enqueue(async () => {
        if (database) {
          return;
        }
        // Keep native SQLite loading inside its lifecycle; memory composition needs no native runtime.
        const { openDatabaseAsync } = require('expo-sqlite') as typeof import('expo-sqlite');
        const connection = await openDatabaseAsync(databaseName);
        try {
          await connection.execAsync('PRAGMA journal_mode = WAL; PRAGMA synchronous = FULL;');
          await connection.withExclusiveTransactionAsync(async (transaction) => {
            const version = await transaction.getFirstAsync<{
              user_version: number;
            }>('PRAGMA user_version');
            if ((version?.user_version ?? 0) > 1) {
              throw new Error('Cette progression nécessite une version plus récente de Chess69.');
            }
            // Version 0 has no persistent domain data in the first APK. Existing
            // rows are retained, including a database awaiting a retried migration.
            if ((version?.user_version ?? 0) === 0) {
              await transaction.execAsync(
                'CREATE TABLE IF NOT EXISTS installation_state (id INTEGER PRIMARY KEY CHECK (id = 1), payload TEXT NOT NULL);',
              );
              await transaction.runAsync(
                'INSERT OR IGNORE INTO installation_state (id, payload) VALUES (1, ?)',
                JSON.stringify(createEmptyState()),
              );
              await read(transaction);
              await transaction.execAsync('PRAGMA user_version = 1;');
            } else {
              await read(transaction);
            }
          });
          database = connection;
        } catch (error) {
          await connection.closeAsync().catch(() => undefined);
          throw error;
        }
      });
    },

    readState: () => {
      return enqueue(() => read(getDatabase()));
    },

    updateState: (update) => {
      return enqueue(async () => {
        let saved: StoredState | undefined;
        const connection = getDatabase();
        await connection.withExclusiveTransactionAsync(async (transaction) => {
          const current = await read(transaction);
          const next = storedStateSchema.parse(update(current));
          await transaction.runAsync(
            'UPDATE installation_state SET payload = ? WHERE id = 1',
            JSON.stringify(next),
          );
          saved = next;
        });
        if (!saved) {
          throw new Error('La progression n’a pas été sauvegardée.');
        }
        return storedStateSchema.parse(saved);
      });
    },

    dispose: () => {
      return enqueue(async () => {
        const connection = database;
        database = null;
        if (connection) {
          await connection.closeAsync();
        }
      });
    },
  });

  function enqueue<T>(action: () => Promise<T>): Promise<T> {
    const operation = pending.then(action);
    pending = operation.catch(() => undefined);
    return operation;
  }

  function getDatabase(): SQLiteDatabase {
    if (!database) {
      throw new Error('Le stockage local doit être initialisé.');
    }
    return database;
  }

  async function read(connection: SQLiteDatabase): Promise<StoredState> {
    const row = await connection.getFirstAsync<{
      payload: string;
    }>('SELECT payload FROM installation_state WHERE id = 1');
    if (!row) {
      throw new Error('La progression locale est absente. Réessayez sans effacer les données.');
    }
    return storedStateSchema.parse(JSON.parse(row.payload));
  }
};
