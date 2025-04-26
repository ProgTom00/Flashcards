import React from "react";

export function Logo() {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="text-primary">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M12 8v8" />
          <path d="m9 12 3-3 3 3" />
        </svg>
      </div>
      <span className="text-xl font-bold text-gray-900">Flashcards</span>
    </div>
  );
}
