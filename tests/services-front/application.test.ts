import { expect, test } from '@jest/globals';
import { createApplicationService } from '../../src/services-front/application/application-service';
import { createLearningService } from '../../src/services-business/learning/learning-service';
import { createRulesService } from '../../src/services-business/adapter/rules/rules-service';
import { createProgressionService } from '../../src/services-business/progression/progression-service';
import { createEmptyState, type RepositoryService } from '../../src/services-business/adapter/repository/repository-type';
import type { CatalogueService, Exercise } from '../../src/services-business/catalogue/catalogue-type';
import type { ApplicationDependencies } from '../../src/services-front/application/application-type';

import { createMemoryRepositoryService } from '../../src/services-business/adapter/repository/repository-service';
import { createMemoryEngineService } from '../../src/services-business/adapter/engine/engine-service';
import { createCatalogueService } from '../../src/services-business/catalogue/catalogue-service';
import { createGameService } from '../../src/services-business/game/game-service';
import { createAnalysisService } from '../../src/services-business/analysis/analysis-service';
import type { StoredState } from '../../src/services-business/adapter/repository/repository-type';


function setup(){
  let data=createEmptyState();let failWrite=false;let failInit=false;
  const repository:RepositoryService={initialize:async()=>{if(failInit)throw new Error('database');},readState:async()=>data,updateState:async(fn)=>{if(failWrite)throw new Error('disk');data=fn(data);return data;},dispose:async()=>{}};
  const rules=createRulesService();const clock={now:()=>new Date('2026-10-13T12:00:00Z')};
  const exercise:Exercise={id:'lesson',kind:'puzzle',title:'Mat',theme:'Mat',difficulty:'beginner',fen:'7k/5Q2/6K1/8/8/8/8/8 w - - 0 1',moves:['f7g7'],alternatives:[],explanation:'La dame mate avec le roi.',hints:['La dame.'],side:'w',goal:'checkmate',objective:'Matez en un coup'};
  const catalogue:CatalogueService={list:()=>[exercise],get:(id)=>id===exercise.id?exercise:undefined,openings:()=>[]};
  const learning=createLearningService({catalogue,repository,rules,clock,ids:{id:()=> 'attempt'}});
  const dependencies:ApplicationDependencies={catalogue,learning,rules,progression:createProgressionService({repository,clock}),initialize:repository.initialize,dispose:repository.dispose,version:'0.2.0',game:{resume:async()=>null,history:async()=>[],start:async()=>{throw new Error();},play:async()=>{throw new Error();},think:async()=>null,cancelThinking:async()=>{},resign:async()=>{throw new Error();},get:async()=>null},analysis:{analyze:async()=>{throw new Error();},get:async()=>null,cancel:async()=>{}}};
  return {service:createApplicationService(dependencies),repository,failWrite:(value:boolean)=>{failWrite=value;},failInit:(value:boolean)=>{failInit=value;}};
}

test('le démarrage en erreur propose une reprise sans supprimer la progression',async()=>{
  const context=setup();context.failInit(true);await context.service.initialize();expect(context.service.getSnapshot()).toMatchObject({status:'error'});
  context.failInit(false);await context.service.retry();expect(context.service.getSnapshot()).toMatchObject({status:'ready',onboarding:true});
});

test('une écriture échouée ne promet pas une sauvegarde et la reprise enregistre une seule réussite',async()=>{
  const context=setup();await context.service.initialize();context.service.startExercise('lesson');context.failWrite(true);
  await context.service.exerciseMove('f7g7');expect(context.service.getSnapshot().error).toContain('pas pu être sauvegardé');expect((await context.repository.readState()).attempts).toHaveLength(0);
  context.failWrite(false);await context.service.retry();expect(context.service.getSnapshot()).toMatchObject({error:null,message:'Réussi sans aide · résultat sauvegardé.'});expect((await context.repository.readState()).attempts).toHaveLength(1);
});

test('les snapshots restent stables sans action et le bouton retour retrouve la liste',async()=>{
  const {service}=setup();await service.initialize();const value=service.getSnapshot();expect(service.getSnapshot()).toBe(value);service.startExercise('lesson');expect(service.back()).toBe(true);expect(service.getSnapshot().page).toBe('list');
});


function deferred() {
  let resolve = () => {};
  const promise = new Promise<void>((done) => { resolve = done; });
  return { promise, resolve };
}

