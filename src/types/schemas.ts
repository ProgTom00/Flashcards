import { z } from "zod";

export const flashcardSchema = z.object({
  front: z
    .string()
    .min(3, "Front content must be at least 3 characters")
    .max(200, "Front content must not exceed 200 characters")
    .trim(),
  back: z
    .string()
    .min(3, "Back content must be at least 3 characters")
    .max(500, "Back content must not exceed 500 characters")
    .trim(),
  source: z.enum(["ai-full", "ai-edited"]).default("ai-full"),
  generation_id: z.string().optional(),
});

export const generateFlashcardsSchema = z.object({
  text: z
    .string()
    .min(1000, "Text must be at least 1000 characters")
    .max(15000, "Text must not exceed 15000 characters"),
});

export type FlashcardFormData = z.infer<typeof flashcardSchema>;
export type GenerateFlashcardsFormData = z.infer<typeof generateFlashcardsSchema>;
