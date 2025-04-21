import { createHash } from "crypto";
import type { FlashcardSuggestionDTO, GenerateFlashcardsResponseDTO } from "@/types";
import { supabaseClient, DEFAULT_USER_ID } from "@/db/supabase.client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";

export class GenerationService {
  private supabase: SupabaseClient<Database>;
  private openrouterApiKey: string;

  constructor() {
    this.supabase = supabaseClient;
    this.openrouterApiKey = process.env.OPENROUTER_API_KEY || "";
  }

  async generateFlashcards(text: string): Promise<GenerateFlashcardsResponseDTO> {
    const startTime = Date.now();
    try {
      // 1. Call OpenRouter AI service (mock for now)
      const aiSuggestions = await this.callAiService(text);

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
      // Log error to generation_logs table
      await this.logGenerationError(error as Error, text);
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
        user_id: DEFAULT_USER_ID,
        duration: duration,
        generated_count: generatedCount,
        model: "openrouter-default",
        source_text_hash: sourceTextHash,
        source_text_length: sourceText.length,
      })
      .select()
      .single();

    if (generationError) {
      throw new Error(`Failed to create generation record: ${generationError.message}`);
    }

    return generation;
  }

  private async callAiService(text: string): Promise<FlashcardSuggestionDTO[]> {
    // Mock implementation based on documentation requirements
    return [
      {
        front: "What is the capital of France?",
        back: "Paris is the capital of France",
        source: "ai-full",
      },
      {
        front: "Who wrote 'Romeo and Juliet'?",
        back: "William Shakespeare wrote 'Romeo and Juliet'",
        source: "ai-full",
      },
      {
        front: "What is photosynthesis?",
        back: "The process by which plants convert light energy into chemical energy",
        source: "ai-full",
      },
    ];
  }

  private generateTextHash(text: string): string {
    return createHash("md5").update(text).digest("hex");
  }

  private async logGenerationError(error: Error, text: string): Promise<void> {
    try {
      await this.supabase.from("generation_logs").insert({
        user_id: DEFAULT_USER_ID,
        error_message: error.message,
        error_code: "GENERATION_FAILED",
        source_text_hash: this.generateTextHash(text),
        source_text_length: text.length,
        model: "openrouter-default",
      });
    } catch (logError) {
      console.error("Failed to log generation error:", logError);
    }
  }
}
