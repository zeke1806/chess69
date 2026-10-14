import { z } from 'zod';
import { uciMoveSchema } from '../adapters/rules/rules-types';
export const exerciseSchema = z
  .object({
    id: z.string().min(1),
    kind: z.enum(['opening', 'puzzle', 'endgame']),
    title: z.string().min(1),
    theme: z.string().min(1),
    difficulty: z.enum(['beginner', 'intermediate']),
    fen: z.string().min(1),
    moves: z.array(uciMoveSchema).min(1).readonly(),
    alternatives: z.array(z.array(uciMoveSchema).min(1).readonly()).default([]).readonly(),
    explanation: z.string().min(1),
    hints: z.array(z.string().min(1)).min(1).readonly(),
    side: z.enum(['w', 'b']),
    goal: z.enum(['checkmate', 'win-material', 'promote', 'hold-draw', 'opening-plan']),
    openingId: z.string().optional(),
    objective: z.string().min(1),
    notes: z.array(z.string()).readonly().optional(),
    source: z
      .object({ provider: z.string(), id: z.string(), url: z.string(), license: z.string() })
      .readonly()
      .optional(),
    materialGain: z.number().optional(),
  })
  .readonly();
export type Exercise = Readonly<z.infer<typeof exerciseSchema>>;
export const openingSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    ideas: z.array(z.string().min(1)).min(1).readonly(),
    mistakes: z.array(z.string().min(1)).min(1).readonly(),
    variationIds: z.array(z.string().min(1)).length(3).readonly(),
  })
  .readonly();
export type Opening = Readonly<z.infer<typeof openingSchema>>;
export type CatalogueFilter = Readonly<{
  kind?: Exercise['kind'];
  theme?: string;
  difficulty?: Exercise['difficulty'];
}>;
export type CatalogueService = Readonly<{
  list: (filter?: CatalogueFilter) => ReadonlyArray<Exercise>;
  get: (id: string) => Exercise | undefined;
  openings: () => ReadonlyArray<Opening>;
}>;
