import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
    PhotoIcon as OutlinePhotoIcon,
    AtSymbolIcon,
    PlusIcon,
    PhotoIcon as SolidPhotoIcon,
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
import { modelSupportsImages } from "core/llm/autodetect"; // Updated import
import { defaultModelSelector } from "../../redux/selectors/modelSelectors"; // Added import
import { isPerplexityMode } from "../../util/bareChatMode"; // Added import

const StyledDiv = styled.div<{ isHidden: boolean }>`
  padding: 4px 0;
  display: ${(props) => (props.isHidden ? "none" : "flex")};
  justify-content: flex-start;
  gap: 6px;
  align-items: flex-end;
  z-index: 50;
  font-size: ${getFontSize()}px;
  cursor: ${(props) => (props.isHidden ? "default" : "text")};
  pointer-events: ${(props) => (props.isHidden ? "none" : "auto")};

  & > * {
    flex: 0 0 auto;
  }
`;

interface ContextToolbarProps {
    hidden?: boolean;
    onClick?: () => void;
    onAddContextItem?: () => void; // Added back this prop
    onImageFileSelected?: (file: File) => void;
}

function ContextToolbar(props: ContextToolbarProps) {
    const [fileSelectHovered, setFileSelectHovered] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const defaultModel = useSelector(defaultModelSelector);
    const perplexityMode = isPerplexityMode();

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
                onClick={(e) => {
                    props.onAddContextItem?.();
                }}
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
            >
                <PlusIcon
                    width="16px"
                    height="16px"                    
                  />
                Current file
            </Button>

            {!perplexityMode && defaultModel &&
                modelSupportsImages(
                    defaultModel.provider,
                    defaultModel.model,
                    defaultModel.title,
                    defaultModel.capabilities,
                ) && (
                    <span
                        onMouseLeave={() => setFileSelectHovered(false)}
                        onMouseEnter={() => setFileSelectHovered(true)}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            accept=".jpg,.jpeg,.png,.gif,.svg,.webp"
                            onChange={(e) => {
                                for (const file of e.target.files) {
                                    props.onImageFileSelected?.(file);
                                }
                            }}
                        />
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7" 
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {fileSelectHovered ? (
                                <SolidPhotoIcon
                                    width="16px"
                                    height="16px"
                                    color={lightGray}
                                />
                            ) : (
                                <OutlinePhotoIcon
                                    width="16px"
                                    height="16px"
                                    color={lightGray}
                                />
                            )}
                        </Button>
                    </span>
                )}
        </StyledDiv>
    );
}

export default ContextToolbar;