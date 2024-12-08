import React, { useEffect, useState } from 'react';
import { CustomContextMenu } from './CustomContextMenu';

interface ContextMenuProviderProps {
  children: React.ReactNode;
}

export const ContextMenuProvider: React.FC<ContextMenuProviderProps> = ({ children }) => {
  const [contextMenu, setContextMenu] = useState<{
    text: string;
    position: { x: number; y: number };
  } | null>(null);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      
      const selection = window.getSelection();
      const selectedText = selection?.toString() || '';
      
      setContextMenu({
        text: selectedText,
        position: { x: e.clientX, y: e.clientY },
      });
    };

    const handleClick = () => {
      setContextMenu(null);
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <>
      {children}
      {contextMenu && (
        <CustomContextMenu
          text={contextMenu.text}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
};
