import type { CreateFlashcardDto, FlashcardDTO } from "../../src/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import { supabaseClient, DEFAULT_USER_ID } from "@/db/supabase.client";
export class FlashcardsService {
  private supabase: SupabaseClient<Database>;

  constructor() {
    this.supabase = supabaseClient;
  }

  async createFlashcards(flashcards: CreateFlashcardDto[], userId: string): Promise<FlashcardDTO[]> {
    const flashcardsWithUserId = flashcards.map((flashcard) => ({
      ...flashcard,
      user_id: userId,
    }));

    const { data, error } = await this.supabase
      .from("flashcards")
      .insert(flashcardsWithUserId)
      .select("id, front, back, source, generation_id, created_at");

    if (error) {
      console.error("Error creating flashcards:", error);
      throw new Error("Failed to create flashcards");
    }

    return data as FlashcardDTO[];
  }
}
