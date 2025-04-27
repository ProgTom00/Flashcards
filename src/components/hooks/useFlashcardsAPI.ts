import { useMutation } from "@tanstack/react-query";
import type { GenerateFlashcardsFormData } from "../../types/schemas";
import type { FlashcardSuggestionDTO } from "../../types";
import { flashcardsAPI } from "../../services/api";

export const useFlashcardsAPI = () => {
  const generateMutation = useMutation({
    mutationFn: (data: GenerateFlashcardsFormData) => flashcardsAPI.generateFlashcards(data),
  });

  const saveMutation = useMutation({
    mutationFn: ({ flashcards, generationId }: { flashcards: FlashcardSuggestionDTO[]; generationId: string }) =>
      flashcardsAPI.saveFlashcards(flashcards, generationId),
  });

  return {
    generateFlashcards: generateMutation.mutateAsync,
    saveFlashcards: saveMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
    isSaving: saveMutation.isPending,
    generateError: generateMutation.error,
    saveError: saveMutation.error,
  };
};
