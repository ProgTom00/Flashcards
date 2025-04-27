import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FlashcardSuggestionDTO } from "../../types";
import { flashcardSchema, type FlashcardFormData } from "../../types/schemas";

interface UseFlashcardFormProps {
  flashcard: FlashcardSuggestionDTO;
  onSubmit: (data: FlashcardFormData) => void;
  onCancel: () => void;
}

export const useFlashcardForm = ({ flashcard, onSubmit, onCancel }: UseFlashcardFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FlashcardFormData>({
    resolver: zodResolver(flashcardSchema),
    defaultValues: {
      front: flashcard.front,
      back: flashcard.back,
      source: "ai-edited",
    },
  });

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return {
    register,
    errors,
    handleSubmit: handleSubmit(onSubmit),
    handleCancel,
  };
};
