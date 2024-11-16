import { vscBackground, vscForeground, vscInputBorderFocus } from '@/components';
import DelayedMessage from '@/components/DelayedMessage';
import CopyButtonWithText from '@/components/markdown/CopyButtonWithText';
import { Button } from '@/components/ui/button';
import { IdeMessengerContext } from '@/context/IdeMessenger';
import useHistory from '@/hooks/useHistory';
import { useWebviewListener } from '@/hooks/useWebviewListener';
import { getMetaKeyAndShortcutLabel } from '@/util';
import { ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

interface OnboardingTutorialProps {
  onClose: () => void;
  onExampleClick?: (text: string) => void;
}


const gradient = keyframes`
  0% {
    background-position: 0px 0;
  }
  100% {
    background-position: 100em 0;
  }
`;

const TutorialCardBorder = styled.div`
  border-radius: 8px;
  width: 100%;
  margin-left: 2rem; 
  margin-right: 2rem;
  background: repeating-linear-gradient(
      101.79deg,
      #4DA587 0%,
      #4DA677 10%,
      #3E9467 20%,
      #4DA587 30%,
      #3E9467 40%,
      #4DA587 50%,
      #3E9467 60%,
      #4DA587 70%,
      #3E9467 80%,
      #4DA587 90%,
      #4DA587 100%
    );
  background-size: 200% 200%;
  animation: ${gradient} 4s ease infinite;
  width: 100% - 0.6rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 8px;
`;

const TutorialCardDiv = styled.div`
  border-radius: 8px;
  margin: 1rem;
  width: 100%;
  position: relative;
  max-height: 30rem;
  height: 20rem;
  box-shadow: 
    0 8px 16px rgba(0, 0, 0, 0.2),
    0 4px 4px rgba(0, 0, 0, 0.15),
    0 0 1px rgba(255, 255, 255, 0.1) inset;
  overflow: hidden;
`;

const ContentWrapper = styled(motion.div) <{ direction: 'left' | 'right' }>`
  opacity: 0;
  margin-top: 0.5rem;
  border-top: 1px solid ${vscInputBorderFocus};
  animation: slideIn 0.6s ease-out forwards;

  @keyframes slideIn {
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

const ExamplesSection = styled.div`
  margin-top: 0.5rem;
  padding-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
  opacity: 0;
  animation: fadeIn 0.3s ease-out 0.2s forwards;
  background-color: ${vscBackground};
  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }
