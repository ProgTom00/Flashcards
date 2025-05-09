import React from "react";

export function Loader() {
  return (
    <div className="flex justify-center items-center py-8" data-testid="loading-spinner">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}
