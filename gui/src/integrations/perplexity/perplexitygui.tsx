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
import { useNavigate } from "react-router-dom";
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
import { RootState } from "../../redux/store";
import {
  getMetaKeyLabel,
  isJetBrains,
  isMetaEquivalentKeyPressed,
} from "../../util";
import { FREE_TRIAL_LIMIT_REQUESTS } from "../../util/freeTrial";
import { getLocalStorage, setLocalStorage } from "../../util/localStorage";
import { isBareChatMode, isPerplexityMode } from "../../util/bareChatMode";
import { Badge } from "../../components/ui/badge";
import {
  TopGuiDiv,
  StopButton,
  StepsDiv,
  NewSessionButton,
  fallbackRender,
  TopGuiDivContainer,
  ContinueInputBoxContainer,
  ScrollToBottomButton,
} from "../../pages/gui";
import {
  createManualScrollHandler,
  createScrollHandler,
  scrollElementToBottom,
} from "../../lib/scrollUtils";
import { useScrollBehavior } from "@/hooks/useScrollBehavior";

function PerplexityGUI() {
  const posthog = usePostHog();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const ideMessenger = useContext(IdeMessengerContext);
  const isBetaAccess = useSelector(
    (state: RootState) => state.state.config.isBetaAccess,
  );

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

  const handleScroll = createScrollHandler(
    topGuiDivRef,
    setIsAtBottom,
    isAtBottom,
  );

  const handleManualScroll = createManualScrollHandler(
    topGuiDivRef,
    setIsAtBottom,
  );

  const bareChatMode = isBareChatMode();

  const onCloseTutorialCard = () => {
    posthog.capture("closedTutorialCard");
    setLocalStorage("showTutorialCard", false);
    setShowTutorialCard(false);
  };

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

      scrollElementToBottom(topGuiDivRef, {
        isInventoryMode: true,
        isActive: active,
        onScrollComplete: () => setIsAtBottom(true),
      });

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
      scrollElementToBottom,
      active,
    ],
  );

  const { saveSession, getLastSessionId, loadLastSession, loadMostRecentChat } =
    useHistory(dispatch);

  useWebviewListener(
    "newSession",
    async () => {
      saveSession();
      mainTextInputRef.current?.focus?.();
      scrollElementToBottom(topGuiDivRef, {
        isInventoryMode: true,
        isActive: active,
        onScrollComplete: () => setIsAtBottom(true),
      });
    },
    [saveSession],
  );

  useWebviewListener(
    "loadMostRecentChat",
    async () => {
      await loadMostRecentChat();
      mainTextInputRef.current?.focus?.();
      scrollElementToBottom(topGuiDivRef, {
        isInventoryMode: true,
        isActive: active,
        onScrollComplete: () => setIsAtBottom(true),
      });
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

  useScrollBehavior({
    divRef: topGuiDivRef,
    active,
    isAtBottom,
    setIsAtBottom,
    isInventoryMode: true,
  });

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

  return (
    <TopGuiDivContainer>
      <TopGuiDiv
        ref={topGuiDivRef}
        onScroll={handleScroll}
        onWheel={handleManualScroll}
        onTouchMove={handleManualScroll}
        isAiderOrPerplexity={true}
      >
        <div className="mx-2">
          <div className="pl-2 mt-8 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold mb-2">PearAI Search</h1>{" "}
              <Badge variant="outline" className="pl-0">
                (Powered by Perplexity)
              </Badge>
            </div>
            <p className="text-sm text-gray-400 mt-0">
              Ask for anything. We'll retrieve the most up to date information
              in real-time and summarize it for you.
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
                        scrollElementToBottom(topGuiDivRef, {
                          isInventoryMode: true,
                          isActive: active,
                          onScrollComplete: () => setIsAtBottom(true),
                        });
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
                          <ChatBubbleOvalLeftIcon width="16px" height="16px" />
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
                            item.promptLogs?.[0]?.completionOptions?.model ?? ""
                          }
                        />
                      </TimelineItem>
                    </div>
                  )}
                </ErrorBoundary>
              </Fragment>
            ))}
          </StepsDiv>
          {!isAtBottom && (
            <ScrollToBottomButton
              onClick={() =>
                scrollElementToBottom(topGuiDivRef, {
                  isInventoryMode: true,
                  isActive: active,
                  onScrollComplete: () => setIsAtBottom(true),
                })
              }
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
            ></ContinueInputBox>
          </ContinueInputBoxContainer>
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
                {!bareChatMode &&
                  ` (${getMetaKeyLabel()} ${isJetBrains() ? "J" : "L"})`}
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
}

export default PerplexityGUI;
