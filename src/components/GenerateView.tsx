import React, { useState, useEffect } from "react";
import type { FlashcardSuggestionDTO } from "../types";
import { TextAreaInput } from "./TextAreaInput";
import { GenerateButton } from "./GenerateButton";
import { Loader } from "./Loader";
import { SuggestionsList } from "./SuggestionsList";
import { ToastNotifications } from "./ToastNotifications";
import { BulkSaveButton } from "./BulkSaveButton";
import { useGenerateForm } from "./hooks/useGenerateForm";
import { useFlashcardsAPI } from "./hooks/useFlashcardsAPI";
import type { GenerateFlashcardsFormData } from "../types/schemas";
import { QueryProvider } from "./providers/QueryProvider";

function GenerateViewContent() {
  const [suggestions, setSuggestions] = useState<FlashcardSuggestionDTO[]>([]);
  const [acceptedFlashcards, setAcceptedFlashcards] = useState<FlashcardSuggestionDTO[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showAccepted, setShowAccepted] = useState(false);
  const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(null);

  const { generateFlashcards, saveFlashcards, isGenerating, isSaving } = useFlashcardsAPI();

  // Handler for generating flashcards
  const handleGenerateFlashcards = async (data: GenerateFlashcardsFormData) => {
    try {
      setNotification(null);
      setShowAccepted(false);

      const response = await generateFlashcards(data);
      setCurrentGenerationId(response.generation_id);
      setSuggestions(response.data);
      setNotification({
        message: `Successfully generated ${response.data.length} flashcards`,
        type: "success",
      });
    } catch (err) {
      setNotification({
        message: err instanceof Error ? err.message : "An error occurred while generating flashcards",
        type: "error",
      });
    }
  };

  const { register, errors, handleSubmit, isTextValid, textLength } = useGenerateForm({
    onSubmit: handleGenerateFlashcards,
  });

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
      setNotification(null);
      await saveFlashcards({ flashcards, generationId: currentGenerationId });

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
    } catch (err) {
      setNotification({
        message: err instanceof Error ? err.message : "Failed to save flashcards",
        type: "error",
      });
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

  return (
    <div className="space-y-8" data-testid="generate-view-container">
      {notification && <ToastNotifications message={notification.message} type={notification.type} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Input and Generation */}
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="sticky top-4">
              <TextAreaInput
                {...register("text")}
                placeholder="Enter your text here (minimum 1000 characters, maximum 15000 characters)"
                disabled={isGenerating}
                data-testid="flashcard-text-input"
              />
              {errors.text && (
                <p className="mt-1 text-sm text-red-500" role="alert">
                  {errors.text.message}
                </p>
              )}
              {textLength > 0 && (
                <div className="mt-2 flex justify-between items-center text-sm">
                  <div className="text-gray-600">Characters: {textLength} / 15000</div>
                  {textLength < 1000 && <div className="text-yellow-600">Need {1000 - textLength} more characters</div>}
                </div>
              )}
              <div className="mt-4">
                <GenerateButton
                  disabled={!isTextValid || isGenerating}
                  loading={isGenerating}
                  data-testid="generate-flashcards-button"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Right Column - Flashcards Management */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setShowAccepted(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  !showAccepted ? "bg-blue-100 text-blue-800 font-medium" : "text-gray-600 hover:bg-gray-100"
                }`}
                data-testid="suggestions-tab-button"
              >
                Suggestions ({suggestions.length})
              </button>
              <button
                onClick={() => setShowAccepted(true)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  showAccepted ? "bg-green-100 text-green-800 font-medium" : "text-gray-600 hover:bg-gray-100"
                }`}
                data-testid="accepted-tab-button"
              >
                Accepted ({acceptedFlashcards.length})
              </button>
            </div>
            {showAccepted && acceptedFlashcards.length > 0 && (
              <BulkSaveButton
                flashcards={acceptedFlashcards}
                onSave={handleBulkSave}
                disabled={isSaving}
                loading={isSaving}
                data-testid="bulk-save-button"
              />
            )}
          </div>

          <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            {isGenerating && <Loader data-testid="loading-spinner" />}

            {!showAccepted && suggestions.length > 0 && (
              <div className="space-y-4" data-testid="suggestions-list-container">
                <SuggestionsList
                  suggestions={suggestions}
                  onAccept={handleAcceptFlashcard}
                  onEdit={handleEditFlashcard}
                  onReject={handleRejectFlashcard}
                  data-testid="suggestions-list"
                />
              </div>
            )}

            {showAccepted && acceptedFlashcards.length > 0 && (
              <div className="space-y-4" data-testid="accepted-flashcards-container">
                <SuggestionsList
                  suggestions={acceptedFlashcards}
                  onAccept={handleAcceptFlashcard}
                  onEdit={handleEditFlashcard}
                  onReject={handleRemoveFromAccepted}
                  mode="accepted"
                  data-testid="accepted-flashcards-list"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GenerateView() {
  return (
    <QueryProvider>
      <GenerateViewContent />
    </QueryProvider>
  );
}