function gameContext(initialState: StoredState = createEmptyState()) {
  const memory = createMemoryRepositoryService({ initialState });
  let heldWrite: { entered: ReturnType<typeof deferred>; released: ReturnType<typeof deferred> } | null = null;
  const repository: RepositoryService = {
    ...memory,
    updateState: async (update) => {
      const held = heldWrite;
      heldWrite = null;
      if (held) { held.entered.resolve(); await held.released.promise; }
      return memory.updateState(update);
    },
  };
  const rules = createRulesService();
  const clock = { now: () => new Date('2026-10-13T12:00:00Z') };
  const catalogue = createCatalogueService();
  let sequence = 0;
  const ids = { id: () => `id-${++sequence}`, random: () => 0.5 };
  const engine = createMemoryEngineService();
  const dependencies: ApplicationDependencies = {
    catalogue, rules,
    learning: createLearningService({ catalogue, repository, rules, clock, ids }),
    progression: createProgressionService({ repository, clock }),
    game: createGameService({ repository, rules, clock, ids, engine }),
    analysis: createAnalysisService({ repository, rules, engine }),
    initialize: async () => { await repository.initialize(); await engine.initialize(); },
    dispose: async () => { await engine.dispose(); await repository.dispose(); },
    version: '0.2.0',
  };
  return {
    service: createApplicationService(dependencies), dependencies, repository, rules, catalogue,
    holdNextWrite() {
      const entered = deferred(); const released = deferred();
      heldWrite = { entered, released };
      return { entered: entered.promise, release: released.resolve };
    },
  };
}

const recordedGame = (id: string, finished: boolean): StoredState['games'][number] => ({
  id, color: 'w', level: 'beginner', moves: [], startedAt: '2026-10-13T11:00:00Z',
  finishedAt: finished ? '2026-10-13T11:30:00Z' : null,
  result: finished ? '0-1' : null, day: finished ? '2026-10-13' : null,
});

test('un coup sauvegardé après navigation conserve le guide courant et sa position', async () => {
  const context = gameContext(); await context.service.initialize();
  await context.service.startGame({ color: 'w', level: 'beginner' });
  const held = context.holdNextWrite();
  const pendingMove = context.service.gameMove('e2e4'); await held.entered;
  context.service.navigate('learn');
  const opening = context.catalogue.openings()[0]!;
  context.service.openOpening(opening.id);
  context.service.startExercise(opening.variationIds[0]!, 'w', true);
  const guided = context.service.getSnapshot();
  held.release(); await pendingMove;
  expect(context.service.getSnapshot()).toMatchObject({
    page: 'exercise', position: { fen: guided.position?.fen }, learning: { fen: guided.learning?.fen }, message: guided.message,
  });
  expect((await context.repository.readState()).games[0]?.moves).toEqual(['e2e4']);
});

test('consulter une partie terminée puis revenir conserve la partie active disponible', async () => {
  const initial = createEmptyState(); initial.games = [recordedGame('finished', true), recordedGame('active', false)];
  const { service } = gameContext(initial); await service.initialize();
  await service.openAnalysis('finished');
  expect(service.getSnapshot().game?.record.id).toBe('finished');
  service.navigate('home');
  expect(service.getSnapshot()).toMatchObject({ activeGame: { record: { id: 'active', finishedAt: null } } });
  await service.resumeGame();
  expect(service.getSnapshot()).toMatchObject({ page: 'game', game: { record: { id: 'active' } } });
});

test('les révisions exposées ne permettent pas de modifier les snapshots sans action', async () => {
  const initial = createEmptyState();
  initial.reviews.lesson = { contentId: 'lesson', color: 'w', stage: 1, streak: 0, due: '2026-10-13T00:00:00Z' };
  const { service } = gameContext(initial); await service.initialize();
  const snapshot = service.getSnapshot(); const review = snapshot.summary!.due[0]!;
  expect(Reflect.set(review, 'stage', 5)).toBe(false);
  expect(review.stage).toBe(1);
  expect(service.getSnapshot()).toBe(snapshot);
});

function analyzedState(): StoredState {
  const initial = createEmptyState(); const rules = createRulesService();
  const moves = ['f2f3', 'e7e5', 'g2g4', 'd8h4'];
  initial.games = [{ ...recordedGame('finished', true), moves }];
  initial.analyses.finished = {
    gameId: 'finished', complete: true,
    positions: Array.from({ length: 5 }, (_, ply) => ({
      ply, fen: rules.position(undefined, moves.slice(0, ply)).fen,
      bestMove: ply === 4 ? null : ply === 1 ? 'e7e5' : 'e2e4',
      score: { type: 'cp', value: ply === 0 ? 125 : 50 }, pv: ply === 4 ? [] : ['e7e5', 'g1f3'],
    })),
  };
  return initial;
}

