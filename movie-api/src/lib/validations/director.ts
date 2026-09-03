import z from "zod";

export const directorScheme = z.object({
    name: z.string().min(1, "name is required"),
    age: z.int().positive("age must be positive").optional()
})