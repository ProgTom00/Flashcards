import React, { useState, useEffect } from "react";
import type {
  GenerateFlashcardsCommand,
  FlashcardSuggestionDTO,
  CreateFlashcardDto,
  GenerateFlashcardsResponseDTO,
} from "../types";
import { TextAreaInput } from "./TextAreaInput";
import { GenerateButton } from "./GenerateButton";
import { Loader } from "./Loader";
import { SuggestionsList } from "./SuggestionsList";
import { ToastNotifications } from "./ToastNotifications";
import { BulkSaveButton } from "./BulkSaveButton";

export default function GenerateView() {
  // State management
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<FlashcardSuggestionDTO[]>([]);
  const [acceptedFlashcards, setAcceptedFlashcards] = useState<FlashcardSuggestionDTO[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showAccepted, setShowAccepted] = useState(false);
  const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(null);

  // Handler for generating flashcards
  const handleGenerateFlashcards = async () => {
    try {
      setLoading(true);
      setNotification(null);
      setShowAccepted(false);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText } as GenerateFlashcardsCommand),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate flashcards");
      }

      const data = (await response.json()) as GenerateFlashcardsResponseDTO;
      setCurrentGenerationId(data.generation_id);
      setSuggestions(data.data);
      setNotification({
        message: `Successfully generated ${data.data.length} flashcards`,
        type: "success",
      });
    } catch (error) {
      setNotification({
        message: error instanceof Error ? error.message : "An error occurred",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handlers for flashcard actions
  const handleAcceptFlashcard = (flashcard: FlashcardSuggestionDTO) => {
    setAcceptedFlashcards((prev) => [...prev, flashcard]);
    setSuggestions((prev) => prev.filter((f) => f !== flashcard));
  };

  const handleRejectFlashcard = (flashcard: FlashcardSuggestionDTO) => {
    setSuggestions((prev) => prev.filter((f) => f !== flashcard));
  };

  const handleRemoveFromAccepted = (flashcard: FlashcardSuggestionDTO) => {
    setAcceptedFlashcards((prev) => prev.filter((f) => f !== flashcard));
    setSuggestions((prev) => [...prev, flashcard]);
  };

  const handleEditFlashcard = (editedFlashcard: FlashcardSuggestionDTO) => {
    setSuggestions((prev) =>
      prev.map((f) => (f === editedFlashcard ? { ...editedFlashcard, source: "ai-edited" } : f))
    );
  };

  // Handler for bulk saving flashcards
  const handleBulkSave = async (flashcards: FlashcardSuggestionDTO[]) => {
    if (!currentGenerationId) {
      setNotification({
        message: "Cannot save flashcards: missing generation ID",
        type: "error",
      });
      return;
    }

    try {
      setSaving(true);
      setNotification(null);

      const flashcardsToSave: CreateFlashcardDto[] = flashcards.map((card) => ({
        front: card.front,
        back: card.back,
        source: card.source || "ai-full",
        generation_id: currentGenerationId,
      }));

      const response = await fetch("/api/flashcards", {
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

      setNotification({
        message: `Successfully saved ${flashcards.length} flashcards`,
        type: "success",
      });

      // Clear the accepted flashcards
      setAcceptedFlashcards([]);
      setShowAccepted(false);

      // Only clear generation ID if there are no more flashcards to save
      if (suggestions.length === 0) {
        setCurrentGenerationId(null);
      }
    } catch (error) {
      setNotification({
        message: error instanceof Error ? error.message : "Failed to save flashcards",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Validation for the generate button
  const isTextValid = inputText.length >= 1000 && inputText.length <= 15000;

  return (
    <div className="space-y-8">
      {notification && <ToastNotifications message={notification.message} type={notification.type} />}

      <div className="space-y-4">
        <TextAreaInput
          value={inputText}
          onChange={setInputText}
          placeholder="Enter your text here (minimum 1000 characters, maximum 15000 characters)"
          disabled={loading}
        />
        <div className="flex justify-end">
          <GenerateButton onClick={handleGenerateFlashcards} disabled={!isTextValid || loading} loading={loading} />
        </div>
      </div>

      {loading && <Loader />}

      {/* Navigation buttons */}
      {(suggestions.length > 0 || acceptedFlashcards.length > 0) && (
        <div className="flex space-x-4 border-b pb-4">
          <button
            onClick={() => setShowAccepted(false)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              !showAccepted ? "bg-blue-100 text-blue-800 font-medium" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Suggestions ({suggestions.length})
          </button>
          <button
            onClick={() => setShowAccepted(true)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showAccepted ? "bg-green-100 text-green-800 font-medium" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Accepted ({acceptedFlashcards.length})
          </button>
        </div>
      )}

      {/* Show suggestions or accepted flashcards based on state */}
      {!showAccepted && suggestions.length > 0 && (
        <div className="space-y-4">
          <SuggestionsList
            suggestions={suggestions}
            onAccept={handleAcceptFlashcard}
            onEdit={handleEditFlashcard}
            onReject={handleRejectFlashcard}
          />
        </div>
      )}

      {showAccepted && acceptedFlashcards.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Accepted Flashcards</h2>
            <BulkSaveButton
              flashcards={acceptedFlashcards}
              onSave={handleBulkSave}
              disabled={saving}
              loading={saving}
            />
          </div>
          <SuggestionsList
            suggestions={acceptedFlashcards}
            onAccept={() => {}}
            onEdit={() => {}}
            onReject={handleRemoveFromAccepted}
            mode="accepted"
          />
        </div>
      )}
    </div>
  );
}
