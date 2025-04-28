import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateFlashcardsSchema, type GenerateFlashcardsFormData } from "../../types/schemas";

interface UseGenerateFormProps {
  onSubmit: (data: GenerateFlashcardsFormData) => Promise<void>;
}

export const useGenerateForm = ({ onSubmit }: UseGenerateFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<GenerateFlashcardsFormData>({
    resolver: zodResolver(generateFlashcardsSchema),
    mode: "onChange",
  });

  const text = watch("text");
  const textLength = text?.length || 0;
  const isTextValid = textLength >= 1000 && textLength <= 15000;

  return {
    register,
    errors,
    handleSubmit: handleSubmit(onSubmit),
    isTextValid,
    textLength,
  };
};
