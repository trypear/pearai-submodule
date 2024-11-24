import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
    PhotoIcon as OutlinePhotoIcon,
    AtSymbolIcon,
    PlusIcon,
    
  } from "@heroicons/react/24/outline";
import styled from "styled-components";
import {
    defaultBorderRadius,
    lightGray,
    vscButtonBackground,
    vscButtonForeground,
    vscInputBackground
} from "..";
import { getFontSize } from "../../util";

const StyledDiv = styled.div<{ isHidden: boolean }>`
  padding: 4px 0;
  display: flex;
  justify-content: flex-start;
  gap: 6px;
  align-items: flex-end;
  z-index: 50;
  font-size: ${getFontSize()}px;
  cursor: ${(props) => (props.isHidden ? "default" : "text")};
  opacity: ${(props) => (props.isHidden ? 0 : 1)};
  pointer-events: ${(props) => (props.isHidden ? "none" : "auto")};

  & > * {
    flex: 0 0 auto;
  }

  @media (max-width: 400px) {
    & > span:last-child {
      display: none;
    }
  }
`;

interface ContextToolbarProps {
    hidden?: boolean;
    onClick?: () => void;
}

function ContextToolbar(props: ContextToolbarProps) {
    return (
        <StyledDiv
            isHidden={props.hidden}
            onClick={props.onClick}
            id="context-toolbar"
        >
            <Button
                variant="secondary"
                className="rounded-lg gap-1 h-7 px-2"
                size="sm"
                // style={{ backgroundColor: vscInputBackground }}
            >
                <AtSymbolIcon
                    width="16px"
                    height="16px"                    
                  />
                Context
            </Button>
            <Button
                variant="secondary"
                className="rounded-lg gap-1 h-7 px-2"
                size="sm"
                // style={{ backgroundColor: vscInputBackground }}
            >
                <PlusIcon
                    width="16px"
                    height="16px"                    
                  />
                Current selection
            </Button>
            <Button
                variant="secondary"
                className="rounded-lg gap-1 h-7 px-2"
                size="sm"
                // style={{ backgroundColor: vscInputBackground }}
            >
                <PlusIcon
                    width="16px"
                    height="16px"                    
                  />
                Current file
            </Button>
            <Button variant="ghost" size="icon" className="h-7">
                
                <OutlinePhotoIcon
                    width="16px"
                    height="16px"                    
                  />

            </Button>

        </StyledDiv>
    );
}

export default ContextToolbar;
