import { useState, useRef , useCallback} from "react";
import { useSelector , useDispatch} from "react-redux";
import { Button } from "@/components/ui/button";
import { RootState } from "@/redux/store";
import { setActiveFilePath } from "@/redux/slices/uiStateSlice";
import { Editor } from "@tiptap/react";
import { useContext } from "react";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { ContextItemWithId } from "core";

import {
    PhotoIcon,
    AtSymbolIcon,
    PlusIcon,
} from "@heroicons/react/24/outline";
import styled from "styled-components";
import {
    lightGray,
    vscBadgeForeground,
} from "..";
import { modelSupportsImages } from "core/llm/autodetect";
import { defaultModelSelector } from "../../redux/selectors/modelSelectors";
import { CheckIcon } from "@heroicons/react/16/solid";


const StyledDiv = styled.div<{ isHidden: boolean }>`
color: ${vscBadgeForeground};
    display: ${(props) => (props.isHidden ? "none" : "flex")};
    gap: 0.5rem;
    align-items: flex-end;
	user-select: none;
    z-index: 10;
    cursor: ${(props) => (props.isHidden ? "default" : "text")};
    pointer-events: ${(props) => (props.isHidden ? "none" : "auto")};
`;

interface ContextToolbarProps {
    hidden?: boolean;
    source: 'continue' | 'perplexity' | 'aider';
    onClick?: () => void;
    onAddContextItem?: () => void;
    onImageFileSelected?: (file: File) => void;
    editor?: Editor;
}

function ContextToolbar(props: ContextToolbarProps) {
	const [fileAdded, setFileAdded] = useState(false);
    const ideMessenger = useContext(IdeMessengerContext);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const defaultModel = useSelector(defaultModelSelector);
    const dispatch = useDispatch();
    const activeFilePath = useSelector((state: RootState) => state.uiState.activeFilePath);
	const timeoutRef = useRef<NodeJS.Timeout>();

    const isPerplexity = props.source === 'perplexity'

    const fileName = activeFilePath ? activeFilePath.split(/[/\\]/).pop() : "Current File";

    const isFileAlreadyAdded = useCallback(() => {
        if (!props.editor || !activeFilePath) return false;

        const content = props.editor.getJSON().content;
        if (!content) return false;

        return content.some(node =>
            node.type === 'codeBlock' &&
            node.attrs?.item?.id?.itemId === activeFilePath
        );
    }, [props.editor, activeFilePath]);

    const removeActiveFile = useCallback(() => {
        dispatch(setActiveFilePath(undefined));
    }, [])

    return (
        <StyledDiv
            isHidden={props.hidden}
            onClick={props.onClick}
            id="context-toolbar"
        >

			{/* Context Button */}
            <Button
                className="gap-1 text-xs bg-input text-input-foreground h-6 px-2 hover:bg-sidebar-background"
                onClick={(e) => {
                    e.stopPropagation();
                    props.onAddContextItem?.();
                }}
            >
                <AtSymbolIcon
                    width="14px"
                    height="14px"
					className="stroke-2"
                />
                Context
            </Button>

			{/* Add Current File Button */}
            {!isPerplexity && <Button
                className={`gap-1 h-6 text-input-foreground text-xs px-2 bg-transparent hover:bg-sidebar-background border-solid border-input
                    ${!activeFilePath ? 'opacity-50 cursor-not-allowed' : ''}
                    ${isFileAlreadyAdded() ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={async () => {
                    if (!props.editor || !activeFilePath) return;

                    if (isFileAlreadyAdded()) {
                        return;
                    }

                    const fileContents = await ideMessenger.ide.readFile(activeFilePath);

                    const item: ContextItemWithId = {
                        content: fileContents,
                        name: fileName,
                        description: activeFilePath,
                        id: {
                            providerTitle: "code",
                            itemId: activeFilePath,
                        },
                        language: activeFilePath.split('.').pop() || 'txt'
                    };

                    props.editor.chain()
                        .focus()
                        .insertContentAt(0, {
                            type: "codeBlock",
                            attrs: {
                                item,
                            },
                        })
                        .run();
                    setFileAdded(true);

                    if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                    }

                    timeoutRef.current = setTimeout(() => {
                        setFileAdded(false);
                    }, 2000);
                }}
            >
                {fileAdded || isFileAlreadyAdded() ? (
                    <CheckIcon
                        width="14px"
                        height="14px"
                        className="text-green-500 stroke-2"
                    />
                ) : (
                    <PlusIcon
                        width="14px"
                        height="14px"
                        className="stroke-2"
                    />
                )}
                {fileName}
            </Button>}

			{/* Image Upload Button */}
            {defaultModel &&
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