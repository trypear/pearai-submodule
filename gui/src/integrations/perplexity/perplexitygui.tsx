import {
    ArrowLeftIcon,
    ChatBubbleOvalLeftIcon,
    CodeBracketSquareIcon,
    ExclamationTriangleIcon,
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
  } from "../../components";
  import { ChatScrollAnchor } from "../../components/ChatScrollAnchor";
  import StepContainer from "../../components/gui/StepContainer";
  import TimelineItem from "../../components/gui/TimelineItem";
  import ContinueInputBox from "../../components/mainInput/ContinueInputBox";
  import { defaultInputModifiers } from "../../components/mainInput/inputModifiers";
  import { TutorialCard } from "../../components/mainInput/TutorialCard";
  import { IdeMessengerContext } from "../../context/IdeMessenger";
  import useChatHandler from "../../hooks/useChatHandler";
  import useHistory from "../../hooks/useHistory";
  import { useWebviewListener } from "../../hooks/useWebviewListener";
  import { defaultModelSelector } from "../../redux/selectors/modelSelectors";
  import {
    clearLastResponse,
    deleteMessage,
    newSession,
    setInactive,
  } from "../../redux/slices/stateSlice";
  import {
    setDialogEntryOn,
    setDialogMessage,
    setShowDialog,
  } from "../../redux/slices/uiStateSlice";
  import { RootState } from "../../redux/store";
  import {
    getFontSize,
    getMetaKeyLabel,
    isJetBrains,
    isMetaEquivalentKeyPressed,
  } from "../../util";
  import { FREE_TRIAL_LIMIT_REQUESTS } from "../../util/freeTrial";
  import { getLocalStorage, setLocalStorage } from "../../util/localStorage";
  import { isBareChatMode, isPerplexityMode } from '../../util/bareChatMode';
  import { Badge } from "../../components/ui/badge";

  const TopGuiDiv = styled.div`
  overflow-y: scroll;

  scrollbar-width: none; /* Firefox */

  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }

  height: 100%;
`;

const StopButton = styled.div`
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
`;

const StepsDiv = styled.div`
  padding-bottom: 8px;
  position: relative;
  background-color: transparent;

  & > * {
    position: relative;
  }

  // Gray, vertical line on the left ("thread")
  // &::before {
  //   content: "";
  //   position: absolute;
  //   height: calc(100% - 12px);
  //   border-left: 2px solid ${lightGray};
  //   left: 28px;
  //   z-index: 0;
  //   bottom: 12px;
  // }

  .thread-message {
    margin: 16px 8px 0 8px;
  }
  .thread-message:not(:first-child) {
    border-top: 1px solid ${lightGray}22;
  }
`;

const NewSessionButton = styled.div`
  width: fit-content;
  margin-right: auto;
  margin-left: 6px;
  margin-top: 2px;
  margin-bottom: 8px;
  font-size: ${getFontSize() - 2}px;

  border-radius: ${defaultBorderRadius};
  padding: 2px 6px;
  color: ${lightGray};

  &:hover {
    background-color: ${lightGray}33;
    color: ${vscForeground};
  }

  cursor: pointer;
`;

const ThreadHead = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 18px 6px 0 6px;
`;

const THREAD_AVATAR_SIZE = 15;

const ThreadAvatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(248, 248, 248, 0.75);
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(136, 136, 136, 0.3);
`;

const ThreadUserTitle = styled.div`
  text-transform: capitalize;
  font-weight: 500;
  margin-bottom: 2px;
`;

