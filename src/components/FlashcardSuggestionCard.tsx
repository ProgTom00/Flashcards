// FlashcardSuggestionCard component - handles the display and interaction of flashcard suggestions
import React, { useState, useRef, useEffect } from "react";
import type { FlashcardSuggestionDTO } from "../types";
import "../styles/animations.css";

interface FlashcardSuggestionCardProps {
  flashcard: FlashcardSuggestionDTO;
  onAccept: (flashcard: FlashcardSuggestionDTO) => void;
  onEdit: (flashcard: FlashcardSuggestionDTO) => void;
  onReject: (flashcard: FlashcardSuggestionDTO) => void;
  mode?: "suggestions" | "accepted";
}

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
  const [editedFront, setEditedFront] = useState(flashcard.front);
  const [editedBack, setEditedBack] = useState(flashcard.back);
  const [errors, setErrors] = useState<{ front?: string; back?: string }>({});
  const frontInputRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && frontInputRef.current) {
      frontInputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
        return;
      }

      if (cardRef.current?.contains(document.activeElement) || modalRef.current?.contains(document.activeElement)) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsFlipped(!isFlipped);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, isModalOpen]);

  const validateContent = () => {
    const newErrors: { front?: string; back?: string } = {};

    if (editedFront.trim().length < 3) {
      newErrors.front = "Front content must be at least 3 characters";
    }
    if (editedFront.trim().length > 200) {
      newErrors.front = "Front content must not exceed 200 characters";
    }

    if (editedBack.trim().length < 3) {
      newErrors.back = "Back content must be at least 3 characters";
    }
    if (editedBack.trim().length > 500) {
      newErrors.back = "Back content must not exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setIsFlipped(false);
    setErrors({});
  };

  const handleSaveEdit = () => {
    if (validateContent()) {
      onEdit({
        ...flashcard,
        front: editedFront.trim(),
        back: editedBack.trim(),
        source: "ai-edited",
      });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedFront(flashcard.front);
    setEditedBack(flashcard.back);
    setIsEditing(false);
    setErrors({});
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const renderCardContent = (inModal = false) => {
    const contentClasses = inModal ? "text-lg" : "text-base line-clamp-4";
    const containerClasses = inModal ? "min-h-[300px]" : "min-h-[200px]";

    return (
      <div
        ref={inModal ? modalRef : cardRef}
        className={`relative ${containerClasses} w-full cursor-pointer`}
        onClick={() => setIsFlipped(!isFlipped)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsFlipped(!isFlipped);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Flashcard. Click to flip. Currently showing ${isFlipped ? "answer" : "question"}`}
      >
        <div
          className={`absolute inset-0 p-6 transition-opacity duration-300 ${isFlipped ? "opacity-0" : "opacity-100"}`}
        >
          <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 flex flex-col">
            <p className="font-medium text-gray-900 mb-2">Question:</p>
            <p className={`text-gray-800 flex-grow ${contentClasses}`}>{flashcard.front}</p>
            {!inModal && flashcard.front.length > 100 && (
              <button onClick={handleExpandClick} className="text-sm text-blue-600 hover:text-blue-800 underline mt-2">
                Show more
              </button>
            )}
            <p className="text-sm text-blue-600 mt-4 italic">Click to see answer</p>
          </div>
        </div>

        <div
          className={`absolute inset-0 p-6 transition-opacity duration-300 ${isFlipped ? "opacity-100" : "opacity-0"}`}
        >
          <div className="h-full bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 flex flex-col">
            <p className="font-medium text-gray-900 mb-2">Answer:</p>
            <p className={`text-gray-800 flex-grow ${contentClasses}`}>{flashcard.back}</p>
            {!inModal && flashcard.back.length > 100 && (
              <button
                onClick={handleExpandClick}
                className="text-sm text-emerald-600 hover:text-emerald-800 underline mt-2"
              >
                Show more
              </button>
            )}
            <p className="text-sm text-emerald-600 mt-4 italic">Click to see question</p>
          </div>
        </div>
      </div>
    );
  };

  if (isEditing) {
    return (
      <div className="w-full bg-white rounded-xl shadow-md p-6 space-y-4 animate-fade-in">
        <div className="space-y-4">
          <div>
            <label htmlFor="front" className="block text-sm font-medium text-gray-700 mb-1">
              Question <span className="text-gray-500">({200 - editedFront.length} characters left)</span>
            </label>
            <textarea
              ref={frontInputRef}
              id="front"
              value={editedFront}
              onChange={(e) => setEditedFront(e.target.value)}
              className={`w-full min-h-[80px] p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.front ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your question"
              aria-invalid={!!errors.front}
              aria-describedby={errors.front ? "front-error" : undefined}
            />
            {errors.front && (
              <p id="front-error" className="mt-1 text-sm text-red-500" role="alert">
                {errors.front}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="back" className="block text-sm font-medium text-gray-700 mb-1">
              Answer <span className="text-gray-500">({500 - editedBack.length} characters left)</span>
            </label>
            <textarea
              id="back"
              value={editedBack}
              onChange={(e) => setEditedBack(e.target.value)}
              className={`w-full min-h-[120px] p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.back ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter the answer"
              aria-invalid={!!errors.back}
              aria-describedby={errors.back ? "back-error" : undefined}
            />
            {errors.back && (
              <p id="back-error" className="mt-1 text-sm text-red-500" role="alert">
                {errors.back}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={handleCancelEdit}
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveEdit}
            className="px-3 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
        {renderCardContent(false)}
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
                >
                  Reject
                </button>
                <button
                  onClick={handleEditClick}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAccept(flashcard);
                  }}
                  className="px-3 py-1 text-sm text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
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
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
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
            {renderCardContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
