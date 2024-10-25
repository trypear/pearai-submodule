import { RefObject, useCallback } from "react";

export function scrollElementToBottom(
  elementRef: React.RefObject<HTMLElement>,
  options: {
    isInventoryMode?: boolean;
    isActive?: boolean;
    onScrollComplete?: () => void;
  } = {},
) {
  if (!elementRef.current) return;

  const {
    isInventoryMode = false,
    isActive = false,
    onScrollComplete,
  } = options;

  requestAnimationFrame(() => {
    const scrollAreaElement = elementRef.current!;
    scrollAreaElement.scrollTop = scrollAreaElement.scrollHeight;

    // For aider mode, keep checking scroll position
    if (isInventoryMode && !isActive) {
      let attempts = 0;
      const maxAttempts = 10;

      const checkScroll = () => {
        if (!elementRef.current || attempts >= maxAttempts) {
          onScrollComplete?.();
          return;
        }

        const currentHeight = elementRef.current.scrollHeight;
        elementRef.current.scrollTop = currentHeight;

        // If not at bottom, try again
        const isAtBottom =
          Math.abs(
            currentHeight -
              elementRef.current.clientHeight -
              elementRef.current.scrollTop,
          ) < 2;

        if (!isAtBottom) {
          attempts++;
          setTimeout(checkScroll, 50);
        } else {
          onScrollComplete?.();
        }
      };

      setTimeout(checkScroll, 50);
    } else {
      onScrollComplete?.();
    }
  });
}

export function createScrollHandler(
  elementRef: RefObject<HTMLElement>,
  setIsAtBottom: (value: boolean) => void,
  isAtBottom: boolean,
) {
  return useCallback(() => {
    const OFFSET_HERUISTIC = 50;
    if (!elementRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = elementRef.current;
    const atBottom =
      scrollHeight - clientHeight <= scrollTop + OFFSET_HERUISTIC;

    // Add immediate state update when user scrolls up
    if (!atBottom) {
      setIsAtBottom(false);
    } else if (atBottom && !isAtBottom) {
      setIsAtBottom(true);
    }
  }, [elementRef, setIsAtBottom, isAtBottom]);
}

export function createManualScrollHandler(
  elementRef: RefObject<HTMLElement>,
  setIsAtBottom: (value: boolean) => void,
) {
  return useCallback(() => {
    if (!elementRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = elementRef.current;

    if (scrollHeight - clientHeight - scrollTop > 50) {
      setIsAtBottom(false);
    }
  }, [elementRef, setIsAtBottom]);
}
