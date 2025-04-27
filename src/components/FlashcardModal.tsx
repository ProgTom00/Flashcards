import { useState, useEffect, useRef } from "react";
import type { FlashcardSuggestionDTO } from "@/types";
import { useKeyboardEvents } from "./hooks/useKeyboardEvents";
import { motion, AnimatePresence } from "framer-motion";

interface FlashcardModalProps {
  flashcard: FlashcardSuggestionDTO;
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
    targetRef: modalRef as unknown as React.RefObject<HTMLElement>,
  });

  // Reset flip state and set focus when modal is opened
  useEffect(() => {
    if (isOpen) {
      setIsFlipped(false);
      // Set focus to modal container
      modalRef.current?.focus();
    }
  }, [isOpen, flashcard]);

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          onKeyDown={(e) => e.key === "Enter" && onClose()}
          role="button"
          tabIndex={0}
          aria-label="Close modal"
        />

        {/* Modal Content */}
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl"
          tabIndex={-1}
          aria-modal="true"
          role="dialog"
        >
          {/* Close Button */}
          <div className="absolute top-4 right-4 z-50">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Flashcard Content */}
          <div className="perspective-1000">
            <button
              type="button"
              onClick={handleFlip}
              className="w-full min-h-[300px] p-8 select-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
              aria-label={isFlipped ? "Show question" : "Show answer"}
            >
              <motion.div
                className="relative w-full h-full"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring" }}
                style={{
                  transformStyle: "preserve-3d",
                  transformOrigin: "center center",
                }}
              >
                {/* Question Side */}
                <div
                  className={`w-full transition-all duration-300 ${
                    isFlipped ? "opacity-0 pointer-events-none" : "opacity-100"
                  }`}
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(0deg)",
                    position: "relative",
                  }}
                >
                  <div className="text-xl font-medium mb-4">Question</div>
                  <div className="text-center text-lg">{flashcard.front}</div>
                </div>

                {/* Answer Side */}
                <div
                  className={`w-full absolute top-0 left-0 transition-all duration-300 ${
                    isFlipped ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    position: "relative",
                  }}
                >
                  <div className="text-xl font-medium mb-4">Answer</div>
                  <div className="text-center text-lg">{flashcard.back}</div>
                </div>
              </motion.div>
            </button>
          </div>

          {/* Keyboard Controls Info */}
          <div className="px-8 py-4 bg-gray-50 rounded-b-lg">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <kbd className="px-2 py-1 bg-white rounded shadow">Space</kbd>
                <span>to flip</span>
              </div>
              <div className="flex items-center space-x-2">
                <kbd className="px-2 py-1 bg-white rounded shadow">Esc</kbd>
                <span>to close</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