`;


const ExamplesHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.2rem;
  margin-bottom: 0.5rem;
`;

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onClose, onExampleClick }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const ideMessenger = useContext(IdeMessengerContext);
  const dispatch = useDispatch();
  const { saveSession } = useHistory(dispatch, "continue");
  const [noCodeSelectedMsg, setNoCodeSelectedMsg] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const pages = [
    {
      title: (<h3>Select Code and Chat (<kbd>{getMetaKeyAndShortcutLabel()}</kbd>+<kbd>L</kbd>)</h3>),
      description: <p>Select few lines of code, and press <b><kbd className="font-mono">{getMetaKeyAndShortcutLabel()}</kbd> <kbd className="font-mono">L</kbd></b> to add it to this chat box context.<br /><br />
        <span>Don't have a file open?</span>
        <br />
        <span className='mt-2'> Click here <kbd className="no-underline font-mono decoration-current hover:underline cursor-pointer font-bold" onClick={() => ideMessenger.post("showTutorial", undefined)}>pearai_tutorial.py</kbd> to open a sample file</span>
        {noCodeSelectedMsg && (
          <div className="bg-yellow-200 text-yellow-800 p-2 rounded mb-2">
            {noCodeSelectedMsg}
          </div>
        )}
      </p>,
    },
    {
      description: (
        <>
          <p>Ask a question about the code you just highlighted in the chat below!</p>
          <DelayedMessage
            message="Press the right arrow below for the next step."
            delay={10000}
          />
        </>
      ),
      examples: [
        "Explain what this code does",
        "What could be improved here?",
      ]
    },
    {
      title: <h3>Inline Code Editing (<kbd>{getMetaKeyAndShortcutLabel()}</kbd>+<kbd>I</kbd>)</h3>,
      description: <p>Now let's try inline editing... Try the below examples by first highlighting a function in full, and pressing <b><kbd className="text-base">{getMetaKeyAndShortcutLabel()}</kbd>+<kbd>I</kbd></b>.</p>,
      examples: [
        "Add error handling",
        "Improve this code",
      ]
    },
    {
      title: <h3>Inline Code Editing (<kbd>{getMetaKeyAndShortcutLabel()}</kbd>+<kbd>I</kbd>)</h3>,
      description: <p>After the changes appear, you can:<ul className="list-disc marker:text-foreground" >
        <li><b>accept all changes with <kbd>{getMetaKeyAndShortcutLabel()}+SHIFT+ENTER</kbd></b>,</li>
        <li>or <b>reject all changes with <kbd>{getMetaKeyAndShortcutLabel()}+SHIFT+BACKSPACE</kbd></b></li>
      </ul></p>,
    },
    {
      title: <h3>Codebase Context (<kbd>{getMetaKeyAndShortcutLabel()}</kbd>+<kbd>ENTER</kbd>)</h3>,
      description: <p >Almost done! Try asking anything about your general codebase by prompting then pressing <b><kbd>{getMetaKeyAndShortcutLabel()}</kbd>+<kbd>ENTER</kbd></b>.<br /><br /> Note: codebase indexing must finish before you can run this!</p>,
      examples: [
        "What does my codebase do",
        "Where should I start to implement a feature about X"
      ]
    },
    {
      title: <h3>Toggle PearAI Inventory</h3>,
      description: <p>Lastly, press <b><kbd>{getMetaKeyAndShortcutLabel()}</kbd>+<kbd>E</kbd></b> to toggle <b>PearAI Inventory</b>, and try out <strong>Creator</strong> and <strong>Search</strong> directly in there! <br /><br />Enjoy PearAI! If you have questions, feel free to ask us in our <a href="https://discord.gg/7QMraJUsQt">Discord</a>, or through <a href="mailto:pear@trypear.ai">email</a>.</p>,
    },
  ]

  const nextPage = () => {
    setIsTransitioning(true);
    setSlideDirection('right');
    setCurrentPage((prev) => Math.min(prev + 1, pages.length - 1));
    if (currentPage === 1) {
      saveSession();
    }
    setTimeout(() => setIsTransitioning(false), 600);
  };

  const prevPage = () => {
    setSlideDirection('left');
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const currentPageData = pages[currentPage];
  const hasExamples = Boolean(currentPageData.examples);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      nextPage();
    } else if (event.key === 'ArrowLeft') {
      prevPage();
    }
  }, [currentPage, nextPage, prevPage]);

  useWebviewListener(
    "highlightedCode",
    async (data) => {
      if (!data.rangeInFileWithContents.contents) {
        setNoCodeSelectedMsg("Hey, seems you have not selected any code.");
        return;
      }
      if (currentPage === 0) {
        nextPage()
      }
    },
    [currentPage],
  );

  // activate highlighting
  useWebviewListener(
    "quickEdit",
    async () => {
      if (currentPage === 2) {
        // Wait 100ms for quick input widget to appear
        await new Promise(resolve => setTimeout(resolve, 100));
        ideMessenger.post("highlightElement", { elementSelectors: ['.quick-input-widget'] });
        nextPage();
      }
    },
    [currentPage],
  );

  useWebviewListener("acceptedOrRejectedDiff",
    async () => {
      if (currentPage === 3) {
        nextPage()
      }
    },
    [currentPage],
  )

  useEffect(() => {
    if (currentPage === 3) {
      const handleEnterKey = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          nextPage();
        }
        if (['Enter', 'ArrowLeft', 'ArrowRight', 'Escape'].includes(event.key)) {
          ideMessenger.post("unhighlightElement", { elementSelectors: ['.quick-input-widget'] });
        }
      };

      window.addEventListener('keydown', handleEnterKey);

      // Cleanup function
      return () => {
        ideMessenger.post("unhighlightElement", { elementSelectors: ['.quick-input-widget'] });
      };
    }
  }, [currentPage]); // Include all dependencies

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage]);

  return (
    <TutorialCardBorder>
      <TutorialCardDiv className={`flex flex-col p-2 justify-between bg-background text-sm overflow-hidden text-input-foreground`}>
        <div className="mb-3">
          <div
            onClick={onClose}
            className="absolute underline top-2 right-2 p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full cursor-pointer shadow-sm"
            role="button"
            aria-label="Close"
          >
            Close
          </div>
          <div className="flex flex-col justify-between mt-1">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-white">Learn how to use PearAI chat</h2>

              <ContentWrapper
                direction={slideDirection}
                key={currentPage}
                initial={{ x: slideDirection === 'right' ? 100 : -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: slideDirection === 'right' ? -100 : 100, opacity: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {currentPageData.description}
                </motion.span>
                {hasExamples && (
                  <ExamplesSection >
                    <ExamplesHeader >
                      <Lightbulb size={13} />
                      <span>Try these examples</span>
                    </ExamplesHeader>
                    <div className="flex flex-wrap gap-1">
                      {currentPageData.examples.map((example) => (
                        <CopyButtonWithText
                          key={example}
                          text={example}
                          side="top"
                          variant="ghost"
                          onTextClick={onExampleClick}
                        />
                      ))}
                    </div>
                  </ExamplesSection>
                )}
              </ContentWrapper>
            </div>
          </div>
        </div>
        <div className="pl-1 justify-end items-center gap-2 inline-flex">
          <Button
            size="icon"
            onClick={prevPage}
            disabled={currentPage === 0}
            className="h-6 w-6"
          >
            <ChevronLeft color="background" />
          </Button>
          <span className="text-xs">{currentPage + 1} / {pages.length}</span>
          <Button
            size="icon"
            onClick={nextPage}
            disabled={currentPage === pages.length - 1}
            className="h-6 w-6"
          >
            <ChevronRight color="background" />
          </Button>
        </div>
      </TutorialCardDiv>
    </TutorialCardBorder>
  );
};

export default OnboardingTutorial;
