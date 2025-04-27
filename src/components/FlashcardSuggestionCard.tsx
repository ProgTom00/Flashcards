// FlashcardSuggestionCard component - handles the display and interaction of flashcard suggestions
import React, { useState, useRef } from "react";
import type { FlashcardSuggestionDTO } from "../types";
import { useFlashcardForm } from "./hooks/useFlashcardForm";
import type { FlashcardFormData } from "../types/schemas";
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
}) => (
  <div
    className={`absolute inset-0 p-6 transition-opacity duration-300 ${isFlipped ? (type === "answer" ? "opacity-100" : "opacity-0") : type === "question" ? "opacity-100" : "opacity-0"}`}
  >
    <div
      className={`h-full bg-gradient-to-br ${type === "question" ? "from-blue-50 to-indigo-50" : "from-emerald-50 to-teal-50"} rounded-lg p-4 flex flex-col`}
    >
      <p className="font-medium text-gray-900 mb-2">{type === "question" ? "Question:" : "Answer:"}</p>
      <p
        className="text-gray-800 flex-grow text-base line-clamp-4"
        data-testid={`flashcard-${type === "question" ? "front" : "back"}-content`}
      >
        {content}
      </p>
      {content.length > 100 && onExpand && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExpand();
          }}
          className={`text-sm ${type === "question" ? "text-blue-600 hover:text-blue-800" : "text-emerald-600 hover:text-emerald-800"} underline mt-2`}
        >
          Show more
        </button>
      )}
      <p className={`text-sm ${type === "question" ? "text-blue-600" : "text-emerald-600"} mt-4 italic`}>
        Click to see {type === "question" ? "answer" : "question"}
      </p>
    </div>
  </div>
);

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
    <div className="w-full bg-white rounded-xl shadow-md p-6 space-y-4 animate-fade-in">
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
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
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
  const cardRef = useRef<HTMLDivElement>(null);

  const handleEditSubmit = (data: FlashcardFormData) => {
    onEdit({
      ...flashcard,
      ...data,
      source: "ai-edited",
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return <FlashcardEditForm flashcard={flashcard} onSubmit={handleEditSubmit} onCancel={() => setIsEditing(false)} />;
  }

  return (
    <>
      <div className="w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
        <div
          ref={cardRef}
          className="relative min-h-[200px] w-full cursor-pointer"
          onClick={() => setIsFlipped(!isFlipped)}
          role="button"
          tabIndex={0}
          aria-label={`Flashcard. Click to flip. Currently showing ${isFlipped ? "answer" : "question"}`}
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
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex justify-end space-x-2">
            {mode === "suggestions" ? (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject(flashcard);
                  }}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  data-testid="reject-button"
                >
                  Reject
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  data-testid="edit-button"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAccept(flashcard);
                  }}
                  className="px-3 py-1 text-sm text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                  data-testid="accept-button"
                >
                  Accept
                </button>
              </>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReject(flashcard);
                }}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                data-testid="remove-button"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 m-4 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Flashcard Details</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="relative min-h-[300px]">
              <FlashcardContent isFlipped={isFlipped} content={flashcard.front} type="question" />
              <FlashcardContent isFlipped={isFlipped} content={flashcard.back} type="answer" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
