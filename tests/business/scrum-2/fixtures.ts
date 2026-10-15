/** Double du protocole Expo : état local, aucun driver ni fichier SQLite. */
type DatabaseState = { payload: string | undefined; version: number; failWrite: boolean };
const databases = new Map<string, DatabaseState>();

type ExpoConnection = Readonly<{
  execAsync: (sql: string) => Promise<void>;
  getFirstAsync: <T>(sql: string) => Promise<T | null>;
  runAsync: (sql: string, ...parameters: unknown[]) => Promise<void>;
  withExclusiveTransactionAsync: (
    action: (connection: ExpoConnection) => Promise<void>,
  ) => Promise<void>;
  closeAsync: () => Promise<void>;
}>;

export const createDatabaseFixture = (payload?: unknown, version = 1): string => {
  const name = `installation-${databases.size}`;
  databases.set(name, {
    payload: payload === undefined ? undefined : JSON.stringify(payload),
    version: payload === undefined ? 0 : version,
    failWrite: false,
  });
  return name;
};

export const failNextSQLiteWrite = (name: string): void => {
  getDatabase(name).failWrite = true;
};

export const cleanDatabaseFixtures = (): void => {
  databases.clear();
};

export const openDatabaseAsync = async (name: string): Promise<ExpoConnection> => {
  const database = getDatabase(name);
  let closed = false;

  const assertOpen = (): void => {
    if (closed) {
      throw new Error('Connexion fermée');
    }
  };

  const connection: ExpoConnection = {
    execAsync: async (sql) => {
      assertOpen();
      if (
        sql.startsWith('PRAGMA journal_mode') ||
        sql.startsWith('CREATE TABLE IF NOT EXISTS installation_state')
      ) {
        return;
      }
      if (sql === 'PRAGMA user_version = 1;') {
        database.version = 1;
        return;
      }
      throw new Error(`Commande non prévue : ${sql}`);
    },

    getFirstAsync: async <T>(sql: string): Promise<T | null> => {
      assertOpen();
      if (sql === 'PRAGMA user_version') {
        return { user_version: database.version } as T;
      }
      if (sql === 'SELECT payload FROM installation_state WHERE id = 1') {
        return database.payload === undefined ? null : ({ payload: database.payload } as T);
      }
      throw new Error(`Lecture non prévue : ${sql}`);
    },

    runAsync: async (sql, ...parameters) => {
      assertOpen();
      if (database.failWrite) {
        database.failWrite = false;
        throw new Error('Disque indisponible');
      }
      if (
        sql.startsWith('UPDATE installation_state SET payload') ||
        (sql.startsWith('INSERT OR IGNORE INTO installation_state') &&
          database.payload === undefined)
      ) {
        database.payload = String(parameters[0]);
        return;
      }
      if (sql.startsWith('INSERT OR IGNORE INTO installation_state')) {
        return;
      }
      throw new Error(`Écriture non prévue : ${sql}`);
    },

    withExclusiveTransactionAsync: async (action) => {
      assertOpen();
      const before = { ...database };
      try {
        await action(connection);
      } catch (error) {
        database.payload = before.payload;
        database.version = before.version;
        throw error;
      }
    },

    closeAsync: async () => {
      closed = true;
    },
  };
  return connection;
};

function getDatabase(name: string): DatabaseState {
  const database = databases.get(name);
  if (!database) {
    throw new Error(`Installation inconnue : ${name}`);
  }
  return database;
}
