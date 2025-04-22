import React from "react";
import type { FlashcardSuggestionDTO } from "../types";

interface BulkSaveButtonProps {
  flashcards: FlashcardSuggestionDTO[];
  onSave: (flashcards: FlashcardSuggestionDTO[]) => void;
  disabled?: boolean;
  loading?: boolean;
}

export function BulkSaveButton({ flashcards, onSave, disabled, loading }: BulkSaveButtonProps) {
  return (
    <button
      onClick={() => onSave(flashcards)}
      disabled={disabled || flashcards.length === 0}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Saving..." : `Save ${flashcards.length} Flashcard${flashcards.length === 1 ? "" : "s"}`}
    </button>
  );
}
