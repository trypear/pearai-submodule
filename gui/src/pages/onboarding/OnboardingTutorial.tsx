import { vscBackground, vscForeground, vscInputBorderFocus } from '@/components';
import { Button } from '@/components/ui/button';
import { getMetaKeyAndShortcutLabel } from '@/util';
import { ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface OnboardingTutorialProps {
  onClose: () => void;
  onExampleClick?: (text: string) => void;
}

const TutorialCardDiv = styled.div`
  border-radius: 8px;
  margin: 1rem;
  position: relative;
  box-shadow: 
    0 10px 20px rgba(0, 0, 0, 0.2),
    0 6px 6px rgba(0, 0, 0, 0.15),
    0 0 1px rgba(255, 255, 255, 0.1) inset;
  animation: float 2s ease-in-out infinite;

  @keyframes float {
    0% {
      transform: translateY(0px);
      box-shadow: 
        0 10px 20px rgba(0, 0, 0, 0.2),
        0 6px 6px rgba(0, 0, 0, 0.15);
    }
    50% {
      transform: translateY(-3px);
      box-shadow: 
        0 15px 25px rgba(0, 0, 0, 0.25),
        0 8px 8px rgba(0, 0, 0, 0.2);
    }
    100% {
      transform: translateY(0px);
      box-shadow: 
        0 10px 20px rgba(0, 0, 0, 0.2),
        0 6px 6px rgba(0, 0, 0, 0.15);
    }
  }

  &:hover {
    animation-play-state: paused;
  }
`;

const ContentWrapper = styled.div<{ direction: 'left' | 'right' }>`
  opacity: 0;
  margin-top: 0.5rem;
  border-top: 1px solid ${vscInputBorderFocus};
  transform: translateX(${props => props.direction === 'left' ? '-0.2rem' : '0.3rem'});
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

const ShimmeredText = styled.span`
  position: relative;
  display: inline-block;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, ${vscForeground} 90%, transparent) 50%,
    ${vscForeground} 50%
  );
  background-size: 200% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmerText 3s ease-out forwards;

  @keyframes shimmerText {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: -100% 0;
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

  const nextPage = () => {
    setSlideDirection('right');
    setCurrentPage((prev) => Math.min(prev + 1, pages.length - 1));
  };

  const prevPage = () => {
    setSlideDirection('left');
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const currentPageData = pages[currentPage];
  const hasExamples = Boolean(currentPageData.examples);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        nextPage();
      } else if (event.key === 'ArrowLeft') {
        prevPage();
      }
    };


    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage]);

  

  return (
    <TutorialCardDiv className="flex flex-col p-2 justify-between bg-background">
      <div className="mb-3">
          <div className="flex flex-col justify-between mt-1">
            <div>
              <div className="flex justify-between items-center text-muted">
              Quick Walkthrough (1 min)
                <div className="pl-1 justify-end items-center gap-2 inline-flex">
                  <Button 
                    size="icon" 
                    onClick={prevPage} 
                    disabled={currentPage === 0}
                    className="h-6 w-6"
                  >
                    <ChevronLeft color="background"/>
                  </Button>
                  <span className="text-xs">{currentPage + 1} / {pages.length}</span>
                  <Button 
                    size="icon" 
                    onClick={nextPage} 
                    disabled={currentPage === pages.length - 1}
                    className="h-6 w-6"
                  >
                    <ChevronRight color="background"/>
                  </Button>
                </div>
              </div>
              <ContentWrapper direction={slideDirection} key={currentPage} className="pl-1">
                <ShimmeredText className="text-sm">{currentPageData.description}</ShimmeredText>
                {hasExamples && (
                  <ExamplesSection className="mb-3">
                    <ExamplesHeader >
                      <Lightbulb size={13} />
                      <span>Try these examples</span>
                    </ExamplesHeader>
                    <div className="flex flex-wrap gap-1">
                      {currentPageData.examples.map((example, index) => (
                        <Button
                          key={index}
                          onClick={() => onExampleClick?.(example)}
                          variant="animated"
                          className=""
                          size="sm"
                          style={{ '--index': index } as React.CSSProperties}
                        >
                          {example}
                        </Button>
                      ))}
                    </div>
                  </ExamplesSection>
                )}
              </ContentWrapper>
            </div>
          </div>
      </div>
      <div
          onClick={onClose}
          className="absolute underline bottom-1 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full cursor-pointer shadow-sm"
          role="button"
          aria-label="Close"
        >
          Close
      </div>
    </TutorialCardDiv>
  );
};

const pages = [
  {
    title: <h3>Select Code and Chat (<kbd>{getMetaKeyAndShortcutLabel()}</kbd>+<kbd>L</kbd>)</h3>,
    description: <p>Highlight a portion of code, and press <kbd className="text-base">{getMetaKeyAndShortcutLabel()}</kbd>+<kbd className="text-base">L</kbd> to add it as chat context.<br/><br/><em>Hint: you can also use <kbd>{getMetaKeyAndShortcutLabel()}</kbd>+<kbd>L</kbd> to start new chats!</em></p>,
  },
  {
    description: <p>Ask a question about the code you just highlighted!</p>,
    examples: [
      "Explain what this code does",
      "What could be improved here?",
    ]
  },
  {
    title: <h3>Inline Code Editing (<kbd>{getMetaKeyAndShortcutLabel()}</kbd>+<kbd>I</kbd>)</h3>,
    description: <p>Now let's try inline editing... Highlight a function in full, and press <kbd className="text-base">{getMetaKeyAndShortcutLabel()}</kbd>+<kbd>I</kbd>.</p>,
  },
  {
    title: <h3>Inline Code Editing (<kbd>{getMetaKeyAndShortcutLabel()}</kbd>+<kbd>I</kbd>)</h3>,
description: <p>Ask it to edit your code. Then after the changes appear, you can:<ul className="list-disc marker:text-foreground" >
                                                                <li>accept all changes with <kbd>{getMetaKeyAndShortcutLabel()}+SHIFT+ENTER</kbd>,</li>
                                                                <li>or reject all changes with <kbd>{getMetaKeyAndShortcutLabel()}+SHIFT+BACKSPACE</kbd></li>
                                                              </ul></p>,
    examples: [
      "Add error handling",
      "Add comments",
      "Add print statements",
      "Improve this code"
    ]
  },
  {
    title: <h3>Codebase Context (<kbd>{getMetaKeyAndShortcutLabel()}</kbd>+<kbd>ENTER</kbd>)</h3>,
    description: <p >Almost done! Try asking something about your codebase, then press <kbd>{getMetaKeyAndShortcutLabel()}</kbd>+<kbd>ENTER</kbd> to perform a prompt with codebase context.<br/><br/> Note: codebase indexing must finish before you can run this!</p>,
    examples: [
      "What does my codebase do",
      "Generate me documentation for my codebase",
      "Where can I find functions about X"
    ]
  },
  {
    title: <h3>Toggle PearAI Inventory</h3>,
    description: <p>Lastly, press <kbd>{getMetaKeyAndShortcutLabel()}</kbd>+<kbd>E</kbd> to toggle <b>PearAI inventory</b>, try out <strong>Creator</strong> and <strong>Search</strong> directly in there! <br/><br/>Enjoy PearAI! If you have questions, feel free to ask us in our <a href="https://discord.gg/7QMraJUsQt">Discord</a> or through <a href="mailto:pear@trypear.ai">email</a>.</p>,
  },
];

export default OnboardingTutorial;
