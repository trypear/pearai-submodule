import React, { useRef, useEffect } from 'react';
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
    const menuRef = useRef<HTMLDivElement>(null);
	const MENU_WIDTH = 100;
    const MENU_HEIGHT = 110;
    const PADDING = 10;

	const getInitialPosition = () => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        let x = position.x;
        let y = position.y;

        if (position.x + MENU_WIDTH > windowWidth - PADDING) {
            x = position.x - MENU_WIDTH;
        }

        if (position.y + MENU_HEIGHT > windowHeight - PADDING) {
            y = position.y - MENU_HEIGHT;
        }

        return { x, y };
    };

    const menuPosition = getInitialPosition();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleScroll = () => {
            onClose();
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('scroll', handleScroll, true);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('scroll', handleScroll, true);
        };
    }, [onClose]);

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
            ref={menuRef}
            className="fixed z-10 min-w-[100px] bg-dropdown rounded-lg shadow-lg p-2 cursor-pointer"
            style={{ top: menuPosition.y, left: menuPosition.x, boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4), 0 3px 16px rgba(0, 0, 0, 0.4)' }}>
            {menuItems.map((item, index) => (
                <div key={index}
                    className="px-2 py-1 text-left hover:bg-list-activeSelection-background flex items-center rounded-md" onClick={item.action}>
                    {item.label}
                </div>
            ))}
        </div>
    );
};