const ThreadUserName = styled.div`
  font-size: ${getFontSize() - 3}px;
  color: ${lightGray};
`;



  // Styled components remain the same...
  // (Include all the styled components from the original file)

  function fallbackRender({ error, resetErrorBoundary }) {
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

  function PerplexityGUI() {
    const posthog = usePostHog();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const ideMessenger = useContext(IdeMessengerContext);
    const isBetaAccess = useSelector((state: RootState) => state.state.config.isBetaAccess);

    const sessionState = useSelector((state: RootState) => state.state);
    const defaultModel = useSelector(defaultModelSelector);
    const active = useSelector((state: RootState) => state.state.active);
    const [stepsOpen, setStepsOpen] = useState<(boolean | undefined)[]>([]);
    const mainTextInputRef = useRef<HTMLInputElement>(null);
    const topGuiDivRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState<boolean>(false);
    const state = useSelector((state: RootState) => state.state);
    const [showTutorialCard, setShowTutorialCard] = useState<boolean>(
      getLocalStorage("showTutorialCard"),
    );

    const bareChatMode = isBareChatMode();

    const onCloseTutorialCard = () => {
      posthog.capture("closedTutorialCard");
      setLocalStorage("showTutorialCard", false);
      setShowTutorialCard(false);
    };

    const handleScroll = () => {
      const OFFSET_HERUISTIC = 300;
      if (!topGuiDivRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = topGuiDivRef.current;
      const atBottom =
        scrollHeight - clientHeight <= scrollTop + OFFSET_HERUISTIC;

      setIsAtBottom(atBottom);
    };

    useEffect(() => {
      if (!active || !topGuiDivRef.current) return;

      const scrollAreaElement = topGuiDivRef.current;
      scrollAreaElement.scrollTop =
        scrollAreaElement.scrollHeight - scrollAreaElement.clientHeight;

      setIsAtBottom(true);
    }, [active]);

    useEffect(() => {
      const timeoutId = setTimeout(() => {
        window.scrollTo({
          top: topGuiDivRef.current?.scrollHeight,
          behavior: "instant" as any,
        });
      }, 1);

      return () => {
        clearTimeout(timeoutId)
        window.removeEventListener("scroll", handleScroll);
      };
    }, [topGuiDivRef.current]);

    useEffect(() => {
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

    const { streamResponse } = useChatHandler(dispatch, ideMessenger);

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
      ],
    );

    const { saveSession, getLastSessionId, loadLastSession, loadMostRecentChat } =
      useHistory(dispatch);

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

    return (
      <>
        <TopGuiDiv ref={topGuiDivRef} onScroll={handleScroll}>
            <div className="mx-2">
              <div className="pl-2 mt-8 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold mb-2">PearAI Search</h1>{" "}
                  <Badge variant="outline" className="pl-0">
                    (Powered by Perplexity)
                  </Badge>
                </div>
                <p className="text-sm text-gray-400 mt-0">
                  Ask for anything. We'll retrieve the most up to date information in real-time and summarize it for you.
                </p>
              </div>
              <StepsDiv>
                {state.history.map((item, index: number) => (
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
                          }}
                          isLastUserInput={isLastUserInput(index)}
                          isMainInput={false}
                          editorState={item.editorState}
                          contextItems={item.contextItems}
                        ></ContinueInputBox>
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
                ))}
              </StepsDiv>
              <ContinueInputBox
                onEnter={(editorContent, modifiers) => {
                  sendInput(editorContent, modifiers);
                }}
                isLastUserInput={false}
                isMainInput={true}
                hidden={active}
              ></ContinueInputBox>
              {active ? (
                <>
                  <br />
                  <br />
                </>
              ) : state.history.length > 0 ? (
                <div className="mt-2">
                  <NewSessionButton
                    onClick={() => {
                      saveSession();
                    }}
                    className="mr-auto"
                  >
                    New Session
                    {!bareChatMode && ` (${getMetaKeyLabel()} ${isJetBrains() ? "J" : "L"})`}
                  </NewSessionButton>
                </div>
              ) : (
                <>
                  {getLastSessionId() ? (
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
                  {!!showTutorialCard && !bareChatMode && (
                    <div className="flex justify-center w-full">
                      <TutorialCard onClose={onCloseTutorialCard} />
                    </div>
                  )}
                </>
              )}
            </div>
            <ChatScrollAnchor
              scrollAreaRef={topGuiDivRef}
              isAtBottom={isAtBottom}
              trackVisibility={active}
            />
        </TopGuiDiv>
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
            }}
          >
            {getMetaKeyLabel()} ⌫ Cancel
          </StopButton>
        )}
        {isBetaAccess &&
          <NewSessionButton onClick={() => navigate("/inventory")} style={{marginLeft: "0.8rem", marginBottom: "0rem"}} >Inventory</NewSessionButton>
        }
      </>
    );
  }

  export default PerplexityGUI;
