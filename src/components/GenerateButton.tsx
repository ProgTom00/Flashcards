import React from "react";
import { Button } from "./ui/button";

interface GenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function GenerateButton({ onClick, disabled, loading }: GenerateButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled} data-testid="generate-button" variant="default" size="default">
      {loading ? "Generating..." : "Generate Flashcards"}
    </Button>
  );
}
