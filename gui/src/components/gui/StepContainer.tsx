import {
  ArrowLeftEndOnRectangleIcon,
  ArrowUturnLeftIcon,
  BarsArrowDownIcon,
  CubeIcon,
  HandThumbDownIcon,
  HandThumbUpIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { ChatHistoryItem } from "core";
import { stripImages } from "core/llm/images";
import { useContext, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import {
  defaultBorderRadius,
  lightGray,
  vscBackground,
  vscButtonBackground,
  vscEditorBackground,
  vscInputBackground,
} from "..";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import useUIConfig from "../../hooks/useUIConfig";
import { RootState } from "../../redux/store";
import { getMetaKeyLabel, getFontSize } from "../../util";
import HeaderButtonWithText from "../HeaderButtonWithText";
import { CopyButton } from "../markdown/CopyButton";
import StyledMarkdownPreview from "../markdown/StyledMarkdownPreview";
import { getModelImage } from "@/util/aibrandimages";

interface StepContainerProps {
  item: ChatHistoryItem;
  onReverse: () => void;
  onUserInput: (input: string) => void;
  onRetry: () => void;
  onContinueGeneration: () => void;
  onDelete: () => void;
  open: boolean;
  isFirst: boolean;
  isLast: boolean;
  index: number;
  modelTitle?: string;
  source?: "perplexity"| "continue";
}

const ContentDiv = styled.div<{ isUserInput: boolean; fontSize?: number }>`
  padding-left: 10px;
  padding-right: 10px;
  background-color: ${(props) =>
    props.isUserInput
      ? vscInputBackground
      : window.isPearOverlay
        ? "transparent"
        : vscBackground};
  font-size: ${(props) => props.fontSize || getFontSize()}px;
  border-radius: ${defaultBorderRadius};
	overflow:hidden;
`;

function StepContainer({
  item,
  onReverse,
  onUserInput,
  onRetry,
  onContinueGeneration,
  onDelete,
  open,
  isFirst,
  isLast,
  index,
  modelTitle,
  source = "continue",
}: StepContainerProps) {
  const isUserInput = item.message.role === "user";
  const active = source === "continue"
    ? useSelector((store: RootState) => store.state.active)
    : useSelector((store: RootState) => store.state.perplexityActive);
  const ideMessenger = useContext(IdeMessengerContext);
  const isPerplexity = source === "perplexity"

  const [numChanges, setNumChanges] = useState<number | null>(null);

  const [feedback, setFeedback] = useState<boolean | undefined>(undefined);

  const sessionId = useSelector((store: RootState) => store.state.sessionId);

  const sendFeedback = (feedback: boolean) => {
    setFeedback(feedback);
    if (item.promptLogs?.length) {
      for (const promptLog of item.promptLogs) {
        ideMessenger.post("devdata/log", {
          tableName: "chat",
          data: { ...promptLog, feedback, sessionId },
        });
      }
    }
  };

  const fetchNumberOfChanges = async () => {
    try {
      const response = await ideMessenger.request("getNumberOfChanges", undefined);
      if(typeof response === 'number') {
        setNumChanges(response);
      }
    } catch (error) {
      console.error("Failed to fetch number of changes:", error);
    }
  };

  const [truncatedEarly, setTruncatedEarly] = useState(false);

  const uiConfig = useUIConfig();

  useEffect(() => {
    if (!active) {
      const content = stripImages(item.message.content).trim();
      const endingPunctuation = [".", "?", "!", "```"];

      // If not ending in punctuation or emoji, we assume the response got truncated
      if (
        !(
          endingPunctuation.some((p) => content.endsWith(p)) ||
          /\p{Emoji}/u.test(content.slice(-2))
        )
      ) {
        setTruncatedEarly(true);
      } else {
        setTruncatedEarly(false);
      }
    }
  }, [item.message.content, active]);

  // Add effect to handle keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g' && isLast && !active) {
        if (isPerplexity) {
          ideMessenger.post("addPerplexityContext", {
            text: stripImages(item.message.content),
            language: "",
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isLast, active, isPerplexity, item.message.content, ideMessenger]);

  return (
      <div className="relative pb-[13px]">
        <ContentDiv
          className="max-w-4xl mx-auto"
          hidden={!open}
          isUserInput={isUserInput}
          fontSize={getFontSize()}
        >
          {uiConfig?.displayRawMarkdown ? (
            <pre
              className="whitespace-pre-wrap break-words p-4 max-w-full overflow-x-auto"
              style={{ fontSize: getFontSize() - 2 }}
            >
              {stripImages(item.message.content)}
            </pre>
          ) : (
            <StyledMarkdownPreview
              source={stripImages(item.message.content)}
              showCodeBorder={true}
              isStreaming={active}
              isLast={isLast}
              messageIndex={index}
              integrationSource={source}
              citations={isPerplexity ? item.citations : undefined}
            />
          )}

					{!active && (
          <div
            className="px-2 flex gap-1 justify-between mt-2"
            style={{
              color: lightGray,
              fontSize: getFontSize() - 3,
            }}
          >
            {modelTitle && (
              <div className="flex items-center font-[500]">
                {getModelImage(modelTitle) !== 'not found' ? (
                  <img
                    src={`${window.vscMediaUrl}/logos/${getModelImage(modelTitle)}`}
                    className="w-3.5 h-3.5 mr-2 object-contain rounded-sm"
                    alt={modelTitle}
                  />
                ) : (
                  <CubeIcon className="w-[14px] h-[14px] mr-1 stroke-2" />
                )}
                {modelTitle}
              </div>
            )}

						<div className="flex">
            {truncatedEarly && (
							<HeaderButtonWithText
                text="Continue generation"
                onClick={(e) => {
                  onContinueGeneration();
                }}
              >
                <BarsArrowDownIcon
                  color={lightGray}
                  width="0.875rem"
                  height="0.875rem"
									strokeWidth={2}
                />
              </HeaderButtonWithText>
            )}

            <CopyButton
              text={stripImages(item.message.content)}
              color={lightGray}
            />
            
            <HeaderButtonWithText
              text="Regenerate"
              onClick={(e) => {
                onRetry();
              }}
              >
              <ArrowUturnLeftIcon
                color={lightGray}
                width="0.875rem"
                height="0.875rem"
                strokeWidth={2}
              />
            </HeaderButtonWithText>
          
            <HeaderButtonWithText text="Delete Message">
              <TrashIcon
                color={lightGray}
                width="0.875rem"
								height="0.875rem"
								strokeWidth={2}
                onClick={() => {
									onDelete();
                }}
								/>
            </HeaderButtonWithText>
								</div>
          </div>
        )}
        </ContentDiv>

        {!active && isPerplexity && (
          <HeaderButtonWithText
            onClick={() => {
              ideMessenger.post("addPerplexityContext", {
                text: stripImages(item.message.content),
                language: "",
              });
            }}
          >
            <ArrowLeftEndOnRectangleIcon className="w-4 h-4" />
            Add to PearAI chat context {isLast && <span className="ml-1 text-xs opacity-60"><kbd className="font-mono">{getMetaKeyLabel()}</kbd> <kbd className="font-mono bg-vscButtonBackground/10 px-1">G</kbd></span>}
          </HeaderButtonWithText>
        )}
      </div>
  );
}

export default StepContainer;
