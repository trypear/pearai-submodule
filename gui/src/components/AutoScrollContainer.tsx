import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { ChevronDownIcon } from "@heroicons/react/24/outline"; // Add this import
import { lightGray, vscBackground } from ".";

const ScrollContainer = styled.div<{ inputBoxHeight: number }>`
  height: ${(props) => `calc(100% - ${props.inputBoxHeight}px)`};
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: hidden;
  position: relative;
  width: 100%;
  margin-top: 0;
  padding-top: 0;
`;

export const ScrollContent = styled.div`
  contain: content;
  flex: 0 1 auto;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  z-index: 98;
  width: 100%;
  margin-top: 0;
  padding-top: 0;
`;

const ScrollAnchor = styled.div`
  height: 1px;
  width: 100%;
`;

const ScrollToBottomButton = styled.button<{ visible: boolean }>`
  position: absolute;
  bottom: 24px;
  right: 36px;
  background-color: ${vscBackground};
  border: 0.5px solid ${lightGray};
  border-radius: 10%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: ${props => props.visible ? 1 : 0};
  visibility: ${props => props.visible ? 'visible' : 'hidden'};
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 99;

  svg {
    color: ${lightGray};
  }
`;

interface AutoScrollContainerProps {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}

export const AutoScrollContainer = forwardRef<
  HTMLDivElement,
  AutoScrollContainerProps
>(({ children, active = false, className }, forwardedRef) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const scrollRef = (forwardedRef ||
    internalRef) as React.RefObject<HTMLDivElement>;
  const anchorRef = useRef<HTMLDivElement>(null);
  const scrollInterval = useRef<NodeJS.Timeout>();
  const userHasScrolled = useRef(false);
  const lastScrollTop = useRef(0);

  const [inputBoxHeight, setInputBoxHeight] = useState(140);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Memoize the isAtBottom function since it's used in multiple places
  const isAtBottom = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return false;
    const threshold = 50;
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold
    );
  }, []);

  const updateScrollButtonVisibility = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    
    // Get ScrollContent directly using ref instead of querySelector
    const scrollContent = container.firstElementChild as HTMLElement;
    if (!scrollContent) return;

    // Check actual scroll state of ScrollContent
    const hasScroll = scrollContent.scrollHeight > scrollContent.clientHeight;
    const scrollTop = scrollContent.scrollTop;
    const atBottom = (scrollContent.scrollHeight - scrollTop - scrollContent.clientHeight) < 50;

    console.log('Visibility check:', { 
      hasScroll, 
      atBottom, 
      scrollHeight: scrollContent.scrollHeight,
      clientHeight: scrollContent.clientHeight,
      scrollTop
    });
    
    setShowScrollButton(hasScroll && !atBottom);
  }, []);

  // Memoize scroll handlers to avoid recreating them on every render
  const handleScroll = useCallback((e: Event) => {
    const scrollContent = e.target as HTMLElement;
    const currentScrollTop = scrollContent.scrollTop;
    
    if (currentScrollTop < lastScrollTop.current) {
      userHasScrolled.current = true;
    } else if ((scrollContent.scrollHeight - currentScrollTop - scrollContent.clientHeight) < 50) {
      userHasScrolled.current = false;
    }

    lastScrollTop.current = currentScrollTop;
    updateScrollButtonVisibility();
  }, [updateScrollButtonVisibility]);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (e.deltaY < 0) {
        userHasScrolled.current = true;
      } else if (e.deltaY > 0 && isAtBottom()) {
        userHasScrolled.current = false;
      }
    },
    [isAtBottom],
  );

  // Scroll to bottom helper function to reduce code duplication
  const scrollToBottom = useCallback(() => {
    if (!userHasScrolled.current) {
      anchorRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, []);

  // Force scroll to absolute bottom
  const forceScrollToBottom = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    
    // Force scroll to absolute bottom
    container.scrollTop = container.scrollHeight;
    // Also try scrollIntoView on anchor as backup
    anchorRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    userHasScrolled.current = false;
  }, []);

  useEffect(() => {
    const handleHeightChange = (event: CustomEvent<number>) => {
      setInputBoxHeight(event.detail);
    };

    window.addEventListener('inputBoxHeightChange', handleHeightChange as EventListener);
    return () => {
      window.removeEventListener('inputBoxHeightChange', handleHeightChange as EventListener);
    };
  }, []);

  // Reset auto-scroll when active changes
  useEffect(() => {
    if (active) {
      userHasScrolled.current = false;
    }
  }, [active]);

  // Handle auto-scrolling interval
  useEffect(() => {
    if (!active) return;

    scrollToBottom();
    scrollInterval.current = setInterval(scrollToBottom, 150);

    return () => {
      if (scrollInterval.current) {
        clearInterval(scrollInterval.current);
        scrollInterval.current = undefined;
      }
    };
  }, [active, scrollToBottom]);

  // Handle content mutations
  useEffect(() => {
    if (!active) return;

    const observer = new MutationObserver(() => {
      updateScrollButtonVisibility();
    });
    
    const container = scrollRef.current;
    if (container) {
      observer.observe(container, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    return () => observer.disconnect();
  }, [active, updateScrollButtonVisibility]);

  // Check visibility for resize
  useEffect(() => {
    const handleResize = () => {
      updateScrollButtonVisibility();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateScrollButtonVisibility]);

  // Set up event listeners
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollContent = container.firstElementChild as HTMLElement;
    if (!scrollContent) return;

    // Initial check
    updateScrollButtonVisibility();

    scrollContent.addEventListener("scroll", handleScroll, { passive: true });
    scrollContent.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      scrollContent.removeEventListener("scroll", handleScroll);
      scrollContent.removeEventListener("wheel", handleWheel);
    };
  }, [handleScroll, handleWheel, updateScrollButtonVisibility]);

  // Final scroll when active changes from true to false (output complete)
  useEffect(() => {
    if (!active) {
      setTimeout(forceScrollToBottom, 100);
    }
  }, [active, forceScrollToBottom]);

  return (
    <ScrollContainer
      ref={scrollRef}
      className={className}
      inputBoxHeight={inputBoxHeight}
    >
      <ScrollContent>
        {children}
        <ScrollAnchor ref={anchorRef} />
      </ScrollContent>
      <ScrollToBottomButton 
        visible={showScrollButton}
        onClick={() => {
          const scrollContent = scrollRef.current?.firstElementChild as HTMLElement;
          if (scrollContent) {
            scrollContent.scrollTop = scrollContent.scrollHeight;
            userHasScrolled.current = false;
          }
        }}
        aria-label="Scroll to bottom"
      >
        <ChevronDownIcon width={16} height={16} />
      </ScrollToBottomButton>
    </ScrollContainer>
  );
});
