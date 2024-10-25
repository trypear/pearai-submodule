import {
  ArrowLeftIcon,
  ChatBubbleOvalLeftIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { JSONContent } from "@tiptap/react";
import { InputModifiers } from "core";
import { usePostHog } from "posthog-js/react";
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  Button,
  defaultBorderRadius,
  lightGray,
  vscBackground,
  vscForeground,
} from "../components";
import StepContainer from "../components/gui/StepContainer";
import TimelineItem from "../components/gui/TimelineItem";
import ContinueInputBox from "../components/mainInput/ContinueInputBox";
import { defaultInputModifiers } from "../components/mainInput/inputModifiers";
import { TutorialCard } from "../components/mainInput/TutorialCard";
import { IdeMessengerContext } from "../context/IdeMessenger";
import useChatHandler from "../hooks/useChatHandler";
import useHistory from "../hooks/useHistory";
import { useWebviewListener } from "../hooks/useWebviewListener";
import { defaultModelSelector } from "../redux/selectors/modelSelectors";
import {
  clearLastResponse,
  deleteMessage,
  newSession,
  setInactive,
} from "../redux/slices/stateSlice";

import { RootState } from "../redux/store";
import {
  getFontSize,
  getMetaKeyLabel,
  isJetBrains,
  isMetaEquivalentKeyPressed,
} from "../util";
import { FREE_TRIAL_LIMIT_REQUESTS } from "../util/freeTrial";
import { getLocalStorage, setLocalStorage } from "../util/localStorage";
import { isBareChatMode, isPerplexityMode } from "../util/bareChatMode";
import { Badge } from "../components/ui/badge";
import { FOOTER_HEIGHT, HEADER_HEIGHT } from "@/components/Layout";

export const TopGuiDiv = styled.div<{ isAiderOrPerplexity?: boolean }>`
  overflow-y: auto;
  flex: 1;
  height: ${(props) =>
    props.isAiderOrPerplexity
      ? `calc(100vh - ${HEADER_HEIGHT})`
      : `calc(100vh - ${HEADER_HEIGHT} - ${FOOTER_HEIGHT})`};
  display: flex;
  flex-direction: column;
`;

export const StopButton = styled.div`
  width: fit-content;
  margin-right: auto;
  margin-left: auto;
  font-size: ${getFontSize() - 2}px;
  border: 0.5px solid ${lightGray};
  border-radius: ${defaultBorderRadius};
  padding: 4px 8px;
  background: ${vscBackground};
  z-index: 50;
  color: var(--vscode-textPreformat-foreground);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

export const StepsDiv = styled.div`
  padding-bottom: 8px;
  position: relative;
  background-color: transparent;

  & > * {
    position: relative;
  }

  .thread-message {
    margin: 16px 8px 0 8px;
  }
  .thread-message:not(:first-child) {
    border-top: 1px solid ${lightGray}22;
  }
`;

export const TopGuiDivContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto; // Changed from overflow: hidden

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${lightGray}44;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: ${lightGray}88;
  }
`;

export const ContinueInputBoxContainer = styled.div`
  position: sticky;
  bottom: 0;
  z-index: 50;
  background-color: inherit;
  box-shadow: 0 -8px 16px -8px rgba(0, 0, 0, 0.3);
  margin-top: -8px; // Keep the negative margin
`;

export const NewSessionButton = styled.div`
  width: fit-content;
  margin: 2px auto 8px 6px;
  font-size: ${getFontSize() - 2}px;
  border-radius: ${defaultBorderRadius};
  padding: 2px 6px;
  color: ${lightGray};
  cursor: pointer;

  &:hover {
    background-color: ${lightGray}33;
    color: ${vscForeground};
  }
`;

export const ScrollToBottomButton = styled.button`
  position: sticky;
  bottom: 84px;
  margin-left: auto;
  margin-right: 16px;
  margin-bottom: 8px;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background: ${vscBackground};
  border: 1px solid ${lightGray}44;
  color: ${lightGray};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0.8;
  z-index: 51;

  &:hover {
    opacity: 1;
    background: ${lightGray}22;
  }
`;

export function fallbackRender({ error, resetErrorBoundary }) {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.
  return (
    <div
      role="alert"
      className="px-2"
      style={{ backgroundColor: vscBackground }}
    >
      <p>Something went wrong:</p>
      <pre style={{ color: "red" }}>{error.message}</pre>

      <div className="text-center">
        <Button onClick={resetErrorBoundary}>Restart</Button>
      </div>
    </div>
  );
}

