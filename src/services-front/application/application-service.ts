import type { ApplicationDependencies, ApplicationService, ApplicationSnapshot, Destination, AnalysisPresentation } from './application-type';
import { mateWinner } from '../../services-business/analysis/analysis-service';
import type { MoveQuality } from '../../services-business/analysis/analysis-type';
import type { LearningAction } from '../../services-business/learning/learning-type';

export const createApplicationService = (dependencies: ApplicationDependencies): ApplicationService => {
  const { catalogue, learning, game, analysis, progression, rules } = dependencies;
  const frozenValues = new WeakSet<object>();
  let state: ApplicationSnapshot = freezeSnapshot({
    status: 'loading', destination: 'home', page: 'list', message: null, error: null,
    busy: false, thinking: false, analyzing: false, onboarding: false, replacementRequired: false,
    version: dependencies.version, kind: 'opening', theme: null, difficulty: null,
    titles: Object.fromEntries(catalogue.list().map((exercise) => [exercise.id, exercise.title])),
    catalogue: catalogue.list({ kind: 'opening' }), openings: catalogue.openings(), opening: null,
    summary: null, learning: null, gameOptions: { color: 'w', level: 'beginner' }, activeGame: null, game: null, history: [],
    analysis: null, analysisDetails: null, selectedPly: 0, position: null,
  }, frozenValues);
  const listeners = new Set<() => void>();
  let retryAction: (() => Promise<void>) | null = null;
  let contextGeneration = 0;
  let lifecycleGeneration = 0;
  let busyGeneration = 0;
  let refreshGeneration = 0;
  let analysisGeneration = 0;
  let thinkingGeneration = 0;
  let disposed = false;

  const update = (change: Partial<ApplicationSnapshot>): void => {
    if (disposed) return;
    const next = { ...state, ...change };
    state = freezeSnapshot({ ...next, analysisDetails: projectAnalysis(next) }, frozenValues);
    for (const listener of listeners) listener();
  };
  const currentLifecycle = (): (() => boolean) => {
    const generation = lifecycleGeneration;
    return () => !disposed && generation === lifecycleGeneration;
  };
  const currentContext = (): (() => boolean) => {
    const lifecycle = currentLifecycle();
    const context = contextGeneration;
    return () => lifecycle() && context === contextGeneration;
  };
  // Refresh only global data. A late persisted move must never replace a guide
  // or the position selected in a historical game.
  const refresh = async (): Promise<void> => {
    const isAlive = currentLifecycle();
    const generation = ++refreshGeneration;
    const [summary, activeGame, history, preferences] = await Promise.all([progression.summary(), game.resume(), game.history(), progression.preferences()]);
    if (!isAlive() || generation !== refreshGeneration) return;
    const displayedGame = state.page === 'analysis' ? state.game
      : state.page === 'game' ? (activeGame?.record.id === state.game?.record.id ? activeGame : state.game)
      : activeGame;
    update({ summary, activeGame, history, game: displayedGame, gameOptions: { color: preferences.color, level: preferences.level } });
  };
  const run = async (operation: (isCurrent: () => boolean) => Promise<void>, message: string): Promise<void> => {
    if (disposed || state.busy) return;
    const context = currentContext();
    const generation = ++busyGeneration;
    const isCurrent = () => context() && generation === busyGeneration;
    update({ busy: true, error: null });
    retryAction = () => run(operation, message);
    try {
      await operation(isCurrent);
      if (isCurrent()) retryAction = null;
    } catch {
      if (isCurrent()) update({ error: message });
    } finally {
      if (isCurrent()) update({ busy: false });
    }
  };
  const stopAnalysis = (): void => {
    analysisGeneration += 1;
    update({ analyzing: false });
    void analysis.cancel().catch(() => undefined);
  };
  const enterContext = (): void => {
    contextGeneration += 1;
    busyGeneration += 1;
    thinkingGeneration += 1;
    retryAction = null;
    stopAnalysis();
    void game.cancelThinking().catch(() => undefined);
    update({ busy: false, thinking: false, error: null, message: null, replacementRequired: false });
  };
  const navigate = (destination: Destination): void => {
    enterContext();
    update({ destination, page: 'list', learning: null, opening: null, analysis: null,
      position: null, selectedPly: 0, game: state.activeGame });
  };
  const syncLearning = (action: LearningAction): void => {
    if (!action.ok) {
      update({ error: 'Cet exercice est indisponible. Revenez à la liste et réessayez.' });
      return;
    }
    const value = action.snapshot;
    const message = value.feedback === 'incorrect' ? 'Ce coup est légal, mais ce n’est pas la suite attendue. Réessayez ou demandez un indice.'
      : value.feedback === 'illegal' ? 'Ce coup n’est pas légal dans cette position.'
      : value.status === 'completed' ? 'Séquence terminée. Enregistrement du résultat…' : null;
    update({ learning: value, position: rules.position(value.fen), selectedPly: value.ply, message, error: null });
  };
  const saveLearning = async (isCurrent: () => boolean): Promise<void> => {
    const result = await learning.finish();
    if (!result.ok) throw new Error(result.reason);
    if (isCurrent()) {
      update({ learning: learning.snapshot(), message: result.attempt.outcome === 'success'
        ? 'Réussi sans aide · résultat sauvegardé.' : result.attempt.outcome === 'assisted'
          ? 'Terminé avec aide · à retravailler.' : 'À revoir · résultat sauvegardé.' });
    }
    await refresh();
  };
  const think = async (): Promise<void> => {
    const displayed = state.game;
    if (state.page !== 'game' || state.thinking || !displayed || displayed.record.finishedAt
      || displayed.position.turn === displayed.record.color) return;
    const context = currentContext();
    const generation = ++thinkingGeneration;
    const isCurrent = () => context() && generation === thinkingGeneration && state.game?.record.id === displayed.record.id;
    update({ thinking: true, error: null, message: 'Stockfish réfléchit…' });
    try {
      const session = await game.think();
      if (session && isCurrent()) update({ game: session, position: session.position, message: gameMessage(session) });
      await refresh();
    } catch {
      if (isCurrent()) {
        retryAction = think;
        update({ error: 'Le moteur n’a pas répondu. Réessayez ; les coups joués sont conservés.', message: null });
      }
    } finally {
      if (isCurrent()) update({ thinking: false });
    }
  };

  const service: ApplicationService = {
    getSnapshot: () => state,
    subscribe(callback) { listeners.add(callback); return () => listeners.delete(callback); },
    async initialize() {
      lifecycleGeneration += 1;
      disposed = false;
      const isAlive = currentLifecycle();
      contextGeneration += 1;
      busyGeneration += 1;
      thinkingGeneration += 1;
      analysisGeneration += 1;
      retryAction = null;
      update({ status: 'loading', error: null, busy: false, thinking: false, analyzing: false });
      try {
        await dependencies.initialize();
        if (!isAlive()) return;
        await refresh();
        if (!isAlive()) return;
        const preferences = await progression.preferences();
        if (isAlive()) update({ status: 'ready', onboarding: !preferences.onboarded });
      } catch {
        if (isAlive()) {
          retryAction = service.initialize;
          update({ status: 'error', error: 'Impossible d’ouvrir les données locales ou le moteur. Réessayez. Votre progression n’est pas effacée.' });
        }
      }
    },
    async retry() { if (retryAction) await retryAction(); },
    async dispose() {
      disposed = true;
      lifecycleGeneration += 1;
      contextGeneration += 1;
      analysisGeneration += 1;
      thinkingGeneration += 1;
      listeners.clear();
      await dependencies.dispose();
    },
    navigate,
    back() {
      if (state.page !== 'list') {
        const page = state.page === 'exercise' && state.opening ? 'opening' : 'list';
        enterContext();
        update({ page, learning: null, analysis: null, position: null, game: state.activeGame });
        return true;
      }
      if (state.destination !== 'home') { navigate('home'); return true; }
      return false;
    },
    dismissOnboarding: () => run(async (isCurrent) => {
      await progression.markOnboarded();
      if (isCurrent()) update({ onboarding: false });
    }, 'Le guide n’a pas pu être enregistré. Réessayez.'),
    filter(kind, theme = null, difficulty = null) {
      enterContext();
      update({ kind, theme, difficulty, catalogue: catalogue.list({ kind, ...(theme ? { theme } : {}),
        ...(difficulty ? { difficulty } : {}) }), opening: null, page: 'list' });
    },
    openOpening(id) {
      const opening = catalogue.openings().find((item) => item.id === id);
      if (!opening) return;
      enterContext();
      update({ opening, page: 'opening', destination: 'learn' });
    },
    startExercise(id, color, guided = false) {
      const action = learning.start(id, color, guided ? 'guided' : 'memory');
      if (!action.ok) { syncLearning(action); return; }
      enterContext();
      update({ destination: 'learn', page: 'exercise' });
      syncLearning(action);
    },
    exerciseMove: (move) => run(async (isCurrent) => {
      if (learning.snapshot()?.status === 'playing') syncLearning(learning.play(move));
      if (learning.snapshot()?.status === 'completed') await saveLearning(isCurrent);
    }, 'Le résultat n’a pas pu être sauvegardé. Touchez Réessayer ; ne quittez pas cet exercice.'),
    hint() { syncLearning(learning.hint()); },
    reveal: () => run(async (isCurrent) => {
      if (learning.snapshot()?.status === 'playing') syncLearning(learning.reveal());
      await saveLearning(isCurrent);
    }, 'La solution est visible, mais le résultat n’a pas été sauvegardé. Réessayez.'),
    async startGame(options, confirmed = false) {
      if (state.busy) return;
      enterContext();
      const context = currentContext();
      await run(async (isCurrent) => {
        try {
          await game.cancelThinking();
          const session = await game.start(options, confirmed);
          if (isCurrent()) update({ game: session, activeGame: session, destination: 'play', page: 'game',
            position: session.position, replacementRequired: false, message: gameMessage(session) });
          await refresh();
        } catch (error) {
          if (error instanceof Error && 'code' in error && error.code === 'replacement-required') {
            if (isCurrent()) update({ replacementRequired: true });
            return;
          }
          throw error;
        }
      }, 'Impossible de démarrer la partie. Votre partie précédente est conservée.');
      if (context() && state.page === 'game' && !state.error) await think();
    },
    dismissReplacement() { update({ replacementRequired: false }); },
    async resumeGame() {
      if (state.busy) return;
      enterContext();
      await run(async (isCurrent) => {
        const session = await game.resume();
        if (!isCurrent()) return;
        if (!session) { update({ activeGame: null, message: 'Aucune partie à reprendre.' }); return; }
        update({ game: session, activeGame: session, destination: 'play', page: 'game', position: session.position, message: gameMessage(session) });
        void think();
      }, 'Impossible de reprendre la partie. Réessayez.');
    },
    async gameMove(move) {
      const context = currentContext();
      await run(async (isCurrent) => {
        const session = await game.play(move);
        if (isCurrent()) update({ game: session, position: session.position, message: gameMessage(session) });
        await refresh();
      }, 'Ce coup n’a pas pu être enregistré. Réessayez ; la position sauvegardée est conservée.');
      if (context() && !state.error) await think();
    },
    resign: () => run(async (isCurrent) => {
      await game.cancelThinking();
      const session = await game.resign();
      if (isCurrent()) update({ game: session, position: session.position, message: 'Partie abandonnée · conservée dans l’historique.' });
      await refresh();
    }, 'L’abandon n’a pas été sauvegardé. Réessayez.'),
    async showHistory() {
      if (state.busy) return;
      enterContext();
      await run(async (isCurrent) => {
        const history = await game.history();
        if (isCurrent()) update({ history, destination: 'play', page: 'history', game: state.activeGame, message: null });
      }, 'Impossible de lire l’historique. Réessayez.');
    },
    async openAnalysis(id) {
      if (state.busy) return;
      enterContext();
      await run(async (isCurrent) => {
        await game.cancelThinking();
        if (!isCurrent()) return;
        const session = await game.get(id);
        if (!session) throw new Error('missing');
        if (!isCurrent()) return;
        const value = await analysis.get(id);
        if (isCurrent()) update({ game: session, analysis: value, destination: 'play', page: 'analysis',
          selectedPly: 0, position: rules.position(), message: null });
      }, 'Impossible d’ouvrir cette partie. Réessayez.');
    },
    async analyze() {
      if (state.page !== 'analysis' || state.analyzing || !state.game) return;
      const context = currentContext();
      const generation = ++analysisGeneration;
      const isCurrent = () => context() && generation === analysisGeneration;
      const gameId = state.game.record.id;
      update({ analyzing: true, error: null });
      try {
        const view = await analysis.analyze(gameId, { onProgress: (value) => {
          if (isCurrent()) update({ analysis: value });
        } });
        if (isCurrent()) update({ analysis: view, message: view.record.complete
          ? 'Analyse terminée et sauvegardée.' : 'Analyse interrompue · positions calculées conservées.' });
      } catch {
        if (isCurrent()) {
          retryAction = service.analyze;
          update({ error: 'L’analyse a été interrompue par une erreur. Réessayez pour reprendre les positions restantes.' });
        }
      } finally {
        if (isCurrent()) update({ analyzing: false });
      }
    },
    async cancelAnalysis() {
      const context = currentContext();
      const gameId = state.page === 'analysis' ? state.game?.record.id : undefined;
      stopAnalysis();
      const generation = analysisGeneration;
      await analysis.cancel();
      if (!gameId || !context() || generation !== analysisGeneration) return;
      const view = await analysis.get(gameId);
      if (context() && generation === analysisGeneration) update({ analysis: view, message: 'Analyse annulée · calculs sauvegardés conservés.' });
    },
    selectPly(ply) {
      if (state.page === 'exercise' && state.learning?.mode === 'guided') {
        const session = state.learning;
        const selectedPly = Math.max(0, Math.min(ply, session.exercise.moves.length));
        update({ selectedPly, position: rules.position(session.exercise.fen, session.exercise.moves.slice(0, selectedPly)) });
        return;
      }
      if (state.page !== 'analysis' || !state.game) return;
      const selectedPly = Math.max(0, Math.min(ply, state.game.record.moves.length));
      update({ selectedPly, position: rules.position(undefined, state.game.record.moves.slice(0, selectedPly)) });
    },
    async foreground() {
      if (state.status !== 'ready') return;
      const context = currentContext();
      await run(async () => refresh(), 'Impossible de relire les données locales. Réessayez.');
      if (context() && state.page === 'game') await think();
    },
  };
  return service;
};

