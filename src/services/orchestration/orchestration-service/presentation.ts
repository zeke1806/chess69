import * as R from 'remeda';
import type { BoardContext } from '../../board/board-types';
import type { OrchestrationState } from '../orchestration-types';

export function presentShell(state: OrchestrationState): OrchestrationState {
  const { route } = state.shell;
  const labels = { home: 'Chess69', learn: 'Apprendre', play: 'Jouer', progress: 'Progression' };
  const kinds = { opening: 'Ouvertures', puzzle: 'Puzzles', endgame: 'Finales' };
  const title =
    route.page === 'exercise' && state.learning.session
      ? kinds[state.learning.session.exercise.kind]
      : route.page === 'opening'
        ? 'Ouvertures'
        : route.page === 'game'
          ? 'Partie contre Stockfish'
          : route.page === 'history'
            ? 'Historique'
            : route.page === 'analysis'
              ? 'Analyse locale'
              : labels[route.destination];
  const error =
    state.shell.status === 'error'
      ? state.shell.error
      : route.page === 'analysis'
        ? state.analysis.error
        : route.destination === 'learn'
          ? state.learning.error
          : route.destination === 'play'
            ? state.game.error
            : state.progression.error;
  return R.pipe(
    state,
    R.setPath(['shell', 'title'], title),
    R.setPath(['shell', 'error'], error),
    R.setPath(
      ['shell', 'scrollKey'],
      `${route.destination}:${route.page}:${state.learning.opening?.id ?? ''}:${state.learning.session?.exercise.id ?? ''}`,
    ),
  );
}

export function presentBoard(state: OrchestrationState): BoardContext | null {
  const { page } = state.shell.route;
  if (page === 'exercise') {
    const { session, position, selectedPly, busy } = state.learning;
    if (!session || !position) {
      return null;
    }
    return {
      key: `exercise:${session.exercise.id}:${session.mode}:${selectedPly}`,
      fen: position.fen,
      color: session.color,
      legalMoves: session.legalMoves,
      lastMove: session.lastMove,
      checkSquare: position.checkSquare,
      disabled:
        busy ||
        session.status !== 'playing' ||
        (session.mode === 'guided' && selectedPly !== session.ply),
    };
  }
  if (page === 'game') {
    const { session, busy, thinking } = state.game;
    if (!session) {
      return null;
    }
    return {
      key: `game:${session.record.id}`,
      fen: session.position.fen,
      color: session.record.color,
      legalMoves: session.position.legalMoves,
      lastMove: session.record.moves.at(-1) ?? null,
      checkSquare: session.position.checkSquare,
      disabled:
        busy ||
        thinking ||
        !!session.record.finishedAt ||
        session.position.turn !== session.record.color,
    };
  }
  if (page === 'analysis') {
    const { session, position, selectedPly } = state.analysis;
    if (!session || !position) {
      return null;
    }
    return {
      key: `analysis:${session.record.id}:${selectedPly}`,
      fen: position.fen,
      color: session.record.color,
      legalMoves: [],
      lastMove: session.record.moves[selectedPly - 1] ?? null,
      checkSquare: position.checkSquare,
      disabled: true,
    };
  }
  return null;
}

export function freezeState<Value extends object>(value: Value, seen: WeakSet<object>): Value {
  if (seen.has(value)) {
    return value;
  }
  seen.add(value);
  for (const child of Object.values(value)) {
    if (child && typeof child === 'object') {
      freezeState(child, seen);
    }
  }
  return Object.freeze(value);
}
