import { RefObject, useEffect } from "react";
import { scrollElementToBottom } from "../lib/scrollUtils";

interface UseScrollBehaviorProps {
  divRef: RefObject<HTMLElement>;
  active: boolean;
  isAtBottom: boolean;
  setIsAtBottom: (value: boolean) => void;
  isInventoryMode?: boolean;
}

export function useScrollBehavior({
  divRef,
  active,
  isAtBottom,
  setIsAtBottom,
  isInventoryMode = false,
}: UseScrollBehaviorProps) {
  // Active scroll interval effect
  useEffect(() => {
    if (!active || !divRef.current) return;

    const scrollInterval = setInterval(() => {
      if (divRef.current && isAtBottom) {
        scrollElementToBottom(divRef, {
          isInventoryMode,
          isActive: active,
          onScrollComplete: () => setIsAtBottom(true),
        });
      }
    }, 100);

    return () => clearInterval(scrollInterval);
  }, [active, isAtBottom, divRef, isInventoryMode, setIsAtBottom]);

  // Inactive scroll snap effect
  useEffect(() => {
    if (!divRef.current) return;

    if (!active && isAtBottom) {
      // Only snap to bottom if user hadn't scrolled up
      const scrollAreaElement = divRef.current;

      requestAnimationFrame(() => {
        scrollAreaElement.scrollTop = scrollAreaElement.scrollHeight;

        if (isInventoryMode) {
          // One more time after a brief delay for inventory mode
          setTimeout(() => {
            if (scrollAreaElement) {
              scrollAreaElement.scrollTop = scrollAreaElement.scrollHeight;
            }
          }, 100);
        }
      });
    }
  }, [active, isAtBottom, isInventoryMode, divRef]);
}
