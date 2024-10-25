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
import { getFontSize } from "../../util";
import HeaderButtonWithText from "../HeaderButtonWithText";
import { CopyButton } from "../markdown/CopyButton";
import StyledMarkdownPreview from "../markdown/StyledMarkdownPreview";
import { isBareChatMode, isPerplexityMode } from "../../util/bareChatMode";

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
}

const ContentDiv = styled.div<{ isUserInput: boolean; fontSize?: number }>`
  padding: 4px 0px 8px 0px;
  background-color: ${(props) =>
    props.isUserInput ? vscInputBackground : vscBackground};
  font-size: ${(props) => props.fontSize || getFontSize()}px;
  border-radius: ${defaultBorderRadius};
  overflow: hidden;
`;

const MenuContainer = styled.div`
  display: flex;
  gap: 4px;
  position: absolute;
  bottom: -8px; // Adjust this value to create consistent spacing
  right: 0;
  z-index: 40;
  color: ${lightGray};
  font-size: ${getFontSize() - 3}px;
  padding-bottom: 8px;
  background-color: inherit;
`;

function StepContainer(props: StepContainerProps) {
  const isUserInput = props.item.message.role === "user";
  const active = useSelector((store: RootState) => store.state.active);
  const sessionId = useSelector((store: RootState) => store.state.sessionId);
  const ideMessenger = useContext(IdeMessengerContext);
  const bareChatMode = isBareChatMode();
  const isPerplexity = isPerplexityMode();

  const [isHovered, setIsHovered] = useState(false);
  const [feedback, setFeedback] = useState<boolean | undefined>(undefined);
  const [truncatedEarly, setTruncatedEarly] = useState(false);

  const sendFeedback = (feedback: boolean) => {
    setFeedback(feedback);
    if (props.item.promptLogs?.length) {
      for (const promptLog of props.item.promptLogs) {
        ideMessenger.post("devdata/log", {
          tableName: "chat",
          data: { ...promptLog, feedback, sessionId },
        });
      }
    }
  };

  const uiConfig = useUIConfig();

  useEffect(() => {
    if (!active) {
      const content = stripImages(props.item.message.content).trim();
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
  }, [props.item.message.content, active]);

  return (
    <div
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      <div className="relative">
        <ContentDiv
          hidden={!props.open}
          isUserInput={isUserInput}
          fontSize={getFontSize()}
        >
          {uiConfig?.displayRawMarkdown ? (
            <pre
              className="whitespace-pre-wrap break-words p-4 max-w-full overflow-x-auto"
              style={{ fontSize: getFontSize() - 2 }}
            >
              {stripImages(props.item.message.content)}
            </pre>
          ) : (
            <StyledMarkdownPreview
              source={stripImages(props.item.message.content)}
              showCodeBorder={true}
            />
          )}
        </ContentDiv>
        {!active && isPerplexity && (
          <HeaderButtonWithText
            onClick={() => {
              ideMessenger.post("addPerplexityContext", {
                text: stripImages(props.item.message.content),
                language: "",
              });
            }}
          >
            <ArrowLeftEndOnRectangleIcon className="w-4 h-4" />
            Add to PearAI chat context
          </HeaderButtonWithText>
        )}
        {(isHovered || typeof feedback !== "undefined") && !active && (
          <MenuContainer>
            {props.modelTitle && (
              <div className="flex items-center">
                <CubeIcon className="w-3 h-4 mr-1 flex-shrink-0" />
                {props.modelTitle}
                <div
                  style={{
                    backgroundColor: vscButtonBackground,
                    borderColor: vscButtonBackground,
                  }}
                  className="w-px h-full ml-3 mr-1"
                />
              </div>
            )}
            {truncatedEarly && !bareChatMode && (
              <HeaderButtonWithText
                text="Continue generation"
                onClick={(e) => {
                  props.onContinueGeneration();
                }}
              >
                <BarsArrowDownIcon
                  color={lightGray}
                  width="1.2em"
                  height="1.2em"
                />
              </HeaderButtonWithText>
            )}
            <CopyButton
              text={stripImages(props.item.message.content)}
              color={lightGray}
            />
            {!bareChatMode && (
              <HeaderButtonWithText
                text="Regenerate"
                onClick={(e) => {
                  props.onRetry();
                }}
              >
                <ArrowUturnLeftIcon
                  color={lightGray}
                  width="1.2em"
                  height="1.2em"
                />
              </HeaderButtonWithText>
            )}
            <HeaderButtonWithText 
              text="Delete Message"
              onClick={() => {
                props.onDelete();
              }}>
              <TrashIcon
                color={lightGray}
                width="1.2em"
                height="1.2em"
              />
            </HeaderButtonWithText>
          </MenuContainer>
        )}
      </div>
    </div>
  );
}

export default StepContainer;
