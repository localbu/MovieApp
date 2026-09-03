import { z } from "zod";

export const actorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.int().positive("item must be positive").optional(),
});