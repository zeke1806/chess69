import { z } from 'zod';

export const exerciseSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['opening', 'puzzle', 'endgame']),
  title: z.string().min(1),
  theme: z.string().min(1),
  difficulty: z.enum(['beginner', 'intermediate']),
  fen: z.string().min(1),
  moves: z.array(z.string().regex(/^[a-h][1-8][a-h][1-8][qrbn]?$/)).min(1),
  alternatives: z.array(z.array(z.string().regex(/^[a-h][1-8][a-h][1-8][qrbn]?$/)).min(1)).default([]),
  explanation: z.string().min(1),
  hints: z.array(z.string().min(1)).min(1),
  side: z.enum(['w', 'b']),
  goal: z.enum(['checkmate', 'win-material', 'promote', 'hold-draw', 'opening-plan']),
  openingId: z.string().optional(),
  objective: z.string().min(1),
  notes: z.array(z.string()).optional(),
  source: z.object({ provider: z.string(), id: z.string(), url: z.string(), license: z.string() }).optional(),
  materialGain: z.number().optional(),
});
export type Exercise = Readonly<z.infer<typeof exerciseSchema>>;
export const openingSchema = z.object({
  id: z.string().min(1), title: z.string().min(1), description: z.string().min(1),
  ideas: z.array(z.string().min(1)).min(1), mistakes: z.array(z.string().min(1)).min(1),
  variationIds: z.array(z.string().min(1)).length(3),
});
export type Opening = Readonly<z.infer<typeof openingSchema>>;
export type CatalogueFilter = Readonly<{
  kind?: Exercise['kind']; theme?: string; difficulty?: Exercise['difficulty'];
}>;
export type CatalogueService = Readonly<{
  list: (filter?: CatalogueFilter) => ReadonlyArray<Exercise>;
  get: (id: string) => Exercise | undefined;
  openings: () => ReadonlyArray<Opening>;
}>;
