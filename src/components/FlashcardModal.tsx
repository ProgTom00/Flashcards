import { useState, useEffect, useRef } from "react";
import type { Flashcard } from "@/types";
import { useKeyboardEvents } from "./hooks/useKeyboardEvents";

interface FlashcardModalProps {
  flashcard: Flashcard;
  isOpen: boolean;
  onClose: () => void;
}

export function FlashcardModal({ flashcard, isOpen, onClose }: FlashcardModalProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useKeyboardEvents({
    onSpace: () => setIsFlipped((prev) => !prev),
    onEscape: onClose,
    isEnabled: isOpen,
    targetRef: modalRef,
  });

  // Reset flip state when modal is opened with a new card
  useEffect(() => {
    if (isOpen) {
      setIsFlipped(false);
    }
  }, [isOpen, flashcard]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Semi-transparent overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal container */}
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl mx-4 bg-white rounded-lg shadow-xl transform transition-all"
      >
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Flashcard content */}
        <div className="min-h-[300px] p-8 cursor-pointer select-none" onClick={() => setIsFlipped(!isFlipped)}>
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-xl font-medium mb-4">{isFlipped ? "Answer" : "Question"}</div>
            <div className="text-center text-lg">{isFlipped ? flashcard.back : flashcard.front}</div>
          </div>
        </div>

        {/* Footer with instructions */}
        <div className="px-8 py-4 bg-gray-50 rounded-b-lg text-center text-sm text-gray-600">
          Click the card or press spacebar to flip • Press Esc to close
        </div>
      </div>
    </div>
  );
}
