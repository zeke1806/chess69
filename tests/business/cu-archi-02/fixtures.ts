import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const directories: string[] = [];
const failedWrites = new Set<string>();
const openConnections = new Set<DatabaseSync>();

type ExpoConnection = Readonly<{
  execAsync: (sql: string) => Promise<void>;
  getFirstAsync: <T>(sql: string) => Promise<T | null>;
  runAsync: (sql: string, ...parameters: SQLInputValue[]) => Promise<void>;
  withExclusiveTransactionAsync: (
    action: (connection: ExpoConnection) => Promise<void>,
  ) => Promise<void>;
  closeAsync: () => Promise<void>;
}>;

export const createDatabaseFixture = (payload?: unknown, version = 1): string => {
  const directory = mkdtempSync(join(tmpdir(), 'chess69-cu-archi-'));
  directories.push(directory);
  const databaseName = join(directory, 'installation.db');
  if (payload !== undefined) {
    const database = new DatabaseSync(databaseName);
    database.exec(
      'CREATE TABLE installation_state (id INTEGER PRIMARY KEY CHECK (id = 1), payload TEXT NOT NULL);',
    );
    database
      .prepare('INSERT INTO installation_state (id, payload) VALUES (1, ?)')
      .run(JSON.stringify(payload));
    database.exec(`PRAGMA user_version = ${version};`);
    database.close();
  }
  return databaseName;
};

export const failNextSQLiteWrite = (databaseName: string): void => {
  failedWrites.add(databaseName);
};

export const cleanDatabaseFixtures = (): void => {
  for (const database of openConnections) {
    database.close();
  }
  openConnections.clear();
  for (const directory of directories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
  failedWrites.clear();
};

/** The Expo boundary delegates actual SQL and rollback to Node's SQLite driver. */
export const openDatabaseAsync = async (databaseName: string): Promise<ExpoConnection> => {
  const database = new DatabaseSync(databaseName);
  openConnections.add(database);
  const connection: ExpoConnection = {
    execAsync: async (sql) => {
      database.exec(sql);
    },

    getFirstAsync: async <T>(sql: string): Promise<T | null> => {
      return (database.prepare(sql).get() as T | undefined) ?? null;
    },

    runAsync: async (sql, ...parameters) => {
      if (failedWrites.delete(databaseName)) {
        throw new Error('Disque indisponible');
      }
      database.prepare(sql).run(...parameters);
    },

    withExclusiveTransactionAsync: async (action) => {
      database.exec('BEGIN IMMEDIATE;');
      try {
        await action(connection);
        database.exec('COMMIT;');
      } catch (error) {
        database.exec('ROLLBACK;');
        throw error;
      }
    },

    closeAsync: async () => {
      database.close();
      openConnections.delete(database);
    },
  };
  return connection;
};
