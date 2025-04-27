import { useState, useEffect, useRef } from "react";
import type { Flashcard } from "@/types";
import { useKeyboardEvents } from "./hooks/useKeyboardEvents";
import { motion, AnimatePresence } from "framer-motion";

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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onClose()}
          aria-label="Close modal"
        />

        <motion.div
          ref={modalRef}
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <motion.div
            className="min-h-[300px] p-8 select-none"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full h-full focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-4"
              aria-label={isFlipped ? "Show question" : "Show answer"}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <motion.div animate={{ rotateY: isFlipped ? 180 : 0 }} className="text-xl font-medium mb-4">
                  {isFlipped ? "Answer" : "Question"}
                </motion.div>
                <motion.div animate={{ rotateY: isFlipped ? 180 : 0 }} className="text-center text-lg">
                  {isFlipped ? flashcard.back : flashcard.front}
                </motion.div>
              </div>
            </button>
          </motion.div>

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
      </motion.div>
    </AnimatePresence>
  );
}
