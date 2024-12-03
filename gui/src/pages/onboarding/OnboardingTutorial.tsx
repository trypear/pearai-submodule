import {
  vscBackground,
  vscForeground,
  vscInputBorderFocus,
} from "@/components";
import DelayedMessage from "@/components/DelayedMessage";
import CopyButtonWithText from "@/components/markdown/CopyButtonWithText";
import { Button } from "@/components/ui/button";
import { setLocalStorage } from "@/util/localStorage";
import { IdeMessengerContext } from "@/context/IdeMessenger";
import useHistory from "@/hooks/useHistory";
import { useWebviewListener } from "@/hooks/useWebviewListener";
import { getMetaKeyAndShortcutLabel } from "@/util";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Lightbulb,
  X,
} from "lucide-react";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import { CardFooter } from "@/components/ui/card";

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
  margin: 0 1rem;
  background: repeating-linear-gradient(
    101.79deg,
    #4da587 0%,
    #4da677 10%,
    #3e9467 20%,
    #4da587 30%,
    #3e9467 40%,
    #4da587 50%,
    #3e9467 60%,
    #4da587 70%,
    #3e9467 80%,
    #4da587 90%,
    #4da587 100%
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
  min-width: 250px;
  position: relative;
  max-height: 30rem;
  box-shadow:
    0 8px 16px rgba(0, 0, 0, 0.2),
    0 4px 4px rgba(0, 0, 0, 0.15),
    0 0 1px rgba(255, 255, 255, 0.1) inset;
  display: flex;
  flex-direction: column;
`;

const ContentWrapper = styled(motion.div)<{ direction: "left" | "right" }>`
  opacity: 0;
  margin-top: 0.5rem;
  border-top: 1px solid ${vscInputBorderFocus};
  animation: slideIn 0.6s ease-out forwards;
  flex: 1;
`;

const ExamplesSection = styled.div`
  margin-top: 0.5rem;
  padding: 1rem;
  padding-top: 0.1rem;
  border-radius: 8px;
  background-color: ${vscBackground};
`;

const ExamplesHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.2rem;
`;

const Footer = styled(CardFooter)`
  // Add any additional styling for the footer if needed
`;

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  onClose,
  onExampleClick,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = 6; // Adjust based on your pages
  const [slideDirection, setSlideDirection] = useState<"left" | "right">(
    "right",
  );
  const ideMessenger = useContext(IdeMessengerContext);
  const dispatch = useDispatch();
  const { saveSession } = useHistory(dispatch, "continue");
  const [noCodeSelectedMsg, setNoCodeSelectedMsg] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const pages = [
    {
      title: (
        <h3>
          Select Code and Chat (<kbd>{getMetaKeyAndShortcutLabel()}</kbd>+
          <kbd>L</kbd>)
        </h3>
      ),
      description: (
        <p>
          Select few lines of code, and press{" "}
          <b>
            <kbd className="font-mono">{getMetaKeyAndShortcutLabel()}</kbd>{" "}
            <kbd className="font-mono">L</kbd>
          </b>{" "}
          to add it to this chat box context.
          <br />
          <br />
          <span>Don't have a file open?</span>
          <br />
          <span className="mt-2">
            {" "}
            Click here{" "}
            <kbd
              className="no-underline font-mono decoration-current hover:underline cursor-pointer font-bold"
              onClick={() => ideMessenger.post("showTutorial", undefined)}
            >
              pearai_tutorial.py
            </kbd>{" "}
            to open a sample file
          </span>
          {noCodeSelectedMsg && (
            <div className="mt-3 bg-input p-2 rounded mb-2">
              {"⚠️ Hey, seems you pressed the shortcut but did not select any code. try again by selecting some code."}
            </div>
          )}
        </p>
      ),
    },
    {
      description: (
        <>
          <p>
            Ask a question about the code you just Selected and added to the
            chat below!
          </p>
          <DelayedMessage
            message="Press the right arrow below for the next step."
            delay={10000}
          />
        </>
      ),
      examples: ["Explain what this code does", "What could be improved here?"],
    },
    {
      title: (
        <h3>
          Inline Code Editing (<kbd>{getMetaKeyAndShortcutLabel()}</kbd>+
          <kbd>I</kbd>)
        </h3>
      ),
      description: (
        <p>
          Now let's try inline editing. First select a function you want to
          edit, and then press shortcut key{" "}
          <b>
            <kbd className="font-mono">{getMetaKeyAndShortcutLabel()}</kbd>{" "}
            &nbsp;
            <kbd className="font-mono">I</kbd>
          </b>
          &nbsp; and then you can type the prompt to edit the code.
        </p>
      ),
      examples: ["Add error handling", "Improve this code"],
    },
    {
      title: (
        <h3>
          Inline Code Editing (<kbd>{getMetaKeyAndShortcutLabel()}</kbd>+
          <kbd>I</kbd>)
        </h3>
      ),
      description: (
        <p>
          After the changes appear, you can:
          <ul className="list-disc marker:text-foreground">
            <li>
              <b>
                accept all changes with{" "}
                <kbd className="font-mono">{getMetaKeyAndShortcutLabel()}</kbd>
                &nbsp;
                <kbd className="font-mono">SHIFT</kbd>&nbsp;
                <kbd className="font-mono">ENTER</kbd>&nbsp;
              </b>
            </li>
            <li>
              or{" "}
              <b>
                reject all changes with{" "}
                <kbd className="font-mono">{getMetaKeyAndShortcutLabel()}</kbd>
                &nbsp;
                <kbd className="font-mono">SHIFT</kbd>&nbsp;
                <kbd className="font-mono">BACKSPACE</kbd>&nbsp;
              </b>
            </li>
          </ul>
        </p>
      ),
    },
    {
      title: (
        <h3>
          Codebase Context (<kbd>{getMetaKeyAndShortcutLabel()}</kbd>+
          <kbd>ENTER</kbd>)
        </h3>
      ),
      description: (
        <>
          <p>
            Try asking anything about your entire codebase by typing in prompt then
            pressing{" "}
            <b>
              <kbd className="font-mono">{getMetaKeyAndShortcutLabel()}</kbd>
              &nbsp;<kbd className="font-mono">ENTER</kbd>
            </b>
          </p>
          <span>
            Note: codebase indexing must finish before you can run this! You can find the status at the very bottom of this sidebar.
          </span>
        </>
      ),
      examples: [
        "What does my codebase do",
        "How to implement a feature new-feature",
      ],
    },
    {
      title: <h3>Toggle PearAI Inventory</h3>,
      description: (
        <>
          <p>
            Lastly, press{" "}
            <b>
              <kbd className="font-mono">{getMetaKeyAndShortcutLabel()}</kbd>
              &nbsp;<kbd className="font-mono">E</kbd>
            </b>{" "}
            to toggle <b>PearAI Inventory</b>, and try out{" "}
            <strong>Creator</strong> and <strong>Search</strong> directly in
            there! <br />
            <br />
            If you have questions, feel free to ask us in our{" "}
            <a href="https://discord.gg/7QMraJUsQt">Discord</a>, or through{" "}
            <a href="mailto:pear@trypear.ai">email</a>.
          </p>
          Enjoy PearAI!
        </>
      ),
    },
  ];

  const nextPage = () => {
    setIsTransitioning(true);
    setSlideDirection("right");
    const nextPageNum = Math.min(currentPage + 1, pages.length - 1);
    setCurrentPage(nextPageNum);

    if (currentPage === 1) {
      saveSession();
    }

    setTimeout(() => setIsTransitioning(false), 600);
  };

  const prevPage = () => {
    setSlideDirection("left");
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const currentPageData = pages[currentPage];
  const hasExamples = Boolean(currentPageData.examples);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        nextPage();
      } else if (event.key === "ArrowLeft") {
        prevPage();
      }
    },
    [currentPage, nextPage, prevPage],
  );

  useWebviewListener(
    "highlightedCode",
    async (data) => {
      if (!data.rangeInFileWithContents.contents) {
        setNoCodeSelectedMsg(true);
        return;
      }
      if (currentPage === 0) {
        nextPage();
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
        await new Promise((resolve) => setTimeout(resolve, 100));
        ideMessenger.post("highlightElement", {
          elementSelectors: [".quick-input-widget"],
        });
        nextPage();
      }
    },
    [currentPage],
  );

  useWebviewListener(
    "acceptedOrRejectedDiff",
    async () => {
      if (currentPage === 3) {
        nextPage();
      }
    },
    [currentPage],
  );

  useWebviewListener(
    "navigateToInventoryHome",
    async () => {
      if (currentPage === pages.length - 1) {
        onClose();
      }
    },
    [currentPage, onClose, pages.length]
  );

  useWebviewListener(
    "toggleOverlay",
    async () => {
      if (currentPage === pages.length - 1) {
        onClose();
      }
    },
    [currentPage, onClose, pages.length]
  );

  useEffect(() => {
    if (currentPage === 3) {
      const handleEnterKey = (event: KeyboardEvent) => {
        if (event.key === "Enter") {
          nextPage();
        }
        if (
          ["Enter", "ArrowLeft", "ArrowRight", "Escape"].includes(event.key)
        ) {
          ideMessenger.post("unhighlightElement", {
            elementSelectors: [".quick-input-widget"],
          });
        }
      };

      window.addEventListener("keydown", handleEnterKey);

      // Cleanup function
      return () => {
        ideMessenger.post("unhighlightElement", {
          elementSelectors: [".quick-input-widget"],
        });
      };
    }
  }, [currentPage]); // Include all dependencies

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage]);

  return (
    <TutorialCardBorder>
      <TutorialCardDiv
        className={`flex flex-col p-4 justify-between bg-background text-sm overflow-hidden text-input-foreground`}
      >
        <div className="mb-3">
          <div
            onClick={onClose}
            className="absolute underline top-2 rounded-full right-2 p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full cursor-pointer shadow-sm"
            role="button"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </div>
          <div className="flex flex-col justify-between mt-1">
            <div>
              <h2 className="text-lg font-semibold tracking-tight mb-0">
                Learn how to use PearAI chat
              </h2>

              <ContentWrapper
                direction={slideDirection}
                key={currentPage}
                initial={{
                  x: slideDirection === "right" ? 100 : -100,
                  opacity: 0,
                }}
                animate={{ x: 0, opacity: 1 }}
                exit={{
                  x: slideDirection === "right" ? -100 : 100,
                  opacity: 0,
                }}
                transition={{ duration: 0.6 }}
              >
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.1 }}
                >
                  {currentPageData.description}
                </motion.span>
                {hasExamples && (
                  <ExamplesSection>
                    <ExamplesHeader>
                      <Lightbulb size={13} />
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium">
                          Try these examples prompts
                        </h3>
                      </div>
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
                    <div className="text-xs mt-3">copy prompts by clicking them</div>
                  </ExamplesSection>
                )}
              </ContentWrapper>
            </div>
          </div>
        </div>
        <CardFooter className="flex items-center justify-between pt-3 select-none">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary"
            onClick={prevPage}
            disabled={currentPage === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Previous</span>
          </Button>
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-white/70"
          >
            {currentPage + 1} / {totalPages}
          </motion.div>
          <Button
            variant="default"
            size="sm"
            className="bg-button"
            onClick={currentPage === totalPages - 1 ? onClose : nextPage}
          >
            <span className="mr-2">
              {currentPage === totalPages - 1 ? "Finish" : "Next"}
            </span>
            {currentPage === totalPages - 1 ? (
              <Check className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </Button>
        </CardFooter>{" "}
      </TutorialCardDiv>
    </TutorialCardBorder>
  );
};

export default OnboardingTutorial;
