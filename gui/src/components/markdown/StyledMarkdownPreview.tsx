import React, { memo, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRemark } from "react-remark";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import styled from "styled-components";
import { visit } from "unist-util-visit";
import {
  defaultBorderRadius,
  vscBackground,
  vscEditorBackground,
  vscForeground,
} from "..";
import { RootState } from "../../redux/store";
import { getFontSize } from "../../util";
import LinkableCode from "./LinkableCode";
import PreWithToolbar from "./PreWithToolbar";
import { SyntaxHighlightedPre } from "./SyntaxHighlightedPre";
import "./katex.css";
import "./markdown.css";

const StyledMarkdown = styled.div<{
  fontSize?: number;
  showBorder?: boolean;
}>`
  pre {
    background-color: ${window.isPearOverlay ?  vscBackground : vscEditorBackground};
    border-radius: ${defaultBorderRadius};

    max-width: calc(100vw - 24px);
    overflow-x: scroll;
    overflow-y: hidden;

    ${(props) => {
      if (props.showBorder) {
        return `
          border: 0.5px solid #8888;
        `;
      }
    }}
    padding: 12px;
  }

  code {
    span.line:empty {
      display: none;
    }
    word-wrap: break-word;
    border-radius: ${defaultBorderRadius};
    background-color: ${vscEditorBackground};
    font-size: ${getFontSize() - 2}px;
    font-family: var(--vscode-editor-font-family);
  }

  code:not(pre > code) {
    font-family: var(--vscode-editor-font-family);
    color: #f78383;
  }

  background-color: ${window.isPearOverlay ?  "transparent" : vscBackground};
  font-family:
    var(--vscode-font-family),
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    "Open Sans",
    "Helvetica Neue",
    sans-serif;
  font-size: ${(props) => props.fontSize || getFontSize()}px;
  padding-left: 8px;
  padding-right: 8px;
  color: ${vscForeground};

  p,
  li,
  ol,
  ul {
    line-height: 1.5;
  }
`;

interface StyledMarkdownPreviewProps {
  source?: string;
  className?: string;
  showCodeBorder?: boolean;
  scrollLocked?: boolean;
  isStreaming?: boolean;
  isLast?: boolean;
  messageIndex?: number;
  integrationSource?: "perplexity" | "aider" | "continue";
}

interface FadeInWordsProps extends StyledMarkdownPreviewProps {
  children: any;
}

const FadeInWords: React.FC<FadeInWordsProps> = (props: FadeInWordsProps) => {
  const { children, integrationSource, isStreaming, messageIndex, ...otherProps } = props;
  const active = props.integrationSource === "continue"
    ? useSelector((store: RootState) => store.state.active)
    : props.integrationSource === "perplexity"
      ? useSelector((store: RootState) => store.state.perplexityActive)
      : useSelector((store: RootState) => store.state.aiderActive);
  
  // Get the appropriate history based on the source
  const history = useSelector((store: RootState) => {
    switch (integrationSource) {
      case "perplexity":
        return store.state.perplexityHistory;
      case "aider":
        return store.state.aiderHistory;
      default:
        return store.state.history;
    }
  });

  // The last message in the history array is the one being streamed
  // Only apply animation after initial render
  const isStreamingMessage = active && messageIndex === history.length - 1;

  const words = children
    .map((child) => {
      if (typeof child === "string") {
        return child.split(/(\s+)/).map((word, index) => (
          <span 
            className={word.trim() && isStreamingMessage ? "fade-in-span" : undefined} 
            key={index}
          >
            {word}
          </span>
        ));
      } else {
        return <span className={isStreamingMessage ? "fade-in-span" : undefined}>{child}</span>;
      }
    })
    .flat();

  return <p {...otherProps}>{words}</p>;
};

const StyledMarkdownPreview = memo(function StyledMarkdownPreview(
  props: StyledMarkdownPreviewProps,
) {
  const [reactContent, setMarkdownSource] = useRemark({
    remarkPlugins: [
      remarkMath,
      () => {
        return (tree) => {
          visit(tree, "code", (node: any) => {
            if (!node.lang) {
              node.lang === "javascript";
            } else if (node.lang.includes(".")) {
              node.lang = node.lang.split(".").slice(-1)[0];
            }
          });
        };
      },
    ],
    rehypePlugins: [rehypeHighlight as any, {}, rehypeKatex as any, {}],
    rehypeReactOptions: {
      components: {
        a: ({ node, ...props }) => {
          return (
            <a {...props} target="_blank">
              {props.children}
            </a>
          );
        },
        pre: ({ node, ...preProps }) => {
          const language = preProps?.children?.[0]?.props?.className
            ?.split(" ")
            .find((word) => word.startsWith("language-"))
            ?.split("-")[1];
          return props.showCodeBorder ? (
            <PreWithToolbar language={language}>
              <SyntaxHighlightedPre {...preProps}></SyntaxHighlightedPre>
            </PreWithToolbar>
          ) : (
            <SyntaxHighlightedPre {...preProps}></SyntaxHighlightedPre>
          );
        },
        code: ({ node, ...codeProps }) => {
          if (
            codeProps.className?.split(" ").includes("hljs") ||
            codeProps.children?.length > 1
          ) {
            return <code {...codeProps}>{codeProps.children}</code>;
          }
          return (
            <LinkableCode {...codeProps}>{codeProps.children}</LinkableCode>
          );
        },
        //   pre: ({ node, ...preProps }) => {
        //     const codeString =
        //       preProps.children?.[0]?.props?.children?.[0].trim() || "";
        //     const monacoEditor = (
        //       <MonacoCodeBlock
        //         showBorder={props.showCodeBorder}
        //         language={
        //           preProps.children?.[0]?.props?.className?.split("-")[1] ||
        //           "typescript"
        //         }
        //         preProps={preProps}
        //         codeString={codeString}
        //       />
        //     );
        //     return props.showCodeBorder ? (
        //       <PreWithToolbar copyvalue={codeString}>
        //         <SyntaxHighlightedPre {...preProps}></SyntaxHighlightedPre>
        //       </PreWithToolbar>
        //     ) : (
        //       <SyntaxHighlightedPre {...preProps}></SyntaxHighlightedPre>
        //     );
        //   },
        p: ({ node, ...pProps }) => {
          // pProps is the props of the paragraph node from rehypeReact
          // props is the actual props of StyledMarkdownPreview
          if (props.isLast) {
            return (
              <FadeInWords {...pProps} {...props}>
                {pProps.children}
              </FadeInWords>
            );
          }
          return <p {...pProps}>{pProps.children}</p>;
        },
      },
    },
  });

  useEffect(() => {
    setMarkdownSource(props.source || "");
  }, [props.source]);

  return (
    <StyledMarkdown fontSize={getFontSize()} showBorder={false}>
      {reactContent}
    </StyledMarkdown>
  );
});

export default StyledMarkdownPreview;
