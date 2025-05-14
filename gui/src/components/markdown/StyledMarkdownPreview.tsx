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
import PreWithToolbar, { ToolbarOptions } from "./PreWithToolbar";
import { SyntaxHighlightedPre } from "./SyntaxHighlightedPre";
import "./katex.css";
import "./markdown.css";
import { Citation } from "core";

const StyledMarkdown = styled.div<{
  fontSize?: number;
  showBorder?: boolean;
  isCodeSnippet?: boolean;
  hideBackground?: boolean;
}>`
  pre {
    background-color: ${props => window.isPearOverlay ?  vscBackground : (props.isCodeSnippet ? vscBackground : vscEditorBackground)};
    border-radius: ${defaultBorderRadius};

    max-width: calc(100vw - 24px);
    overflow-x: scroll;
    overflow-y: hidden;

    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    -ms-overflow-style: none;
    scroll-behavior: smooth;

    ${(props) => {
      if (props.showBorder) {
        return `
          border: 0.5px solid #8888;
        `;
      }
    }}
    padding: ${props => props.isCodeSnippet ? '0px 4px 4px 4px' : '32px 12px 12px 12px'};
  }

  code {
    span.line:empty {
      display: none;
    }
    word-wrap: break-word;
    background-color: ${props => props.isCodeSnippet ? vscBackground : vscEditorBackground};
    font-size: ${getFontSize() - 2}px;
    font-family: var(--vscode-editor-font-family);
  }

  code:not(pre > code) {
    font-family: var(--vscode-editor-font-family);
    color: #f78383;
  }

  background-color: ${props => props.hideBackground ? "transparent" : (window.isPearOverlay ? "transparent" : vscBackground)};
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
  integrationSource?: "perplexity" | "continue";
  citations?: Citation[];
  isCodeSnippet?: boolean;
  hideBackground?: boolean;
  toolbarOptions?: ToolbarOptions;
  onBlockEditClick?: (editedContent: string) => void;
}

interface FadeInWordsProps extends StyledMarkdownPreviewProps {
  children: any;
}

const FadeInWords: React.FC<FadeInWordsProps> = (props: FadeInWordsProps) => {
  const { children, integrationSource, isStreaming, messageIndex, showCodeBorder, isLast, ...otherProps } = props;
  const active = props.integrationSource === "continue"
    ? useSelector((store: RootState) => store.state.active)
    : useSelector((store: RootState) => store.state.perplexityActive)

  // Get the appropriate history based on the source
  const history = useSelector((store: RootState) => {
    switch (integrationSource) {
      case "perplexity":
        return store.state.perplexityHistory;
      default:
        return store.state.history;
    }
  });

  // The last message in the history array is the one being streamed
  // Only apply animation after initial render
  const isStreamingMessage = active && messageIndex === history.length - 1;

  const words = children
    .map((child, childIndex) => {
      if (typeof child === "string") {
        return child.split(/(\s+)/).map((word, index) => (
          <span
            className={word.trim() && isStreamingMessage ? "fade-in-span" : undefined}
            key={`${childIndex}-${index}-${word}`}
          >
            {word}
          </span>
        ));
      } else {
        return <span key={`child-${childIndex}`} className={isStreamingMessage ? "fade-in-span" : undefined}>{child}</span>;
      }
    })
    .flat();

  return <p {...otherProps}>{words}</p>;
};


interface FadeInElementProps extends StyledMarkdownPreviewProps {
  children: any;
  as?: keyof JSX.IntrinsicElements;
}


const FadeInElement: React.FC<FadeInElementProps> = (props: FadeInElementProps) => {
  const { children, integrationSource, isStreaming, messageIndex, showCodeBorder, isLast, as = 'p', ...otherProps } = props;
  const ElementType = as;

  const active = props.integrationSource === "continue"
    ? useSelector((store: RootState) => store.state.active)
    : useSelector((store: RootState) => store.state.perplexityActive)

  const history = useSelector((store: RootState) => {
    switch (integrationSource) {
      case "perplexity":
        return store.state.perplexityHistory;
      default:
        return store.state.history;
    }
  });

  // The last message in the history array is the one being streamed
  const isStreamingMessage = active && messageIndex === history.length - 1;

  if (!children) {
    return <ElementType {...otherProps}></ElementType>;
  }

  if (typeof children === 'string' || !Array.isArray(children)) {
    return (
      <ElementType {...otherProps}>
        <span className={isStreamingMessage ? "fade-in-span" : undefined}>
          {children}
        </span>
      </ElementType>
    );
  }

  const words = children
    .map((child, childIndex) => {
      if (!child) return null;
      if (typeof child === "string") {
        return child.split(/(\s+)/).map((word, index) => (
          <span
            className={word.trim() && isStreamingMessage ? "fade-in-span" : undefined}
            key={`${childIndex}-${index}-${word}`}
          >
            {word}
          </span>
        ));
      } else {
        return React.cloneElement(child, {
          key: `element-${childIndex}`,
          className: isStreamingMessage ? "fade-in-span" : undefined
        });
      }
    })
    .filter(Boolean)
    .flat();

  return <ElementType {...otherProps}>{words}</ElementType>;
};

const processCitations = (text: string, citations?: Citation[]) => {
  if (!citations) return text;

  return text.replace(/\[(\d+)\]/g, (match, num) => {
    const citation = citations[parseInt(num) - 1];
    if (!citation) return match;
    return `[[${num}]](${citation.url})`;
  });
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
          const codeString = preProps?.children?.[0]?.props?.children?.[0] || "";

          return props.showCodeBorder ? (
            <PreWithToolbar
              language={language}
              toolbarOptions={props.toolbarOptions}
              onBlockEditClick={props.onBlockEditClick}
              codeString={codeString}
            >
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

        h1: ({ node, ...hProps }) => {
          if (props.isLast) {
            return (
              <FadeInElement as="h1" {...hProps} {...props}>
                {hProps.children}
              </FadeInElement>
            );
          }
          return <h1 {...hProps}>{hProps.children}</h1>;
        },
        h2: ({ node, ...hProps }) => {
          if (props.isLast) {
            return (
              <FadeInElement as="h2" {...hProps} {...props}>
                {hProps.children}
              </FadeInElement>
            );
          }
          return <h2 {...hProps}>{hProps.children}</h2>;
        },
        h3: ({ node, ...hProps }) => {
          if (props.isLast) {
            return (
              <FadeInElement as="h3" {...hProps} {...props}>
                {hProps.children}
              </FadeInElement>
            );
          }
          return <h3 {...hProps}>{hProps.children}</h3>;
        },
        h4: ({ node, ...hProps }) => {
          if (props.isLast) {
            return (
              <FadeInElement as="h4" {...hProps} {...props}>
                {hProps.children}
              </FadeInElement>
            );
          }
          return <h4 {...hProps}>{hProps.children}</h4>;
        },

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
        li: ({ node, ...liProps }) => {
          // liProps is the actual props of li node from rehype-react
          // props is the actual props of StyledMarkdownPreview
          if (props.isLast) {
            return (
              <FadeInElement as="li" {...liProps} {...props}>
                {liProps.children}
              </FadeInElement>
            );
          }
          return <li {...liProps}>{liProps.children}</li>;
        },
        ul: ({ node, ...ulProps }) => {
          // ulProps is the actual props of ul node from rehype-react
          // props is the actual props of StyledMarkdownPreview
          if (props.isLast) {
            return (
              <FadeInElement as="ul" {...ulProps} {...props}>
                {ulProps.children}
              </FadeInElement>
            );
          }
          return <ul {...ulProps}>{ulProps.children}</ul>;
        },
        ol: ({ node, ...olProps }) => {
          // olProps is the actual props of ol node from rehype-react
          // props is the actual props of StyledMarkdownPreview
          if (props.isLast) {
            return (
              <FadeInElement as="ol" {...olProps} {...props}>
                {olProps.children}
              </FadeInElement>
            );
          }
          return <ol {...olProps}>{olProps.children}</ol>;
        },
      },
    },
  });

  useEffect(() => {
    setMarkdownSource(props.source || "");
  }, [props.source]);

  useEffect(() => {
    const processedSource = processCitations(props.source || "", props.citations);
    setMarkdownSource(processedSource);
  }, [props.source, props.citations]);

  return (
    <StyledMarkdown
      fontSize={getFontSize()}
      showBorder={false}
      isCodeSnippet={props.isCodeSnippet}
      hideBackground={props.hideBackground}
    >
      {reactContent}
    </StyledMarkdown>
  );
});

export default StyledMarkdownPreview;
