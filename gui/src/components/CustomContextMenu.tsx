import React from 'react';

interface CustomContextMenuProps {
  text: string;
  position: { x: number; y: number };
  onClose: () => void;
}

export const CustomContextMenu: React.FC<CustomContextMenuProps> = ({ text, position, onClose }) => {
  const menuItems = [
    {
      label: "Copy",
      action: () => {
        navigator.clipboard.writeText(text);
      },
    },
  ];

  return (
    <div 
      className="fixed z-[9999] min-w-[160px] bg-dropdown rounded-lg shadow-lg p-2 cursor-pointer shadow-lg shadow-2xl"
      style={{ top: position.y, left: position.x, boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4), 0 3px 16px rgba(0, 0, 0, 0.4)' }}
    >
      {menuItems.map((item, index) => (
        <div
          key={index}
          className="px-2 py-1 text-left hover:bg-list-activeSelection-background flex items-center gap-2  rounded-md"
          style={{
            color: 'var(--dropdown-foreground)',
          }}
          onClick={() => {
            item.action();
            onClose();
          }}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
};