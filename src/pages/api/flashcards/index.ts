import type { APIRoute } from "astro";
import { z } from "zod";
import type { CreateFlashcardDto } from "@/types";
import { FlashcardsService } from "@/services/flashcards.service";
import { DEFAULT_USER_ID } from "@/db/supabase.client";

// Validation schema for a single flashcard
const flashcardSchema = z
  .object({
    front: z.string().max(200, "Front text must not exceed 200 characters"),
    back: z.string().max(500, "Back text must not exceed 500 characters"),
    source: z.enum(["manual", "ai-full", "ai-edited"], {
      errorMap: () => ({ message: "Source must be one of: manual, ai-full, ai-edited" }),
    }),
    generation_id: z.string().uuid().nullable(),
  })
  .refine(
    (data) => {
      // generation_id must be null for manual entries
      if (data.source === "manual" && data.generation_id !== null) {
        return false;
      }
      return true;
    },
    {
      message: "Generation ID must be null for manual entries",
    }
  );

// Validation schema for the request body
const createFlashcardsSchema = z.object({
  flashcards: z
    .array(flashcardSchema)
    .min(1, "At least one flashcard must be provided")
    .max(100, "Maximum 100 flashcards can be created at once"),
});

export const POST: APIRoute = async ({ request }) => {
  const flashcardsService = new FlashcardsService();

  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = createFlashcardsSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { flashcards } = validationResult.data;

    try {
      const createdFlashcards = await flashcardsService.createFlashcards(
        flashcards as CreateFlashcardDto[],
        DEFAULT_USER_ID
      );

      return new Response(
        JSON.stringify({
          data: createdFlashcards,
        }),
        {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (dbError) {
      console.error("Service error:", dbError);
      return new Response(
        JSON.stringify({
          error: "Failed to create flashcards",
          details: "An error occurred while processing your request",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    console.error("Request error:", error);
    return new Response(
      JSON.stringify({
        error: "Invalid request",
        details: "Unable to parse request body",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
