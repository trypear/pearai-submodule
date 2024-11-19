import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { ChevronDownIcon } from "@heroicons/react/24/outline"; // Add this import
import { lightGray, vscBackground } from ".";
import { debounce } from "lodash";

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

export const ScrollContent = styled.div<{ isActive?: boolean }>`
  contain: content;
  flex: 0 1 auto;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  z-index: 98;
  width: 100%;
  margin-top: 0;
  padding-top: 0;
  scroll-behavior: smooth;
  
  ${props => props.isActive && `
    scrollbar-width: none;
  `}
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

const ResponseSpacer = styled.div<{ sidebarHeight?: number }>`
  height: ${props => `calc(100vh - ${props.sidebarHeight || 0}px - 12.5rem)`}; 
  flex-shrink: 1;
  transition: all 0.5s ease-out;
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
  const [sidebarHeight, setSidebarHeight] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const isAtBottom = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return false;

    const threshold = 100;

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

  const debouncedScroll = useCallback(
    debounce((e: Event) => {
      const scrollContent = e.target as HTMLElement;
      const currentScrollTop = scrollContent.scrollTop;
      
      if (currentScrollTop !== lastScrollTop.current) {
        userHasScrolled.current = true;
      }
  
      lastScrollTop.current = currentScrollTop;
      updateScrollButtonVisibility();
    }, 100),
    [updateScrollButtonVisibility]
  );

  const handleScroll = useCallback((e: Event) => {
    const scrollContent = e.target as HTMLElement;
    const currentScrollTop = scrollContent.scrollTop;
    
    if (currentScrollTop !== lastScrollTop.current) {
      userHasScrolled.current = true;
    }
  
    lastScrollTop.current = currentScrollTop;
    updateScrollButtonVisibility();
  }, [updateScrollButtonVisibility]);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        userHasScrolled.current = true;
      }
    },
    [isAtBottom],
  );

  const scrollToLatestResponse = useCallback(() => {
    if (!userHasScrolled.current) {
      const container = scrollRef.current?.firstElementChild as HTMLElement;
  
      if (!container) return;
  
      const scrollTarget = container.querySelector('.scroll-target');
      if (scrollTarget) {
        scrollTarget.scrollIntoView({ 
          behavior: "smooth", 
          block: "start",
        });
      }
    }
  }, []);

  useEffect(() => {
    const measureSidebar = () => {
      const sidebar = document.querySelector('.sidebar') as HTMLElement;

      if (sidebar) {
        setSidebarHeight(sidebar.offsetHeight);
      }
    };
  
    measureSidebar();
    window.addEventListener('resize', measureSidebar);
    
    return () => window.removeEventListener('resize', measureSidebar);
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
      setIsTransitioning(true);
    } else {
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    }
  }, [active]);

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
  
    scrollContent.addEventListener("scroll", debouncedScroll, { passive: true });
    scrollContent.addEventListener("wheel", handleWheel, { passive: true });
  
    return () => {
      scrollContent.removeEventListener("scroll", debouncedScroll);
      scrollContent.removeEventListener("wheel", handleWheel);
      debouncedScroll.cancel();
    };
  }, [debouncedScroll, handleWheel]);

  useEffect(() => {
    if (!active) return;
  
    scrollToLatestResponse();
    scrollInterval.current = setInterval(scrollToLatestResponse, 200);
  
    return () => {
      if (scrollInterval.current) {
        clearInterval(scrollInterval.current);
        scrollInterval.current = undefined;
      }
    };
  }, [active, scrollToLatestResponse]);

  return (
    <ScrollContainer
      ref={scrollRef}
      className={className}
      inputBoxHeight={inputBoxHeight}
    >
      <ScrollContent isActive={active}>
        {children}
        {(active || isTransitioning) && (
          <ResponseSpacer sidebarHeight={sidebarHeight} />
        )}
        <ScrollAnchor ref={anchorRef} />
      </ScrollContent>
      <ScrollToBottomButton 
        visible={showScrollButton}
        onClick={() => {
          const scrollContent = scrollRef.current?.firstElementChild as HTMLElement;
          const anchor = anchorRef.current;
          
          if (scrollContent && anchor) {
            userHasScrolled.current = true;
            anchor.scrollIntoView({ 
              behavior: "smooth", 
              block: "end"
            });
          }
        }}
        aria-label="Scroll to bottom"
      >
        <ChevronDownIcon width={16} height={16} />
      </ScrollToBottomButton>
    </ScrollContainer>
  );
});
