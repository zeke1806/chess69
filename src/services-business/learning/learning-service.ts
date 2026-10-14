import * as R from 'remeda';
import { localDay } from '../calendar/calendar-service';
import type { Attempt, Review } from './learning-types';
import type {
  LearningAction,
  LearningDependencies,
  LearningResult,
  LearningService,
  LearningSnapshot,
} from './learning-types';

export function createLearningService({
  catalogue,
  repository,
  rules,
  clock,
  ids,
}: LearningDependencies): LearningService {
  let current: LearningSnapshot | null = null;
  let paths: ReadonlyArray<ReadonlyArray<string>> = [];
  let saving = false;
  let saved: LearningResult | null = null;
  return {
    snapshot: () => {
      return current;
    },

    start(contentId, color, mode = 'memory') {
      if (saving) {
        return { ok: false, reason: 'saving' };
      }
      const exercise = catalogue.get(contentId);
      if (!exercise) {
        return { ok: false, reason: 'unknown-content' };
      }
      const trainedColor = color ?? exercise.side;
      if (exercise.kind !== 'opening' && trainedColor !== exercise.side) {
        return { ok: false, reason: 'wrong-color' };
      }
      paths = [exercise.moves, ...exercise.alternatives];
      saved = null;
      current = advance({
        exercise,
        color: trainedColor,
        mode,
        fen: exercise.fen,
        ply: 0,
        status: 'playing',
        legalMoves: [],
        expectedMove: null,
        lastMove: null,
        errorCount: 0,
        assisted: mode === 'guided',
        hint: null,
        feedback: null,
      });
      return { ok: true, snapshot: current };
    },

    play(move) {
      const guard = canPlay();
      if (guard) {
        return guard;
      }
      const session = current!;
      const nextFen = rules.play(session.fen, [], move)?.fen;
      if (!nextFen) {
        current = Object.freeze(R.set(session, 'feedback', 'illegal'));
        return { ok: true, snapshot: current };
      }
      const matching = R.filter(paths, (path) => path[session.ply] === move);
      if (matching.length === 0) {
        current = Object.freeze(
          R.pipe(
            session,
            R.set('errorCount', session.errorCount + 1),
            R.set('feedback', 'incorrect'),
            R.set('expectedMove', paths[0]?.[session.ply] ?? null),
          ),
        );
        return { ok: true, snapshot: current };
      }
      paths = matching;
      current = advance(
        R.merge(session, {
          fen: nextFen,
          ply: session.ply + 1,
          lastMove: move,
          feedback: 'correct',
          hint: null,
        } satisfies Partial<LearningSnapshot>),
      );
      return { ok: true, snapshot: current };
    },

    hint() {
      const guard = canPlay();
      if (guard) {
        return guard;
      }
      const session = current!;
      const hintIndex = Math.min(Math.floor(session.ply / 2), session.exercise.hints.length - 1);
      current = Object.freeze(
        R.pipe(
          session,
          R.set('assisted', true),
          R.set('hint', session.exercise.hints[hintIndex] ?? session.exercise.explanation),
          R.set('expectedMove', paths[0]?.[session.ply] ?? null),
        ),
      );
      return { ok: true, snapshot: current };
    },

    reveal() {
      const guard = canPlay();
      if (guard) {
        return guard;
      }
      const session = current!;
      let fen = session.fen;
      const path = paths[0]!;
      for (const move of path.slice(session.ply)) {
        const nextFen = rules.play(fen, [], move)?.fen;
        if (nextFen) {
          fen = nextFen;
        }
      }
      current = Object.freeze(
        R.merge(session, {
          fen,
          ply: path.length,
          lastMove: path.at(-1) ?? null,
          assisted: true,
          status: 'revealed',
          legalMoves: [],
          expectedMove: null,
          hint: session.exercise.explanation,
        } satisfies Partial<LearningSnapshot>),
      );
      return { ok: true, snapshot: current };
    },

    async finish() {
      if (saving) {
        return { ok: false, reason: 'saving' };
      }
      if (saved) {
        return saved;
      }
      if (!current) {
        return { ok: false, reason: 'not-started' };
      }
      if (current.status === 'playing') {
        return { ok: false, reason: 'unfinished' };
      }
      const session = current;
      const now = clock.now();
      const attempt: Attempt = {
        id: ids.id(),
        contentId: session.exercise.id,
        kind: session.exercise.kind,
        outcome: session.errorCount > 0 ? 'failed' : session.assisted ? 'assisted' : 'success',
        at: now.toISOString(),
        day: localDay(now),
      };
      saving = true;
      const reviewKey = `${attempt.contentId}:${session.color}`;
      try {
        const review = await repository.saveAttempt(
          attempt,
          session.exercise.kind === 'opening' ? reviewKey : undefined,
          session.exercise.kind === 'opening'
            ? (previous) => {
                return scheduleReview(previous, attempt, now, session.color);
              }
            : undefined,
        );
        saved = { ok: true, attempt, review };
        current = Object.freeze(R.set(session, 'status', 'saved'));
        return saved;
      } catch {
        return { ok: false, reason: 'save-failed' };
      } finally {
        saving = false;
      }
    },
  };

  function canPlay(): Extract<
    LearningAction,
    {
      ok: false;
    }
  > | null {
    if (saving) {
      return { ok: false, reason: 'saving' };
    }
    if (!current) {
      return { ok: false, reason: 'not-started' };
    }
    if (current.status !== 'playing') {
      return { ok: false, reason: 'not-playing' };
    }
    return null;
  }

  function advance(session: LearningSnapshot): LearningSnapshot {
    let fen = session.fen;
    let ply = session.ply;
    let lastMove = session.lastMove;
    const path = paths[0]!;
    while (ply < path.length && rules.position(fen).turn !== session.color) {
      const move = path[ply]!;
      const nextFen = rules.play(fen, [], move)?.fen;
      if (!nextFen) {
        throw new Error(`Invalid catalogue move ${session.exercise.id}:${ply}`);
      }
      fen = nextFen;
      lastMove = move;
      paths = R.filter(paths, (candidate) => candidate[ply] === move);
      ply += 1;
    }
    const complete = paths.some((candidate) => ply >= candidate.length);
    return Object.freeze(
      R.merge(session, {
        fen,
        ply,
        lastMove,
        status: complete ? 'completed' : 'playing',
        legalMoves: complete ? [] : Object.freeze([...rules.position(fen).legalMoves]),
        expectedMove: !complete && session.mode === 'guided' ? (paths[0]?.[ply] ?? null) : null,
      } satisfies Partial<LearningSnapshot>),
    );
  }
}

function scheduleReview(
  previous: Review | undefined,
  attempt: Attempt,
  now: Date,
  color: 'w' | 'b',
): Review {
  if (attempt.outcome !== 'success') {
    return { contentId: attempt.contentId, color, stage: 0, streak: 0, due: now.toISOString() };
  }
  if (previous && previous.stage > 0 && now.toISOString() < previous.due) {
    return previous;
  }
  const stage = Math.min((previous?.stage ?? 0) + 1, 5);
  const date = new Date(now);
  date.setDate(date.getDate() + [1, 3, 7, 14, 30][stage - 1]!);
  return {
    contentId: attempt.contentId,
    color,
    stage,
    streak: previous && previous.stage > 0 ? previous.streak + 1 : 0,
    due: date.toISOString(),
  };
}
