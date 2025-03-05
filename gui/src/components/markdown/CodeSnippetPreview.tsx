import {
  ChevronDownIcon,
  ChevronUpIcon,
  CodeBracketIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { ContextItemWithId } from "core";
import { getMarkdownLanguageTagForFile } from "core/util";
import React, { useContext } from "react";
import styled from "styled-components";
import { defaultBorderRadius, lightGray, vscBackground, vscEditorBackground } from "..";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import HeaderButtonWithText from "../HeaderButtonWithText";
import StyledMarkdownPreview from "./StyledMarkdownPreview";

const PreviewMarkdownDiv = styled.div<{
  borderColor?: string;
}>`
  background-color: ${vscEditorBackground};
  border-radius: ${defaultBorderRadius};
  border: 1.5px solid #2A3238;
  overflow: hidden;
  position: relative;
  code {
    font-size: 0.9em;
    line-height: 0;
    white-space: pre;
  }
  & div {
    background-color: ${vscBackground};
		user-select: text;
  }
`;

const PreviewMarkdownHeader = styled.div`
  padding: 3px;
  border-radius: ${defaultBorderRadius};
  word-break: break-all;
  display: flex;
  align-items: center;
`;

interface CodeSnippetPreviewProps {
  item: ContextItemWithId;
  onDelete?: () => void;
  onEdit?: () => void;
  borderColor?: string;
  editing?: boolean;
}
const MAX_PREVIEW_HEIGHT = 180;

// Pre-compile the regular expression outside of the function
const backticksRegex = /`{3,}/gm;

function CodeSnippetPreview(props: CodeSnippetPreviewProps) {
  const ideMessenger = useContext(IdeMessengerContext);

  const [collapsed, setCollapsed] = React.useState(true);
  const [hovered, setHovered] = React.useState(false);

  const fence = React.useMemo(() => {
    const backticks = props.item.content.match(backticksRegex);
    return backticks ? backticks.sort().at(-1) + "`" : "```";
  }, [props.item.content]);

  const codeBlockRef = React.useRef<HTMLDivElement>(null);
  const codeBlockHeight = `${Math.min(
    MAX_PREVIEW_HEIGHT,
    codeBlockRef.current?.scrollHeight ??
      // Best estimate of height I currently could find
      props.item.content.split("\n").length * 18 + 36,
  )}px`;

  return (
    <PreviewMarkdownDiv
      spellCheck={false}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      borderColor={props.borderColor}
    >
      <PreviewMarkdownHeader
        className="flex justify-between cursor-pointer"
        onClick={() => {
          if (props.item.id.providerTitle === "file") {
            ideMessenger.post("showFile", {
              filepath: props.item.description,
            });
          } else if (props.item.id.providerTitle === "code") {
            const lines = props.item.name
              .split("(")[1]
              .split(")")[0]
              .split("-");
            ideMessenger.ide.showLines(
              props.item.description,
              parseInt(lines[0]) - 1,
              parseInt(lines[1]) - 1,
            );
          } else {
            ideMessenger.post("showVirtualFile", {
              name: props.item.name,
              content: props.item.content,
            });
          }
        }}
      >

				<CodeBracketIcon className="h-4 w-4 stroke-2 pl-1" style={{ color: lightGray}}/>
        <div className="flex p-1 pl-2 gap-1 rounded-[4px] items-center" style={{ backgroundColor: vscEditorBackground}}>
				{/* <FileIcon
            height="20px"
            width="20px"
            filename={props.item.name}
          ></FileIcon> */}
          {props.item.id.providerTitle === "code" && props.item.name.includes("(") && (
  					<span className="text-input-foreground">
    					{props.item.name.split("(")[1]?.split(")")?.at(0) || ""}
  					</span>
					)}
					<span className="font-[500]" style={{ color: lightGray}}>
  					{props.item.id.providerTitle === "code"
    					? (props.item.name.includes("(") ? props.item.name.split("(")[0] : props.item.name)
    					: props.item.name
  					}
					</span>
          {/* {props.onEdit && (
            <HeaderButtonWithText
              text="Edit"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                props.onEdit();
              }}
              {...(props.editing && { color: "#f0f4" })}
            >
              <PaintBrushIcon width="1.1em" height="1.1em" />
            </HeaderButtonWithText>
          )} */}
          <HeaderButtonWithText
            text="Delete"
            onClick={(e) => {
              e.stopPropagation();
              props.onDelete();
            }}
          >
            <TrashIcon className="h-3.5 w-3.5 stroke-2 stroke-[#D23782]" />
          </HeaderButtonWithText>
        </div>
      </PreviewMarkdownHeader>

      <div
        contentEditable={false}
        className="-mt-3"
        ref={codeBlockRef}
        style={{
          height: collapsed ? codeBlockHeight : undefined,
          overflow: collapsed ? "hidden" : "auto",
        }}
      >
        <StyledMarkdownPreview
          source={`${fence}${props.item.language || getMarkdownLanguageTagForFile(
            props.item.description,
          )}\n${props.item.content.trimEnd()}\n${fence}`}
          showCodeBorder={false}
					isCodeSnippet={true}
        />
      </div>

      {codeBlockRef.current?.scrollHeight > MAX_PREVIEW_HEIGHT && (
        <HeaderButtonWithText
          className="bottom-1 right-1 absolute"
          text={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? (
            <ChevronDownIcon
              className="h-4 w-4 stroke-2"
              onClick={() => setCollapsed(false)}
            />
          ) : (
            <ChevronUpIcon
              className="h-4 w-4 stroke-2"
              onClick={() => setCollapsed(true)}
            />
          )}
        </HeaderButtonWithText>
      )}
    </PreviewMarkdownDiv>
  );
}

export default CodeSnippetPreview;
