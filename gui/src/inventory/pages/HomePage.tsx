import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { getLogoPath } from "@/pages/welcome/setup/ImportExtensions";
import { getMetaKeyLabel } from "@/util";
import { IdeMessengerContext } from "@/context/IdeMessenger";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";

interface KbdProps {
  children: React.ReactNode;
}

export function Kbd({ children }: KbdProps) {
  return (
    <div className="inline-flex h-5 items-center justify-center rounded border-[0.5px] border-solid bg-background px-1.5 font-mono font-medium text-foreground">
      {children}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
 
  const menuItems = [
    {
      icon: "inventory.svg",
      label: "Inventory Settings",
      description: <>See all your AI tools</>,
      shortcut: <span className="flex gap-1"><Kbd>{getMetaKeyLabel()}</Kbd><Kbd>SHIFT</Kbd><Kbd>1</Kbd></span>,
      path: "/inventory",
    },
    {
      icon: "inventory-creator.svg",
      label: "Creator",
      description: <>Create new features</>,
      shortcut: <span className="flex gap-1"><Kbd>{getMetaKeyLabel()}</Kbd><Kbd>2</Kbd></span>,
      path: "/inventory/aiderMode",
    },
    {
      icon: "inventory-search.svg",
      label: "Search",
      description: <>AI web search</>,
      shortcut: <span className="flex gap-1"><Kbd>{getMetaKeyLabel()}</Kbd><Kbd>3</Kbd></span>,
      path: "/inventory/perplexityMode",
    },
    {
      icon: "inventory-mem0.svg",
      label: "Memory",
      description: <>AI Personalization</>,
      shortcut: <span className="flex gap-1"><Kbd>{getMetaKeyLabel()}</Kbd><Kbd>4</Kbd></span>,
      path: "/inventory/mem0Mode",
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.props.children.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredMenuItems.length - 1));
          break;
        case 'ArrowRight':
          setSelectedIndex((prev) => (prev < filteredMenuItems.length - 1 ? prev + 1 : 0));
          break;
        case ' ':
          if (e.shiftKey) {
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredMenuItems.length - 1));
          } else {
            setSelectedIndex((prev) => (prev < filteredMenuItems.length - 1 ? prev + 1 : 0));
          }
          break;
        case 'Enter':
          if (filteredMenuItems.length > 0) {
            navigate(filteredMenuItems[selectedIndex].path);
          } else {
            setSearchTerm('');
            setSelectedIndex(0);
          }
          break;
        default:
          if (e.key.length === 1 || e.key === 'Backspace') {
            if (!e.metaKey && !e.altKey) {
              setSearchTerm(prev => e.key === 'Backspace' ? prev.slice(0, -1) : prev + e.key);
            }
            setSelectedIndex(0);
          }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, navigate, searchTerm, filteredMenuItems]);

  const closeOverlay = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.currentTarget === e.target) {
      ideMessenger.post("closeOverlay", undefined);
    }
  }

  useEffect(() => {
    // Set overlay styles
    document.documentElement.style.setProperty('--overlay-border-radius', '15px');
    document.documentElement.style.setProperty('backdrop-filter', `blur(3px)`);
    document.documentElement.style.setProperty('background-color', "rgba(0, 0, 0, 0.35)");
  }, []);

  const ideMessenger = useContext(IdeMessengerContext);

  return (
    <div 
      className="h-full flex flex-col items-center" 
      onClick={(e) => {
        closeOverlay(e);
      }}
    >
      {searchTerm && (
        <div className="absolute top-8 text-white/90 text-lg">
          {filteredMenuItems.length > 0 ? 
            `${searchTerm}` : 
            <div className="text-center">
              <span className="text-lg font-semibold">No matches found - "{searchTerm}"</span>
              <br />
              <span className="text-sm">Press 'Enter' to clear search.</span>
            </div>
          }
        </div>
      )}
      <div className="flex-1 flex items-center justify-center" onClick={(e) => closeOverlay(e)}>
        <div className={`grid gap-2 ${
          filteredMenuItems.length === 4 ? 'grid-cols-4' : 
          filteredMenuItems.length === 3 ? 'grid-cols-3' : 
          filteredMenuItems.length === 2 ? 'grid-cols-2' : 
          'grid-cols-1'
        } auto-cols-max justify-center`}>
          {(filteredMenuItems.length > 0 ? filteredMenuItems : []).map((item, index) => (
            <div
              key={item.label}
              className={`text-white flex flex-col cursor-pointer items-center justify-center gap-2 p-2
                rounded-lg transition-all duration-200 
                transform hover:scale-105 relative
                ${index === selectedIndex ? 'ring-2 ring-primary' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <div>{item.shortcut}</div>
              <img 
                src={`${getLogoPath(item.icon)}`} 
                width="80%" 
                height="80%" 
                alt={`${item.label} logo`}
                className="mb-2"
              />
              <div className="text-center w-4/5">
                <div className="flex flex-col justify-center gap-1 items-center">
                  <div className="font-bold text-sm">{item.label}</div>
                  <p className="mt-1 text-xs">{item.description}</p>
                </div>
              </div>
              <div className={` absolute -bottom-6 ${index === selectedIndex ? 'visible' : 'invisible'}`}>
                <ChevronUpIcon className="text-primary w-6 h-6" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="text-white/70 text-base mb-4 flex items-center gap-1">
        Hint: <Kbd>{getMetaKeyLabel()}</Kbd><Kbd>E</Kbd> toggles the previously opened view
      </div>
    </div>
  );
}
