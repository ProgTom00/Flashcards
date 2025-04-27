import { useEffect } from "react";

interface UseKeyboardEventsProps {
  onEscape?: () => void;
  onSpace?: () => void;
  onEnter?: () => void;
  isEnabled?: boolean;
  targetRef?: React.RefObject<HTMLElement>;
}

export const useKeyboardEvents = ({
  onEscape,
  onSpace,
  onEnter,
  isEnabled = true,
  targetRef,
}: UseKeyboardEventsProps) => {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // If targetRef is provided, only handle events when the target element contains the active element
      if (targetRef && !targetRef.current?.contains(document.activeElement)) {
        return;
      }

      switch (e.code) {
        case "Escape":
          if (onEscape) {
            e.preventDefault();
            onEscape();
          }
          break;
        case "Space":
          if (onSpace) {
            e.preventDefault();
            onSpace();
          }
          break;
        case "Enter":
          if (onEnter) {
            e.preventDefault();
            onEnter();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isEnabled, onEscape, onSpace, onEnter, targetRef]);
};
