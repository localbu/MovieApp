import { z } from "zod";

export const movieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  genre: z.string().min(1, "Genre is required"),
  releaseYear: z.number().int(),
  rating: z.number().min(0).max(10).optional(),
  directorId: z.number().int().positive("Director ID must be positive").optional(),
  actorIds: z
    .array(z.int().positive())
    .optional(),
});