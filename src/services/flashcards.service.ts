import type { CreateFlashcardDto, FlashcardDTO } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";

export class FlashcardsService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

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
