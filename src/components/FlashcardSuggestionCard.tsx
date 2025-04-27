// FlashcardSuggestionCard component - handles the display and interaction of flashcard suggestions
import React, { useState, useRef, useEffect } from "react";
import type { FlashcardSuggestionDTO } from "../types";
import { useFlashcardForm } from "./hooks/useFlashcardForm";
import type { FlashcardFormData } from "../types/schemas";
import { FlashcardModal } from "./FlashcardModal";
import "../styles/animations.css";

interface FlashcardSuggestionCardProps {
  flashcard: FlashcardSuggestionDTO;
  onAccept: (flashcard: FlashcardSuggestionDTO) => void;
  onEdit: (flashcard: FlashcardSuggestionDTO) => void;
  onReject: (flashcard: FlashcardSuggestionDTO) => void;
  mode?: "suggestions" | "accepted";
}

const FlashcardContent = ({
  isFlipped,
  content,
  type,
  onExpand,
}: {
  isFlipped: boolean;
  content: string;
  type: "question" | "answer";
  onExpand?: () => void;
}) => {
  const contentRef = useRef<HTMLParagraphElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (contentRef.current) {
        const isContentOverflowing =
          contentRef.current.scrollHeight > contentRef.current.clientHeight ||
          contentRef.current.scrollWidth > contentRef.current.clientWidth;
        setIsOverflowing(isContentOverflowing);
      }
    };

    checkOverflow();
    // Add resize listener to handle window size changes
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [content]);

  return (
    <div
      className={`absolute inset-0 p-4 sm:p-6 transition-opacity duration-300 ${
        isFlipped
          ? type === "answer"
            ? "opacity-100"
            : "opacity-0"
          : type === "question"
            ? "opacity-100"
            : "opacity-0"
      }`}
    >
      <div
        className={`h-full bg-gradient-to-br ${
          type === "question" ? "from-blue-50 to-indigo-50" : "from-emerald-50 to-teal-50"
        } rounded-lg p-3 sm:p-4 flex flex-col`}
      >
        <p className="font-medium text-gray-900 mb-2">{type === "question" ? "Question:" : "Answer:"}</p>
        <p
          ref={contentRef}
          className="text-gray-800 flex-grow text-base line-clamp-4 overflow-hidden"
          data-testid={`flashcard-${type === "question" ? "front" : "back"}-content`}
        >
          {content}
        </p>
        {isOverflowing && onExpand && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
            className={`text-sm ${
              type === "question" ? "text-blue-600 hover:text-blue-800" : "text-emerald-600 hover:text-emerald-800"
            } underline mt-2`}
          >
            Show more
          </button>
        )}
      </div>
    </div>
  );
};

const FlashcardEditForm = ({
  flashcard,
  onSubmit,
  onCancel,
}: {
  flashcard: FlashcardSuggestionDTO;
  onSubmit: (data: FlashcardFormData) => void;
  onCancel: () => void;
}) => {
  const { register, errors, handleSubmit, handleCancel } = useFlashcardForm({
    flashcard,
    onSubmit,
    onCancel,
  });

  return (
    <div className="w-full bg-white rounded-xl shadow-md p-4 sm:p-6 space-y-4 animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="front" className="block text-sm font-medium text-gray-700 mb-1">
            Question
          </label>
          <textarea
            {...register("front")}
            className={`w-full min-h-[80px] p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.front ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter your question"
          />
          {errors.front && (
            <p className="mt-1 text-sm text-red-500" role="alert">
              {errors.front.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="back" className="block text-sm font-medium text-gray-700 mb-1">
            Answer
          </label>
          <textarea
            {...register("back")}
            className={`w-full min-h-[120px] p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.back ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter the answer"
          />
          {errors.back && (
            <p className="mt-1 text-sm text-red-500" role="alert">
              {errors.back.message}
            </p>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={handleCancel}
            className="min-w-[80px] min-h-[44px] px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="min-w-[80px] min-h-[44px] px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export function FlashcardSuggestionCard({
  flashcard,
  onAccept,
  onEdit,
  onReject,
  mode = "suggestions",
}: FlashcardSuggestionCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLButtonElement>(null);

  const handleEditSubmit = (data: FlashcardFormData) => {
    onEdit({
      ...flashcard,
      ...data,
      source: "ai-edited",
    });
    setIsEditing(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const swipeThreshold = 50;

    // Only handle horizontal swipes if the vertical movement is less than half the horizontal
    if (Math.abs(deltaY) < Math.abs(deltaX) / 2) {
      if (deltaX > swipeThreshold && mode === "suggestions") {
        onAccept(flashcard);
      } else if (deltaX < -swipeThreshold) {
        onReject(flashcard);
      }
    }

    setTouchStart(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsFlipped(!isFlipped);
    }
  };

  if (isEditing) {
    return <FlashcardEditForm flashcard={flashcard} onSubmit={handleEditSubmit} onCancel={() => setIsEditing(false)} />;
  }

  return (
    <>
      <div className="w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
        <button
          ref={cardRef}
          type="button"
          className="relative min-h-[200px] w-full cursor-pointer touch-manipulation text-left"
          onClick={() => setIsFlipped(!isFlipped)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onKeyDown={handleKeyDown}
          aria-label={`Flashcard. ${window.matchMedia("(hover: none)").matches ? "Tap" : "Click"} to flip. Currently showing ${
            isFlipped ? "answer" : "question"
          }`}
        >
          <FlashcardContent
            isFlipped={isFlipped}
            content={flashcard.front}
            type="question"
            onExpand={() => setIsModalOpen(true)}
          />
          <FlashcardContent
            isFlipped={isFlipped}
            content={flashcard.back}
            type="answer"
            onExpand={() => setIsModalOpen(true)}
          />
        </button>

        <div className="p-3 sm:p-4 border-t border-gray-100">
          <div className="flex justify-end space-x-2">
            {mode === "suggestions" ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject(flashcard);
                  }}
                  className="min-w-[80px] min-h-[44px] px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  data-testid="reject-button"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="min-w-[80px] min-h-[44px] px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  data-testid="edit-button"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAccept(flashcard);
                  }}
                  className="min-w-[80px] min-h-[44px] px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                  data-testid="accept-button"
                >
                  Accept
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onReject(flashcard);
                }}
                className="min-w-[80px] min-h-[44px] px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                data-testid="remove-button"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      <FlashcardModal flashcard={flashcard} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
