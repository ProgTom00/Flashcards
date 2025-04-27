import React, { useState, useEffect } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

interface TextAreaInputProps extends UseFormRegisterReturn {
  placeholder?: string;
  disabled?: boolean;
  value?: string;
  maxLength?: number;
  minLength?: number;
  error?: string;
  onSave?: (text: string) => void;
}

export function TextAreaInput({
  onChange,
  onBlur,
  name,
  ref,
  placeholder,
  disabled,
  value,
  maxLength = 15000,
  minLength = 1000,
  error,
  onSave,
}: TextAreaInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e);

    // Autosave after 1 second of inactivity
    const timeoutId = setTimeout(() => {
      onSave?.(e.target.value);
      setLastSaved(new Date());
    }, 1000);

    return () => clearTimeout(timeoutId);
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  // Handle Ctrl+S for manual save
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onSave?.(e.currentTarget.value);
      setLastSaved(new Date());
    }
  };

  return (
    <div className="space-y-2" role="textbox" aria-label="Text input for flashcard generation">
      <div className="relative">
        <textarea
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          name={name}
          ref={ref}
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-errormessage={error ? "text-input-error" : undefined}
          data-testid="flashcard-text-input"
          className={`
            w-full min-h-[200px] p-4 rounded-lg resize-y
            border transition-all duration-200
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${isFocused ? "ring-2 ring-blue-500 border-blue-500" : "hover:border-gray-400"}
            ${error ? "border-red-500" : ""}
            bg-white focus:outline-none
          `}
        />

        {/* Status indicator */}
        {lastSaved && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-500" role="status" aria-live="polite">
            Last saved: {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div id="text-input-error" className="text-red-500 text-sm" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
