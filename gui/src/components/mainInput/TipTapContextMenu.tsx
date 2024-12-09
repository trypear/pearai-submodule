import React from 'react';
import { Editor } from '@tiptap/react';
import { handleCopy, handleCut, handlePaste } from './TipTapEditor';

interface TipTapContextMenuProps {
    editor: Editor;
    position: { x: number; y: number };
    onClose: () => void;
    defaultModel: any;
    ideMessenger: any;
    handleImageFile: (file: File) => Promise<[HTMLImageElement, string] | undefined>;
}

export const TipTapContextMenu: React.FC<TipTapContextMenuProps> = ({
    editor,
    position,
    onClose,
    defaultModel,
    ideMessenger,
    handleImageFile,
}) => {
    const menuItems = [
        {
            label: 'Copy',
            action: () => {
                handleCopy(editor);
                onClose();
            },
        },
        {
            label: 'Cut',
            action: () => {
                handleCut(editor);
                onClose();
            },
        },
        {
            label: 'Paste',
            action: async () => {
                await handlePaste(editor);
                onClose();
            },
        },
    ];

    return (
        <div
            className="fixed z-[9999] min-w-[160px] bg-dropdown rounded-lg shadow-lg p-2 cursor-pointer shadow-lg shadow-2xl"
            style={{ top: position.y, left: position.x }}>
            {menuItems.map((item, index) => (
                <div key={index}
                    className="px-2 py-1 text-left hover:bg-list-activeSelection-background flex items-center gap-2  rounded-md" onClick={item.action}>
                    {item.label}
                </div>
            ))}
        </div>
    );
}; 