const GUI = () => {
  const posthog = usePostHog();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const ideMessenger = useContext(IdeMessengerContext);
  const { streamResponse } = useChatHandler(dispatch, ideMessenger);
  const sessionState = useSelector((state: RootState) => state.state);
  const defaultModel = useSelector(defaultModelSelector);
  const active = useSelector((state: RootState) => state.state.active);
  const state = useSelector((state: RootState) => state.state);
  const isBetaAccess = useSelector(
    (state: RootState) => state.state.config.isBetaAccess,
  );
  const { saveSession, getLastSessionId, loadLastSession, loadMostRecentChat } =
    useHistory(dispatch);

  const mainTextInputRef = useRef<HTMLInputElement>(null);
  const topGuiDivRef = useRef<HTMLDivElement>(null);

  const [stepsOpen, setStepsOpen] = useState<(boolean | undefined)[]>([]);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(false);
  // AIDER HINT BUTTON HIDDEN IN V1.4.0
  const [showAiderHint, setShowAiderHint] = useState<boolean>(false);
  // Perplexity hint button hidden
  const [showPerplexityHint, setShowPerplexityHint] = useState<boolean>(false);
  const [showTutorialCard, setShowTutorialCard] = useState<boolean>(
    getLocalStorage("showTutorialCard"),
  );

  const bareChatMode = isBareChatMode();
  const aiderMode = location?.pathname === "/aiderMode";
  const perplexityMode = isPerplexityMode();

  const onCloseTutorialCard = () => {
    posthog.capture("closedTutorialCard");
    setLocalStorage("showTutorialCard", false);
    setShowTutorialCard(false);
  };

  const AiderBetaButton: React.FC = () => (
    <NewSessionButton
      onClick={() => {
        ideMessenger.post("aiderMode", undefined);
        setShowAiderHint(false);
      }}
      className="mr-auto py-2"
    >
      Hint: Try out PearAI Creator (Beta), powered by aider (Beta)!
    </NewSessionButton>
  );

  const PerplexityBetaButton: React.FC = () => (
    <NewSessionButton
      onClick={async () => {
        ideMessenger.post("perplexityMode", undefined);
        setShowPerplexityHint(false);
      }}
      className="mr-auto"
    >
      {perplexityMode
        ? "Exit Perplexity"
        : "Hint: Try out PearAI Search (Beta), powered by Perplexity."}
    </NewSessionButton>
  );

  const handleScroll = useCallback(() => {
    // Reduce the offset to make it more sensitive to user scrolling
    const OFFSET_HERUISTIC = 50;
    if (!topGuiDivRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = topGuiDivRef.current;
    const atBottom =
      scrollHeight - clientHeight <= scrollTop + OFFSET_HERUISTIC;

    // Add immediate state update when user scrolls up
    if (!atBottom) {
      setIsAtBottom(false);
    } else if (atBottom && !isAtBottom) {
      setIsAtBottom(true);
    }
  }, [isAtBottom]);

  const handleManualScroll = useCallback(() => {
    if (!topGuiDivRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = topGuiDivRef.current;

    if (scrollHeight - clientHeight - scrollTop > 50) {
      setIsAtBottom(false);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (!topGuiDivRef.current) return;

    requestAnimationFrame(() => {
      const scrollAreaElement = topGuiDivRef.current!;

      scrollAreaElement.scrollTop = scrollAreaElement.scrollHeight;
      setIsAtBottom(true);

      // For aider mode, keep checking scroll position
      if (aiderMode && !active) {
        let attempts = 0;

        const maxAttempts = 10;
        const checkScroll = () => {
          if (!topGuiDivRef.current || attempts >= maxAttempts) return;

          const currentHeight = topGuiDivRef.current.scrollHeight;
          topGuiDivRef.current.scrollTop = currentHeight;

          // If not at bottom, try again
          const isAtBottom =
            Math.abs(
              currentHeight -
                topGuiDivRef.current.clientHeight -
                topGuiDivRef.current.scrollTop,
            ) < 2;

          if (!isAtBottom) {
            attempts++;
            setTimeout(checkScroll, 50);
          }
        };

        setTimeout(checkScroll, 50);
      }
    });
  }, [aiderMode, active]);

  const sendInput = useCallback(
    (editorState: JSONContent, modifiers: InputModifiers) => {
      if (defaultModel?.provider === "free-trial") {
        const u = getLocalStorage("ftc");

        if (u) {
          setLocalStorage("ftc", u + 1);

          if (u >= FREE_TRIAL_LIMIT_REQUESTS) {
            navigate("/onboarding");
            posthog?.capture("ftc_reached");

            return;
          }
        } else {
          setLocalStorage("ftc", 1);
        }
      }

      streamResponse(editorState, modifiers, ideMessenger);
      scrollToBottom();

      const currentCount = getLocalStorage("mainTextEntryCounter");
      if (currentCount) {
        setLocalStorage("mainTextEntryCounter", currentCount + 1);
      } else {
        setLocalStorage("mainTextEntryCounter", 1);
      }
    },
    [
      sessionState.history,
      sessionState.contextItems,
      defaultModel,
      state,
      streamResponse,
      scrollToBottom,
    ],
  );

  const isLastUserInput = useCallback(
    (index: number): boolean => {
      let foundLaterUserInput = false;
      for (let i = index + 1; i < state.history.length; i++) {
        if (state.history[i].message.role === "user") {
          foundLaterUserInput = true;
          break;
        }
      }
      return !foundLaterUserInput;
    },
    [state.history],
  );

  useWebviewListener(
    "newSession",
    async () => {
      saveSession();
      mainTextInputRef.current?.focus?.();
    },
    [saveSession],
  );

  useWebviewListener(
    "loadMostRecentChat",
    async () => {
      await loadMostRecentChat();
      mainTextInputRef.current?.focus?.();
    },
    [loadMostRecentChat],
  );

  useEffect(() => {
    if (!active || !topGuiDivRef.current) return;

    const scrollInterval = setInterval(() => {
      if (topGuiDivRef.current && isAtBottom) {
        scrollToBottom();
      }
    }, 100);

    return () => clearInterval(scrollInterval);
  }, [active, scrollToBottom, isAtBottom]);

  useEffect(() => {
    if (!topGuiDivRef.current) return;

    if (!active && isAtBottom) {
      // Only snap to bottom if user hadn't scrolled up
      const scrollAreaElement = topGuiDivRef.current;

      requestAnimationFrame(() => {
        scrollAreaElement.scrollTop = scrollAreaElement.scrollHeight;

        if (aiderMode) {
          // One more time after a brief delay for aider mode
          setTimeout(() => {
            if (scrollAreaElement) {
              scrollAreaElement.scrollTop = scrollAreaElement.scrollHeight;
            }
          }, 100);
        }
      });
    }
  }, [active, isAtBottom, aiderMode]);

  useEffect(() => {
    // Cmd + Backspace to delete current step
    const listener = (e: any) => {
      if (
        e.key === "Backspace" &&
        isMetaEquivalentKeyPressed(e) &&
        !e.shiftKey
      ) {
        dispatch(setInactive());
      }
    };
    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [active]);

  return (
    <TopGuiDivContainer>
      <TopGuiDiv
        ref={topGuiDivRef}
        onScroll={handleScroll}
        onWheel={handleManualScroll}
        onTouchMove={handleManualScroll}
        isAiderOrPerplexity={aiderMode || perplexityMode}
      >
        <div className="mx-2 flex-grow flex flex-col">
          {aiderMode && (
            <div className="pl-2 mt-8 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold mb-2">
                  PearAI Creator - Beta
                </h1>{" "}
                <Badge variant="outline" className="pl-0">
                  (Powered by{" "}
                  <a
                    href="https://aider.chat/2024/06/02/main-swe-bench.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline px-1"
                  >
                    aider)
                  </a>
                </Badge>
              </div>
              <p className="text-sm text-gray-400 mt-0">
                Ask for a feature, describe a bug, or ask for a change to your
                project. We'll take care of everything for you!
              </p>
            </div>
          )}
          {perplexityMode && (
            <div className="pl-2 mt-8 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold mb-2">
                  PearAI Search - Beta
                </h1>{" "}
                <Badge variant="outline" className="pl-0">
                  (Powered by Perplexity)
                </Badge>
              </div>
              <p className="text-sm text-gray-400 mt-0">
                Ask for anything. We'll retrieve the most up to date information
                in real-time and summarize it for you.
              </p>
            </div>
          )}
          <StepsDiv>
            {state.history.map((item, index: number) => {
              return (
                <Fragment key={index}>
                  <ErrorBoundary
                    FallbackComponent={fallbackRender}
                    onReset={() => {
                      dispatch(newSession());
                    }}
                  >
                    {item.message.role === "user" ? (
                      <ContinueInputBox
                        onEnter={async (editorState, modifiers) => {
                          streamResponse(
                            editorState,
                            modifiers,
                            ideMessenger,
                            index,
                          );
                          scrollToBottom();
                        }}
                        isLastUserInput={isLastUserInput(index)}
                        isMainInput={false}
                        editorState={item.editorState}
                        contextItems={item.contextItems}
                      />
                    ) : (
                      <div className="thread-message">
                        <TimelineItem
                          item={item}
                          iconElement={
                            <ChatBubbleOvalLeftIcon
                              width="16px"
                              height="16px"
                            />
                          }
                          open={
                            typeof stepsOpen[index] === "undefined"
                              ? true
                              : stepsOpen[index]!
                          }
                          onToggle={() => {}}
                        >
                          <StepContainer
                            index={index}
                            isLast={index === sessionState.history.length - 1}
                            isFirst={index === 0}
                            open={
                              typeof stepsOpen[index] === "undefined"
                                ? true
                                : stepsOpen[index]!
                            }
                            key={index}
                            onUserInput={(input: string) => {}}
                            item={item}
                            onReverse={() => {}}
                            onRetry={() => {
                              streamResponse(
                                state.history[index - 1].editorState,
                                state.history[index - 1].modifiers ??
                                  defaultInputModifiers,
                                ideMessenger,
                                index - 1,
                              );
                            }}
                            onContinueGeneration={() => {
                              window.postMessage(
                                {
                                  messageType: "userInput",
                                  data: {
                                    input: "Keep going.",
                                  },
                                },
                                "*",
                              );
                            }}
                            onDelete={() => {
                              dispatch(deleteMessage(index));
                            }}
                            modelTitle={
                              item.promptLogs?.[0]?.completionOptions?.model ??
                              ""
                            }
                          />
                        </TimelineItem>
                      </div>
                    )}
                  </ErrorBoundary>
                </Fragment>
              );
            })}
          </StepsDiv>
          {!isAtBottom && (
            <ScrollToBottomButton
              onClick={scrollToBottom}
              aria-label="Scroll to bottom"
            >
              <ChevronDownIcon width={16} height={16} />
            </ScrollToBottomButton>
          )}
          <ContinueInputBoxContainer>
            <ContinueInputBox
              onEnter={(editorContent, modifiers) => {
                sendInput(editorContent, modifiers);
              }}
              isLastUserInput={false}
              isMainInput={true}
              hidden={active}
            />
          </ContinueInputBoxContainer>
          {active ? (
            <>
              <br />
              <br />
            </>
          ) : state.history.length > 0 ? (
            <div className="mt-2">
              {aiderMode ? (
                <NewSessionButton
                  onClick={() => {
                    saveSession();
                    ideMessenger.post("aiderResetSession", undefined);
                  }}
                  className="mr-auto"
                >
                  Restart Session
                </NewSessionButton>
              ) : (
                <>
                  <NewSessionButton
                    onClick={() => {
                      saveSession();
                    }}
                    className="mr-auto"
                  >
                    New Session
                    {!bareChatMode &&
                      ` (${getMetaKeyLabel()} ${isJetBrains() ? "J" : "L"})`}
                  </NewSessionButton>
                  {!bareChatMode && !!showAiderHint && <AiderBetaButton />}
                </>
              )}
              {!perplexityMode && showPerplexityHint && (
                <PerplexityBetaButton />
              )}
            </div>
          ) : (
            <>
              {!aiderMode && getLastSessionId() ? (
                <div className="mt-2">
                  <NewSessionButton
                    onClick={async () => {
                      loadLastSession();
                    }}
                    className="mr-auto flex items-center gap-2"
                  >
                    <ArrowLeftIcon width="11px" height="11px" />
                    Last Session
                  </NewSessionButton>
                </div>
              ) : null}
              {!!showTutorialCard &&
                !bareChatMode &&
                !aiderMode &&
                !perplexityMode && (
                  <div className="flex justify-center w-full">
                    <TutorialCard onClose={onCloseTutorialCard} />
                  </div>
                )}
              {!aiderMode && !!showAiderHint && <AiderBetaButton />}
            </>
          )}
          {!perplexityMode && showPerplexityHint && <PerplexityBetaButton />}
        </div>
        {active && (
          <StopButton
            className="mt-auto mb-4 sticky bottom-4"
            onClick={() => {
              dispatch(setInactive());

              if (
                state.history[state.history.length - 1]?.message.content
                  .length === 0
              ) {
                dispatch(clearLastResponse());
              }
              if (aiderMode) {
                ideMessenger.post("aiderCtrlC", undefined);
              }
            }}
          >
            {getMetaKeyLabel()} ⌫ Cancel
          </StopButton>
        )}
      </TopGuiDiv>
      {isBetaAccess && (
        <NewSessionButton
          onClick={() => navigate("/inventory")}
          style={{ marginLeft: "0.8rem", marginBottom: "0rem" }}
        >
          Inventory
        </NewSessionButton>
      )}
    </TopGuiDivContainer>
  );
};

export default GUI;
