import {
  ArrowLeftEndOnRectangleIcon,
  CheckIcon,
  PlayIcon,
  BoltIcon,
  XMarkIcon,
	CodeBracketIcon,
} from "@heroicons/react/24/outline";
import { useContext, useState } from "react";
import styled from "styled-components";
import { vscBackground, vscEditorBackground } from "..";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { isJetBrains } from "../../util";
import HeaderButtonWithText from "../HeaderButtonWithText";
import { CopyButton } from "./CopyButton";
import { isPerplexityMode } from '../../util/modes';
import { useWebviewListener } from "../../hooks/useWebviewListener";
import { Loader, Terminal } from "lucide-react";

const SecondDiv = styled.div<{ bottom: boolean }>`
  display: flex;
  padding: 2px;
  gap: 4px;
  border-radius: 4px;
  background-color: ${vscBackground};
`;

interface CodeBlockToolBarProps {
  text: string;
  bottom: boolean;
  language: string | undefined;
  source?: 'perplexity' | 'continue';
}

const terminalLanguages = ["bash", "sh"];
const commonTerminalCommands = [
  "npm",
  "pnpm",
  "yarn",
  "bun",
  "deno",
  "npx",
  "cd",
  "ls",
  "pwd",
  "pip",
  "python",
  "node",
  "git",
  "curl",
  "wget",
  "rbenv",
  "gem",
  "ruby",
  "bundle",
];
function isTerminalCodeBlock(language: string | undefined, text: string) {
  return (
    terminalLanguages.includes(language) ||
    ((!language || language?.length === 0) &&
      (text.trim().split("\n").length === 1 ||
        commonTerminalCommands.some((c) => text.trim().startsWith(c))))
  );
}

function CodeBlockToolBar(props: CodeBlockToolBarProps) {
  const ideMessenger = useContext(IdeMessengerContext);

  const [copied, setCopied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [fastApplying, setFastApplying] = useState(false);
  const [isDiffVisible, setIsDiffVisible] = useState(false);
  const [isTerminalBlock, setIsTerminalBlock] = useState(isTerminalCodeBlock(props.language, props.text));

  useWebviewListener("setRelaceDiffState", (state) => {
    if (state.diffVisible) {
      setIsDiffVisible(true);
    } else {
      setIsDiffVisible(false);
      setFastApplying(false);
    }
    return Promise.resolve();
  });

  return (
    <div className="flex justify-between w-[calc(100%-8px)] items-center p-1 absolute">
			<div className="ml-1">
				<CodeBracketIcon className="w-4 h-4 stroke-2"></CodeBracketIcon>
			</div>
      <SecondDiv bottom={props.bottom || false}>
        {isPerplexityMode() && <HeaderButtonWithText
          text="Add to PearAI chat context"
          style={{ backgroundColor: vscEditorBackground }}
          onClick={() => {
            ideMessenger.post("addPerplexityContext", { text: props.text, language: props.language });
          }}
        >
          <ArrowLeftEndOnRectangleIcon className="w-4 h-4" />
        </HeaderButtonWithText>}
        {isJetBrains() || !isPerplexityMode() && (
          <>
            {!fastApplying && <HeaderButtonWithText
              text={
                isTerminalBlock
                  ? "Run in terminal"
                  : applying
                    ? "Applying..."
                    : "Apply to current file"
              }
              disabled={applying || fastApplying}
              onClick={() => {
                if (isTerminalBlock) {
                  let text = props.text;
                  if (text.startsWith("$ ")) {
                    text = text.slice(2);
                  }
                  ideMessenger.ide.runCommand(text);
                  return;
                }

                if (applying) return;
                ideMessenger.post("applyToCurrentFile", {
                  text: props.text,
                });
                setApplying(true);
                setTimeout(() => setApplying(false), 2000);
              }}
            >
              {applying ? (
                <CheckIcon className="w-4 h-4 text-green-500" />
              ) : (
                isTerminalBlock ? (
                  <Terminal className="w-4 h-4" />
                ) : (
                  <PlayIcon className="w-4 h-4" />
                )
              )}
            </HeaderButtonWithText>}

            {!isTerminalBlock && <>
              {!isDiffVisible ? (
                <>
                  <HeaderButtonWithText
                    text={fastApplying ? "Fast Applying..." : "Fast Apply"}
                    disabled={applying || fastApplying}
                    onClick={() => {
                      if (fastApplying) return;
                      ideMessenger.post("applyWithRelaceHorizontal", {
                        contentToApply: props.text,
                      });
                      setFastApplying(true);
                    }}
                  >
                    {fastApplying ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <BoltIcon className="w-4 h-4" />
                    )}
                  </HeaderButtonWithText>
                </>
              ) : (
                <>
                  <HeaderButtonWithText
                    text="Accept Changes"
                    onClick={() => {
                      ideMessenger.post("acceptRelaceDiff", undefined);
                    }}
                  >
                    <CheckIcon className="w-4 h-4 text-green-500" />
                  </HeaderButtonWithText>
                  <HeaderButtonWithText
                    text="Reject Changes"
                    onClick={() => {
                      ideMessenger.post("rejectRelaceDiff", undefined);
                      setIsDiffVisible(false);
                    }}
                  >
                    <XMarkIcon className="w-4 h-4 text-red-600" />
                  </HeaderButtonWithText>
                </>
              )}
            </>}
          </>
        )}
        {!isPerplexityMode() && <HeaderButtonWithText
          text="Insert at cursor"
          onClick={() => {
            ideMessenger.post("insertAtCursor", { text: props.text });
          }}
        >
          <ArrowLeftEndOnRectangleIcon className="w-4 h-4" />
        </HeaderButtonWithText>}
        <CopyButton text={props.text} />
      </SecondDiv>
    </div>
  );
}

export default CodeBlockToolBar;