test.each([
  { type: 'cp' as const, value: 125, ply: 0, text: 'Évaluation pour les blancs : +1.25 pions' },
  { type: 'cp' as const, value: -75, ply: 0, text: 'Évaluation pour les blancs : -0.75 pions' },
  { type: 'mate' as const, value: 2, ply: 0, text: 'Mat annoncé en 2 pour les blancs' },
  { type: 'mate' as const, value: -2, ply: 0, text: 'Mat annoncé en 2 pour les noirs' },
  { type: 'mate' as const, value: 0, ply: 4, text: 'Échec et mat · les noirs gagnent.' },
])('le snapshot donne le message de résultat $type $value à la position $ply', async ({ type, value, ply, text }) => {
  const initial = analyzedState(); initial.analyses.finished!.positions[ply]!.score = { type, value };
  const { service } = gameContext(initial); await service.initialize(); await service.openAnalysis('finished'); service.selectPly(ply);
  expect(service.getSnapshot()).toHaveProperty('analysisDetails.evaluationMessage', text);
});

test('le front expose le meilleur coup, la suite et la qualité sans calcul dans le composant', async () => {
  const { service } = gameContext(analyzedState()); await service.initialize(); await service.openAnalysis('finished'); service.selectPly(1);
  expect(service.getSnapshot()).toHaveProperty('analysisDetails.bestMoveMessage', 'Meilleur coup : e7e5');
  expect(service.getSnapshot()).toHaveProperty('analysisDetails.continuationMessage', 'Suite conseillée : e7e5 · g1f3');
  expect(service.getSnapshot()).toHaveProperty('analysisDetails.assessmentMessage', 'Imprécision · écart de 0.75 pion(s)');
  const score = service.getSnapshot().analysis!.record.positions[1]!.score;
  expect(Reflect.set(score, 'value', 9999)).toBe(false);
  expect(score.value).toBe(50);
});

test('une initialisation terminée après arrêt et réinitialisation ne publie aucun ancien snapshot', async () => {
  const context = gameContext(); const entered = deferred(); const released = deferred(); let first = true;
  const service = createApplicationService({ ...context.dependencies, initialize: async () => {
    if (first) { first = false; entered.resolve(); await released.promise; }
    await context.dependencies.initialize();
  } });
  const old = service.initialize(); await entered.promise; await service.dispose(); await service.initialize();
  const current = service.getSnapshot();
  released.resolve(); await old;
  expect(service.getSnapshot()).toBe(current);
});

test('ouvrir une analyse dont la lecture est retardée ne remplace pas un nouveau guide', async () => {
  const context = gameContext(analyzedState()); const entered = deferred(); const released = deferred();
  const service = createApplicationService({ ...context.dependencies, analysis: { ...context.dependencies.analysis, get: async (id) => {
    entered.resolve(); await released.promise; return context.dependencies.analysis.get(id);
  } } });
  await service.initialize(); const pending = service.openAnalysis('finished'); await entered.promise;
  service.navigate('learn'); const lesson = context.catalogue.openings()[0]!.variationIds[0]!; service.startExercise(lesson, 'w', true);
  const guide = service.getSnapshot(); released.resolve(); await pending;
  expect(service.getSnapshot()).toMatchObject({ page: 'exercise', position: { fen: guide.position!.fen }, learning: { exercise: { id: lesson } } });
});

test('les callbacks et résultats tardifs d’une analyse annulée ne remplacent pas le guide', async () => {
  const context = gameContext(analyzedState()); const entered = deferred(); const released = deferred();
  const service = createApplicationService({ ...context.dependencies, analysis: { ...context.dependencies.analysis, analyze: async (id, options) => {
    const view = (await context.dependencies.analysis.get(id))!;
    entered.resolve(); await released.promise; options?.onProgress?.(view); return view;
  } } });
  await service.initialize(); await service.openAnalysis('finished'); const pending = service.analyze(); await entered.promise;
  expect(service.getSnapshot()).toHaveProperty('analysisDetails.statusMessage', 'Analyse : 5 / 5 positions');
  service.navigate('learn'); const lesson = context.catalogue.openings()[0]!.variationIds[0]!; service.startExercise(lesson, 'w', true);
  const guide = service.getSnapshot(); released.resolve(); await pending;
  expect(service.getSnapshot()).toMatchObject({ page: 'exercise', position: { fen: guide.position!.fen }, analysis: null, analyzing: false, message: guide.message });
});

test('le choix de camp et de difficulté reprend les préférences de l’installation', async () => {
  const initial = createEmptyState(); initial.preferences = { color: 'b', level: 'club', onboarded: true };
  const { service, repository } = gameContext(initial); await service.initialize();
  expect(service.getSnapshot()).toHaveProperty('gameOptions', { color: 'b', level: 'club' });
  await service.startGame({ color: 'w', level: 'casual' });
  expect(service.getSnapshot()).toHaveProperty('gameOptions', { color: 'w', level: 'casual' });
  expect((await repository.readState()).preferences).toMatchObject({ color: 'w', level: 'casual' });
});
