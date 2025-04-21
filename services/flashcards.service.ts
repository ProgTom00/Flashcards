import type { CreateFlashcardDto, FlashcardDTO } from "../types";

export class FlashcardsService {
  async createFlashcards(flashcards: CreateFlashcardDto[], userId: string): Promise<FlashcardDTO[]> {
    // Mock implementation returning fake data
    return flashcards.map((flashcard, index) => ({
      id: `mock-id-${index}`,
      front: flashcard.front,
      back: flashcard.back,
      source: flashcard.source,
      generation_id: flashcard.generation_id,
      created_at: new Date().toISOString(),
    }));
  }
}
