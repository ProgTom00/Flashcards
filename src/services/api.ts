import type { GenerateFlashcardsFormData, FlashcardFormData } from "../types/schemas";
import type { GenerateFlashcardsResponseDTO, CreateFlashcardDto, FlashcardSuggestionDTO } from "../types";

class FlashcardsAPI {
  private readonly baseUrl = "/api";

  async generateFlashcards(data: GenerateFlashcardsFormData): Promise<GenerateFlashcardsResponseDTO> {
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: data.text }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate flashcards");
    }

    return response.json();
  }

  async saveFlashcards(flashcards: FlashcardSuggestionDTO[], generationId: string): Promise<void> {
    const flashcardsToSave: CreateFlashcardDto[] = flashcards.map((card) => ({
      front: card.front,
      back: card.back,
      source: card.source || "ai-full",
      generation_id: generationId,
    }));

    const response = await fetch(`${this.baseUrl}/flashcards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ flashcards: flashcardsToSave }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to save flashcards");
    }
  }
}

export const flashcardsAPI = new FlashcardsAPI();
