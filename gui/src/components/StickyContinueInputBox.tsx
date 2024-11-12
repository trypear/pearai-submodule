import { useEffect, useState, useCallback, useRef } from "react";
import styled from "styled-components";
import { vscBackground } from "./index";

interface StickyContinueInputBoxProps {
  children: React.ReactNode;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  forceFixed?: boolean;
}

const FixedBottomWrapper = styled.div<{ isFixed: boolean }>`
  position: ${props => props.isFixed ? 'fixed' : 'absolute'};
  bottom: ${props => props.isFixed ? '0' : 'unset'};
  top: ${props => props.isFixed ? 'unset' : '32px'}; 
  left: 0;
  right: 0;
  background-color: ${vscBackground};
  z-index: 100;
  width: 100%;
  transition: position 0.2s ease;
  margin-bottom: 36px;
  pointer-events: auto;
  overflow: visible;

  /* Position dropdowns above when fixed at bottom */
  &[data-fixed="true"] {
    & [role="listbox"],
    & [role="menu"] {
      bottom: 100% !important;
      top: auto !important;
    }
  }

  /* Handle tippy dropdown containers */
  & + .tippy-box {
    max-width: calc(100vw - 40px) !important;
    width: calc(100% - 16px);
  }
`;

export const StickyContinueInputBox = ({
  children,
  scrollContainerRef,
  forceFixed = false,
}: StickyContinueInputBoxProps) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [isFixed, setIsFixed] = useState(false);
  const hasContentRef = useRef(false);

  const checkScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollContent = container.firstElementChild as HTMLDivElement;
    if (!scrollContent) return;
    
    // Check for any content in the scroll area
    const hasContent = scrollContent.querySelector('.thread-message') !== null;
    
    // Reset our tracking if there's no content (new session)
    if (!hasContent) {
      hasContentRef.current = false;
    } else {
      hasContentRef.current = true;
    }
    
    setIsFixed(hasContentRef.current || forceFixed);
  }, [scrollContainerRef, forceFixed]);

  useEffect(() => {
    setIsFixed(forceFixed);
  }, [forceFixed]);

  useEffect(() => {
    if (!forceFixed) {
      checkScroll();
    }
  }, [forceFixed, checkScroll]);

  useEffect(() => {
    const element = boxRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const height = entries[0].borderBoxSize[0].blockSize;
      // Dispatch custom event with height
      window.dispatchEvent(new CustomEvent('inputBoxHeightChange', { 
        detail: height // Add margin-bottom
      }));
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollContent = container.firstElementChild as HTMLElement;
    if (!scrollContent) return;

    // Initial check
    checkScroll();

    // Debounced resize observer to avoid too frequent checks
    let resizeTimeout: NodeJS.Timeout;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkScroll, 100);
    });

    // Debounced mutation observer
    let mutationTimeout: NodeJS.Timeout;
    const mutationObserver = new MutationObserver(() => {
      clearTimeout(mutationTimeout);
      mutationTimeout = setTimeout(checkScroll, 100);
    });

    // Start observers
    resizeObserver.observe(scrollContent);
    mutationObserver.observe(scrollContent, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      clearTimeout(resizeTimeout);
      clearTimeout(mutationTimeout);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [checkScroll]);

  return (
    <FixedBottomWrapper ref={boxRef} isFixed={isFixed || forceFixed} data-fixed={isFixed || forceFixed}>
      {children}
    </FixedBottomWrapper>
  );
};