function gameMessage(session: NonNullable<ApplicationSnapshot['game']>): string {
  if (session.record.finishedAt) {
    const endings = { checkmate: 'Échec et mat', stalemate: 'Pat', 'insufficient-material': 'Matériel insuffisant',
      'threefold-repetition': 'Répétition de position', 'fifty-move': 'Règle des 50 coups' };
    return `${session.position.endReason ? endings[session.position.endReason] : 'Partie terminée'} · ${session.record.result}`;
  }
  if (session.position.checkSquare) return 'Échec ! Protégez votre roi.';
  return session.position.turn === session.record.color ? 'À vous de jouer.' : 'Au tour de Stockfish.';
}

function freezeSnapshot<T extends object>(value: T, seen: WeakSet<object>): T {
  if (seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) {
    if (child && typeof child === 'object') freezeSnapshot(child, seen);
  }
  return Object.freeze(value);
}

const qualityLabels: Readonly<Record<MoveQuality, string>> = {
  good: 'Bon coup', inaccuracy: 'Imprécision', mistake: 'Erreur', blunder: 'Grosse erreur',
  'missed-mate': 'Mat manqué', 'allows-mate': 'Mat permis',
};

function projectAnalysis(state: ApplicationSnapshot): AnalysisPresentation | null {
  if (state.page !== 'analysis' || !state.game) return null;
  const position = state.analysis?.record.positions.find((item) => item.ply === state.selectedPly);
  const assessment = state.analysis?.assessments.find((item) => item.ply === state.selectedPly);
  let evaluationMessage = 'Cette position n’a pas encore été analysée.';
  if (position?.score.type === 'mate') {
    const color = mateWinner(position) > 0 ? 'blancs' : 'noirs';
    evaluationMessage = position.score.value === 0 ? `Échec et mat · les ${color} gagnent.`
      : `Mat annoncé en ${Math.abs(position.score.value)} pour les ${color}`;
  } else if (position) {
    const value = position.score.value;
    evaluationMessage = `Évaluation pour les blancs : ${value >= 0 ? '+' : ''}${(value / 100).toFixed(2)} pions`;
  }
  return {
    evaluationMessage,
    bestMoveMessage: position?.bestMove ? `Meilleur coup : ${position.bestMove}` : null,
    continuationMessage: position?.pv.length ? `Suite conseillée : ${position.pv.slice(0, 6).join(' · ')}` : null,
    assessmentMessage: assessment ? `${qualityLabels[assessment.quality]}${assessment.loss !== null ? ` · écart de ${(assessment.loss / 100).toFixed(2)} pion(s)` : ''}` : null,
    statusMessage: state.analyzing ? `Analyse : ${state.analysis?.record.positions.length ?? 0} / ${state.game.record.moves.length + 1} positions`
      : state.message ?? 'Le calcul se fait sur le téléphone. Vous pouvez parcourir les coups pendant l’analyse.',
    actionLabel: state.analysis?.record.complete ? 'Revoir les résultats' : 'Analyser les positions restantes',
  };
}
