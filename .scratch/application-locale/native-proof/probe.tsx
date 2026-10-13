// Temporary real-APK native proof. Removed before integrating production UI.
import { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { Chess } from 'chess.js';
import { openDatabaseAsync } from 'expo-sqlite';
import { createSQLiteRepositoryService } from '../services-business/adapter/repository/repository-service/repository-sqlite-service';
import { createEmptyState } from '../services-business/adapter/repository/repository-type';
import { createStockfishEngineService } from '../services-business/adapter/engine/engine-service/engine-stockfish-service';
export default function NativeProof() {
  const [lines, setLines] = useState<string[]>([]);
  useEffect(() => {
    const note = (message: string) => { console.log(`NATIVE_PROOF ${message}`); setLines((prior) => [...prior, message]); };
    void (async () => {
      const repository = createSQLiteRepositoryService({ databaseName: 'chess69-proof.db' });
      await repository.initialize();
      const before = await repository.readState();
      note(`SQLITE_INITIAL attempts=${before.attempts.length}`);
      await repository.updateState((state) => ({ ...state, attempts: [...state.attempts, { id: `proof-${state.attempts.length}`, contentId: 'native-proof', kind: 'puzzle', outcome: 'success', at: new Date().toISOString(), day: '2026-10-13' }] }));
      await repository.dispose(); await repository.initialize();
      const after = await repository.readState();
      if (after.attempts.length !== before.attempts.length + 1) throw new Error('SQLite persistence failed');
      note(`SQLITE_REOPEN attempts=${after.attempts.length} PASS`);
      try { await repository.updateState(() => { throw new Error('write proof failure'); }); } catch { note('SQLITE_WRITE_ERROR caught'); }
      if ((await repository.readState()).attempts.length !== after.attempts.length) throw new Error('Failed write changed data');
      note('SQLITE_RETRY_UNCHANGED PASS'); await repository.dispose();
      const fixture = await openDatabaseAsync('chess69-migration-proof.db');
      await fixture.execAsync('CREATE TABLE IF NOT EXISTS installation_state (id INTEGER PRIMARY KEY, payload TEXT NOT NULL); PRAGMA user_version=0;');
      const seeded = createEmptyState(); seeded.preferences.onboarded = true;
      await fixture.runAsync('INSERT OR REPLACE INTO installation_state (id,payload) VALUES (1,?)', JSON.stringify(seeded)); await fixture.closeAsync();
      const migrated = createSQLiteRepositoryService({ databaseName: 'chess69-migration-proof.db' }); await migrated.initialize();
      if (!(await migrated.readState()).preferences.onboarded) throw new Error('Migration erased fixture');
      note('SQLITE_MIGRATION_0_TO_1_DATA_RETAINED PASS'); await migrated.dispose();
      const newer = await openDatabaseAsync('chess69-migration-proof.db'); await newer.execAsync('PRAGMA user_version=2;'); await newer.closeAsync();
      try { await migrated.initialize(); throw new Error('Future migration accepted'); } catch (error) { if (error instanceof Error && error.message === 'Future migration accepted') throw error; note(`SQLITE_MIGRATION_ERROR ${String(error)}`); }
      const retry = await openDatabaseAsync('chess69-migration-proof.db'); await retry.execAsync('PRAGMA user_version=1;'); await retry.closeAsync();
      await migrated.initialize(); if (!(await migrated.readState()).preferences.onboarded) throw new Error('Migration failure erased fixture');
      note('SQLITE_MIGRATION_RETRY_DATA_RETAINED PASS'); await migrated.dispose();
      const engine = createStockfishEngineService(); await engine.initialize(); note('STOCKFISH_UCI_READY PASS');
      for (const level of ['beginner', 'casual', 'club'] as const) {
        const result = await engine.evaluate(new Chess().fen(), { level, movetime: 150 });
        if (!result.bestMove) throw new Error('No best move');
        new Chess().move({ from: result.bestMove.slice(0, 2), to: result.bestMove.slice(2, 4), promotion: result.bestMove[4] });
        note(`STOCKFISH_${level} ${JSON.stringify(result)} LEGAL PASS`);
      }
      const controller = new AbortController();
      const thinking = engine.evaluate(new Chess().fen(), { level: 'club', movetime: 5000 }, controller.signal);
      setTimeout(() => controller.abort(), 60);
      try { await thinking; throw new Error('Cancellation ignored'); } catch (error) { if (!(error instanceof Error) || error.name !== 'AbortError') throw error; note('STOCKFISH_CANCEL PASS'); }
      const reused = await engine.evaluate(new Chess().fen(), { level: 'club', movetime: 100 });
      note(`STOCKFISH_REUSED ${reused.bestMove} PASS`);
      const mate = await engine.evaluate('7k/6pp/5KQ1/8/8/8/8/8 w - - 0 1', { level: 'club', movetime: 150 });
      if (mate.score.type !== 'mate') throw new Error('Mate score missing');
      note(`STOCKFISH_MATE ${JSON.stringify(mate)} PASS`);
      await engine.dispose(); await engine.initialize(); await engine.dispose(); note('STOCKFISH_DISPOSE_REINITIALIZE PASS');
      note('NATIVE_PROOF_COMPLETE');
    })().catch((error) => note(`FAIL ${String(error)} ${error instanceof Error ? error.stack : ''}`));
  }, []);
  return <ScrollView style={{ backgroundColor: '#111318', padding: 24, paddingTop: 50 }}><Text style={{ color: '#ffa246', fontSize: 22 }}>Preuve native Chess69</Text>{lines.map((line, i) => <Text key={i} style={{ color: 'white', fontSize: 15, paddingVertical: 8 }}>{line}</Text>)}</ScrollView>;
}
