import React from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

interface TextAreaInputProps extends UseFormRegisterReturn {
  placeholder?: string;
  disabled?: boolean;
}

export function TextAreaInput({ onChange, onBlur, name, ref, placeholder, disabled }: TextAreaInputProps) {
  return (
    <textarea
      onChange={onChange}
      onBlur={onBlur}
      name={name}
      ref={ref}
      placeholder={placeholder}
      disabled={disabled}
      data-testid="flashcard-text-input"
      className="w-full min-h-[200px] p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
    />
  );
}
