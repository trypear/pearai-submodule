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
  bottom: 1.5rem;
  right: 2.25rem;
  background-color: ${vscBackground};
  border: 0.5px solid ${lightGray};
  border-radius: 10%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: ${props => props.visible ? 1 : 0};
  visibility: ${props => props.visible ? 'visible' : 'hidden'};
  transition: all 0.2s ease;
  box-shadow: 0 0.125rem 0.375rem rgba(0, 0, 0, 0.1);  // 2px 6px
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
    
    const scrollContent = container.firstElementChild as HTMLElement;

    if (!scrollContent) return;

    const hasScroll = scrollContent.scrollHeight > scrollContent.clientHeight;
    const scrollTop = scrollContent.scrollTop;
    const atBottom = (scrollContent.scrollHeight - scrollTop - scrollContent.clientHeight) < 50;
    
    setShowScrollButton(hasScroll && !atBottom);
  }, []);

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

  const scrollToBottom = useCallback(() => {
    if (!userHasScrolled.current) {
      anchorRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, []);

  const forceScrollToBottom = useCallback(() => {
    const container = scrollRef.current;

    if (!container) return;
    
    container.scrollTop = container.scrollHeight;
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

  useEffect(() => {
    if (active) {
      userHasScrolled.current = false;
    }
  }, [active]);

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

  useEffect(() => {
    const handleResize = () => {
      updateScrollButtonVisibility();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateScrollButtonVisibility]);

  useEffect(() => {
    const container = scrollRef.current;

    if (!container) return;

    const scrollContent = container.firstElementChild as HTMLElement;

    if (!scrollContent) return;

    updateScrollButtonVisibility();

    scrollContent.addEventListener("scroll", handleScroll, { passive: true });
    scrollContent.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      scrollContent.removeEventListener("scroll", handleScroll);
      scrollContent.removeEventListener("wheel", handleWheel);
    };
  }, [handleScroll, handleWheel, updateScrollButtonVisibility]);

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
