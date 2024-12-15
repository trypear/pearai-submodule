import { useState, useRef , useCallback} from "react";
import { useSelector , useDispatch} from "react-redux";
import { Button } from "@/components/ui/button";
import { RootState } from "@/redux/store";
import { setActiveFilePath } from "@/redux/slices/uiStateSlice";

import {
    PhotoIcon,
    AtSymbolIcon,
    PlusIcon,
} from "@heroicons/react/24/outline";
import styled from "styled-components";
import {
    defaultBorderRadius,
    lightGray,
    vscBadgeForeground,
    vscButtonBackground,
    vscButtonForeground,
    vscInputBackground
} from "..";
import { modelSupportsImages } from "core/llm/autodetect"; // Updated import
import { defaultModelSelector } from "../../redux/selectors/modelSelectors"; // Added import
import { isPerplexityMode } from "../../util/bareChatMode"; // Added import



const StyledDiv = styled.div<{ isHidden: boolean }>`
color: ${vscBadgeForeground};
    display: ${(props) => (props.isHidden ? "none" : "flex")};
    gap: 0.5rem;
    align-items: flex-end;
    z-index: 10;
    cursor: ${(props) => (props.isHidden ? "default" : "text")};
    pointer-events: ${(props) => (props.isHidden ? "none" : "auto")};
`;

interface ContextToolbarProps {
    hidden?: boolean;
    onClick?: () => void;
    onAddContextItem?: () => void; // Added back this prop
    onImageFileSelected?: (file: File) => void;
}

function ContextToolbar(props: ContextToolbarProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const defaultModel = useSelector(defaultModelSelector);
    const perplexityMode = isPerplexityMode();
    const dispatch = useDispatch();
    const activeFilePath = useSelector((state: RootState) => state.uiState.activeFilePath);

    const fileName = activeFilePath?.split(/[/\\]/)?.pop() ?? "";

    const removeActiveFile = useCallback(() => {
        dispatch(setActiveFilePath(undefined));
      }, [])
      
    return (
        <StyledDiv
            isHidden={props.hidden}
            onClick={props.onClick}
            id="context-toolbar"
        >
            <Button
                className="gap-1 text-xs bg-input text-input-foreground h-6 px-2"
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
            {activeFilePath &&<Button
                className="gap-1 h-6 bg-input text-input-foreground text-xs px-2 bg-transparent border-solid border-input"
                onClick={() => {
                    // TODO: Add file to context, like @filePath. 
                }}
            >
                <PlusIcon
                    width="16px"
                    height="16px"
                />
                {fileName}
            </Button>}

            {!perplexityMode && defaultModel &&
                modelSupportsImages(
                    defaultModel.provider,
                    defaultModel.model,
                    defaultModel.title,
                    defaultModel.capabilities,
                ) && (
                    <span>
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
                            className="h-0 p-0"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <PhotoIcon
                                width="17px"
                                height="17px"
								color={lightGray}
                            />
                        </Button>
                    </span>
                )}
        </StyledDiv>
    );
}

export default ContextToolbar;