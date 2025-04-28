import { createHash } from "crypto";
import type { FlashcardSuggestionDTO, GenerateFlashcardsResponseDTO } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import { OpenRouterService } from "@/lib/openrouter.service";
import { OpenRouterError } from "@/lib/openrouter.types";
import { z } from "zod";
import { Logger } from "@/lib/logger";

// Validation schema for flashcards array
const flashcardsArraySchema = z.array(
  z.object({
    front: z.string(),
    back: z.string(),
  })
);

export class GenerationService {
  private readonly openRouter: OpenRouterService;
  private readonly model = "openai/gpt-4o-mini";
  private readonly logger: Logger;
  private readonly systemMessage = `You are an expert educational content creator specializing in creating high-quality flashcards. 
Create concise, clear, and accurate flashcards based on the provided text. Each flashcard should:
- Have a clear question or concept on the front
- Have a precise and complete answer on the back
- Be self-contained and understandable without external context
- Focus on one specific concept or piece of information
- Use clear, simple language
Return ONLY a JSON array of flashcard objects with 'front' and 'back' and 'source' properties.`;

  constructor(
    private readonly supabase: SupabaseClient<Database>,
    private readonly userId: string,
    config?: { apiKey: string }
  ) {
    if (!config?.apiKey) {
      throw new OpenRouterError("OpenRouter API key is required", "CONFIG_ERROR");
    }

    this.logger = new Logger("GenerationService");
    this.openRouter = new OpenRouterService({
      apiKey: config.apiKey,
      timeout: 60000,
      maxRetries: 3,
    });
  }

  async generateFlashcards(text: string): Promise<GenerateFlashcardsResponseDTO> {
    const startTime = Date.now();
    this.logger.info("Starting flashcard generation", { textLength: text.length });

    try {
      // 1. Call OpenRouter AI service
      const aiSuggestions = await this.callAiService(text);
      this.logger.info("AI suggestions generated", { count: aiSuggestions.length });

      // 2. Create generation record in database
      const sourceTextHash = this.generateTextHash(text);
      const generationMetadata = await this.saveGenerationMetadata({
        sourceText: text,
        sourceTextHash,
        generatedCount: aiSuggestions.length,
        duration: Date.now() - startTime,
      });

      return {
        generation_id: generationMetadata.id,
        data: aiSuggestions,
        generated_count: aiSuggestions.length,
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      this.logger.error(errorObj, {
        textLength: text.length,
        duration: Date.now() - startTime,
      });
      await this.logGenerationError(errorObj, text);
      throw error;
    }
  }

  private async saveGenerationMetadata({
    sourceText,
    sourceTextHash,
    generatedCount,
    duration,
  }: {
    sourceText: string;
    sourceTextHash: string;
    generatedCount: number;
    duration: number;
  }) {
    const { data: generation, error: generationError } = await this.supabase
      .from("generations")
      .insert({
        user_id: this.userId,
        duration: duration,
        generated_count: generatedCount,
        model: this.model,
        source_text_hash: sourceTextHash,
        source_text_length: sourceText.length,
      })
      .select()
      .single();

    if (generationError) {
      const error = new Error(`Failed to create generation record: ${generationError.message}`);
      this.logger.error(error);
      throw error;
    }

    return generation;
  }

  private async callAiService(text: string): Promise<FlashcardSuggestionDTO[]> {
    try {
      this.openRouter.setSystemMessage(this.systemMessage);
      this.openRouter.setModel(this.model);

      this.openRouter.setResponseFormat({
        name: "flashcards",
        schema: {
          type: "object",
          properties: {
            flashcards: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  front: { type: "string" },
                  back: { type: "string" },
                },
                required: ["front", "back"],
              },
            },
          },
          required: ["flashcards"],
        },
      });

      this.openRouter.setUserMessage(
        `Create flashcards from this text. Return ONLY a JSON array of objects with 'front' and 'back' properties: ${text}`
      );

      const response = await this.openRouter.sendChatMessage();
      let parsedContent: unknown;

      try {
        parsedContent = JSON.parse(response);
      } catch (parseError) {
        const error = new Error("Invalid JSON in API response");
        this.logger.error(error, {
          response,
          parseError: parseError instanceof Error ? parseError.message : String(parseError),
        });
        throw error;
      }

      const flashcardsData = (parsedContent as { flashcards: unknown[] }).flashcards;
      const validatedResponse = flashcardsArraySchema.parse(flashcardsData);

      return validatedResponse.map((card) => ({
        ...card,
        source: "ai-full" as const,
      }));
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      this.logger.error(errorObj);
      throw error;
    }
  }

  private generateTextHash(text: string): string {
    return createHash("md5").update(text).digest("hex");
  }

  private async logGenerationError(error: Error, text: string): Promise<void> {
    try {
      await this.supabase.from("generation_logs").insert({
        user_id: this.userId,
        error_message: error.message,
        error_code: error instanceof OpenRouterError ? error.code : "UNKNOWN_ERROR",
        source_text_hash: this.generateTextHash(text),
        source_text_length: text.length,
        model: this.model,
      });
    } catch (logError) {
      const errorObj = logError instanceof Error ? logError : new Error(String(logError));
      this.logger.error(errorObj);
    }
  }
}
