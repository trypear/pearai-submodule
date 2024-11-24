import styled from "styled-components";
import { Fragment } from "react";
import {
    defaultBorderRadius,
    lightGray,
    vscBadgeBackground,
    vscBadgeForeground,
    vscForeground,
} from "..";
interface ShortcutButtonProps {
    keys: string[];
    onClick?: () => void;
    offFocus?: boolean;
    className?: string;
    label?: string;
  }
  
  const Container = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    border-radius: 6px;
    color: ${vscForeground};
  
    &:hover {
      opacity: 0.6;
    }
  `;
  //change hoverstate later

  const StyledShortcutButton = styled.div<{ offFocus: boolean }>`
    padding: 1px 4px;
    display: flex;
    align-items: center;
    gap: 2px;
  
    border: 1.5px solid ${(props) =>
      props.offFocus ? undefined : lightGray + "33"};
    border-radius: ${defaultBorderRadius};
  `;
  
  const KeySpan = styled.span`
  `;
  
  const PlusSpan = styled.span`
    opacity: 0.5;
  `;
  
  const LabelSpan = styled.span`
  
  `;
  
  export function ShortcutButton({ keys, onClick, offFocus = false, className = "", label }: ShortcutButtonProps) {
    return (
      <Container onClick={onClick} className={className}>
        <StyledShortcutButton offFocus={offFocus}>
          {keys.map((key, index) => (
            <Fragment key={index}>
              <KeySpan>{key}</KeySpan>
              {index < keys.length - 1 && <PlusSpan>+</PlusSpan>}
            </Fragment>
          ))}
        </StyledShortcutButton>
        {label && <LabelSpan>{label}</LabelSpan>}
      </Container>
    );
  }
  