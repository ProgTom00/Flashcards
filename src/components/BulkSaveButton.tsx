import React from "react";
import type { FlashcardSuggestionDTO } from "../types";
import { Button } from "./ui/button";

interface BulkSaveButtonProps {
  flashcards: FlashcardSuggestionDTO[];
  onSave: (flashcards: FlashcardSuggestionDTO[]) => void;
  disabled?: boolean;
  loading?: boolean;
}

export function BulkSaveButton({ flashcards, onSave, disabled, loading }: BulkSaveButtonProps) {
  return (
    <Button
      onClick={() => onSave(flashcards)}
      disabled={disabled || flashcards.length === 0}
      data-testid="bulk-save-button"
      className="bg-green-600 hover:bg-green-700 text-white"
      size="default"
    >
      {loading ? "Saving..." : `Save ${flashcards.length} Flashcard${flashcards.length === 1 ? "" : "s"}`}
    </Button>
  );
}
