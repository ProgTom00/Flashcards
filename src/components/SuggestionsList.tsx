import React from "react";
import type { FlashcardSuggestionDTO } from "../types";
import { FlashcardSuggestionCard } from "./FlashcardSuggestionCard";

interface SuggestionsListProps {
  suggestions: FlashcardSuggestionDTO[];
  onAccept: (flashcard: FlashcardSuggestionDTO) => void;
  onEdit: (flashcard: FlashcardSuggestionDTO) => void;
  onReject: (flashcard: FlashcardSuggestionDTO) => void;
  mode?: "suggestions" | "accepted";
}

export function SuggestionsList({
  suggestions,
  onAccept,
  onEdit,
  onReject,
  mode = "suggestions",
}: SuggestionsListProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-slate-50 to-white p-4 sm:p-6 rounded-xl shadow-sm">
      {mode === "suggestions" && (
        <>
          <h2 className="text-xl font-semibold text-gray-800">Generated Flashcards</h2>
          <p className="text-sm text-gray-600 mb-4">
            Review the generated flashcards below. You can accept, edit, or reject each one.
          </p>
        </>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {suggestions.map((flashcard, index) => (
          <div key={`${flashcard.front}-${index}`} className="flex">
            <FlashcardSuggestionCard
              flashcard={flashcard}
              onAccept={onAccept}
              onEdit={onEdit}
              onReject={onReject}
              mode={mode}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
