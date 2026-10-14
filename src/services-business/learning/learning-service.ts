import * as R from 'remeda';
import { localDay } from '../calendar/calendar-service';
import type { Attempt, Review } from './learning-types';
import type {
  LearningAction,
  LearningDependencies,
  LearningResult,
  LearningService,
  LearningSnapshot,
  LearningSessionData,
} from './learning-types';

export function createLearningService({
  catalogue,
  repository,
  rules,
  clock,
  ids,
}: LearningDependencies): LearningService {
  return {
    createInitialSession: () => {
      return { current: null, paths: [], saving: false, saved: null };
    },

    snapshot: (data) => {
      return data.read().current;
    },

    start(data, contentId, color, mode = 'memory') {
      if (data.read().saving) {
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
      data.update(R.set('paths', [exercise.moves, ...exercise.alternatives]));
      data.update(R.set('saved', null));
      data.update(
        R.set(
          'current',
          advance(data, {
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
          }),
        ),
      );
      return { ok: true, snapshot: data.read().current! };
    },

    play(data, move) {
      const guard = canPlay(data);
      if (guard) {
        return guard;
      }
      const snapshot = data.read().current!;
      const nextFen = rules.play(snapshot.fen, [], move)?.fen;
      if (!nextFen) {
        data.update(R.set('current', Object.freeze(R.set(snapshot, 'feedback', 'illegal'))));
        return { ok: true, snapshot: data.read().current! };
      }
      const matching = R.filter(data.read().paths, (path) => path[snapshot.ply] === move);
      if (matching.length === 0) {
        data.update(
          R.set(
            'current',
            Object.freeze(
              R.pipe(
                snapshot,
                R.set('errorCount', snapshot.errorCount + 1),
                R.set('feedback', 'incorrect'),
                R.set('expectedMove', data.read().paths[0]?.[snapshot.ply] ?? null),
              ),
            ),
          ),
        );
        return { ok: true, snapshot: data.read().current! };
      }
      data.update(R.set('paths', matching));
      data.update(
        R.set(
          'current',
          advance(
            data,
            R.merge(snapshot, {
              fen: nextFen,
              ply: snapshot.ply + 1,
              lastMove: move,
              feedback: 'correct',
              hint: null,
            } satisfies Partial<LearningSnapshot>),
          ),
        ),
      );
      return { ok: true, snapshot: data.read().current! };
    },

    hint(data) {
      const guard = canPlay(data);
      if (guard) {
        return guard;
      }
      const snapshot = data.read().current!;
      const hintIndex = Math.min(Math.floor(snapshot.ply / 2), snapshot.exercise.hints.length - 1);
      data.update(
        R.set(
          'current',
          Object.freeze(
            R.pipe(
              snapshot,
              R.set('assisted', true),
              R.set('hint', snapshot.exercise.hints[hintIndex] ?? snapshot.exercise.explanation),
              R.set('expectedMove', data.read().paths[0]?.[snapshot.ply] ?? null),
            ),
          ),
        ),
      );
      return { ok: true, snapshot: data.read().current! };
    },

    reveal(data) {
      const guard = canPlay(data);
      if (guard) {
        return guard;
      }
      const snapshot = data.read().current!;
      let fen = snapshot.fen;
      const path = data.read().paths[0]!;
      for (const move of path.slice(snapshot.ply)) {
        const nextFen = rules.play(fen, [], move)?.fen;
        if (nextFen) {
          fen = nextFen;
        }
      }
      data.update(
        R.set(
          'current',
          Object.freeze(
            R.merge(snapshot, {
              fen,
              ply: path.length,
              lastMove: path.at(-1) ?? null,
              assisted: true,
              status: 'revealed',
              legalMoves: [],
              expectedMove: null,
              hint: snapshot.exercise.explanation,
            } satisfies Partial<LearningSnapshot>),
          ),
        ),
      );
      return { ok: true, snapshot: data.read().current! };
    },

    async finish(data) {
      const { saving, saved, current: snapshot } = data.read();
      if (saving) {
        return { ok: false, reason: 'saving' };
      }
      if (saved) {
        return saved;
      }
      if (!snapshot) {
        return { ok: false, reason: 'not-started' };
      }
      if (snapshot.status === 'playing') {
        return { ok: false, reason: 'unfinished' };
      }
      const now = clock.now();
      const attempt: Attempt = {
        id: ids.id(),
        contentId: snapshot.exercise.id,
        kind: snapshot.exercise.kind,
        outcome: snapshot.errorCount > 0 ? 'failed' : snapshot.assisted ? 'assisted' : 'success',
        at: now.toISOString(),
        day: localDay(now),
      };
      data.update(R.set('saving', true));
      const reviewKey = `${attempt.contentId}:${snapshot.color}`;
      try {
        const review = await repository.saveAttempt(
          attempt,
          snapshot.exercise.kind === 'opening' ? reviewKey : undefined,
          snapshot.exercise.kind === 'opening'
            ? (previous) => {
                return scheduleReview(previous, attempt, now, snapshot.color);
              }
            : undefined,
        );
        data.update(R.set('saved', { ok: true, attempt, review }));
        data.update(R.set('current', Object.freeze(R.set(snapshot, 'status', 'saved'))));
        return data.read().saved!;
      } catch {
        return { ok: false, reason: 'save-failed' };
      } finally {
        data.update(R.set('saving', false));
      }
    },
  };

  function canPlay(data: LearningSessionData): Extract<
    LearningAction,
    {
      ok: false;
    }
  > | null {
    const { saving, current } = data.read();
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

  function advance(data: LearningSessionData, snapshot: LearningSnapshot): LearningSnapshot {
    let fen = snapshot.fen;
    let ply = snapshot.ply;
    let lastMove = snapshot.lastMove;
    const path = data.read().paths[0]!;
    while (ply < path.length && rules.position(fen).turn !== snapshot.color) {
      const move = path[ply]!;
      const nextFen = rules.play(fen, [], move)?.fen;
      if (!nextFen) {
        throw new Error(`Invalid catalogue move ${snapshot.exercise.id}:${ply}`);
      }
      fen = nextFen;
      lastMove = move;
      data.update(
        R.set(
          'paths',
          R.filter(data.read().paths, (candidate) => candidate[ply] === move),
        ),
      );
      ply += 1;
    }
    const complete = data.read().paths.some((candidate) => ply >= candidate.length);
    return Object.freeze(
      R.merge(snapshot, {
        fen,
        ply,
        lastMove,
        status: complete ? 'completed' : 'playing',
        legalMoves: complete ? [] : Object.freeze([...rules.position(fen).legalMoves]),
        expectedMove:
          !complete && snapshot.mode === 'guided' ? (data.read().paths[0]?.[ply] ?? null) : null,
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
