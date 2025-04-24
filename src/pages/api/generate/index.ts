import { z } from "zod";
import type { GenerateFlashcardsCommand } from "@/types";
import type { APIRoute } from "astro";
import { GenerationService } from "@/services/generation.service";

export const prerender = false;

// Input validation schema
const generateFlashcardsSchema = z.object({
  text: z
    .string()
    .min(1000, "Text must be at least 1000 characters long")
    .max(15000, "Text must not exceed 15000 characters"),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate request body
    const body = (await request.json()) as GenerateFlashcardsCommand;
    const validationResult = generateFlashcardsSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: validationResult.error.issues,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { text } = validationResult.data;

    // Get API key from environment variables
    const openRouterApiKey = import.meta.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      throw new Error("OPENROUTER_API_KEY environment variable is not set");
    }

    const generationService = new GenerationService(locals.supabase, {
      apiKey: import.meta.env.OPENROUTER_API_KEY,
    });

    const result = await generationService.generateFlashcards(text);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate endpoint:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
