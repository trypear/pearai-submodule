import { useContext } from "react";
import styled from "styled-components";
import { vscBackground, vscButtonBackground, vscEditorBackground, vscForeground } from "..";
import { VscThemeContext } from "../../context/VscTheme";

const StyledPre = styled.pre<{ theme: any }>`
  & .hljs {
    color: ${vscForeground};
    overflow-x: auto;
  }


  /* Base highlighting styles */
  & .hljs-keyword,
  & .hljs-selector-tag,
  & .hljs-built_in,
  & .hljs-name,
  & .hljs-tag {
    color: ${props => props.theme.keyword || '#569cd6'};
    font-weight: 500;
  }

  & .hljs-string,
  & .hljs-title,
  & .hljs-section,
  & .hljs-attribute,
  & .hljs-literal,
  & .hljs-template-tag,
  & .hljs-template-variable,
  & .hljs-type,
  & .hljs-attr {
    color: ${props => props.theme.string || '#ce9178'};
  }

  & .hljs-comment,
  & .hljs-quote,
  & .hljs-deletion,
  & .hljs-meta {
    color: ${props => props.theme.comment || '#6a9955'};
    font-style: italic;
  }

  & .hljs-number,
  & .hljs-symbol,
  & .hljs-bullet,
  & .hljs-link {
    color: ${props => props.theme.number || '#b5cea8'};
  }

  & .hljs-function,
  & .hljs-class {
    color: ${props => props.theme.function || '#dcdcaa'};
  }

  & .hljs-variable,
  & .hljs-params {
    color: ${props => props.theme.variable || '#9cdcfe'};
  }

  & .hljs-operator,
  & .hljs-punctuation {
    color: ${props => props.theme.operator || '#d4d4d4'};
  }

  & .hljs-property {
    color: ${props => props.theme.property || '#9cdcfe'};
  }

  & .hljs-regexp {
    color: ${props => props.theme.regexp || '#d16969'};
  }

  /* Selection and hover effects */
  & code::selection,
  & code *::selection {
    background: ${props => props.theme.selection || '#264f78'};
  }

  ${(props) =>
    Object.keys(props.theme)
      .map((key) => {
        return `
      & ${key} {
        color: ${props.theme[key]};
      }
    `;
      })
      .join("")}
`;

export const SyntaxHighlightedPre = (props: any) => {
  const currentTheme = useContext(VscThemeContext);

  return <StyledPre {...props} theme={currentTheme} />;
};
