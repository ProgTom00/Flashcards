import React from "react";
import { Button } from "./ui/button";
import type { ButtonHTMLAttributes } from "react";

interface GenerateButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export function GenerateButton({ disabled, loading, ...props }: GenerateButtonProps) {
  return (
    <Button
      {...props}
      disabled={disabled}
      data-testid="generate-button"
      className="bg-green-600 hover:bg-green-700 text-white"
      size="default"
    >
      {loading ? "Generating..." : "Generate Flashcards"}
    </Button>
  );
}
