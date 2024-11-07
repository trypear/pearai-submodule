import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getLogoPath } from "@/pages/welcome/setup/ImportExtensions";
import { getMetaKeyLabel } from "@/util";

interface KbdProps {
  children: React.ReactNode;
}

export function Kbd({ children }: KbdProps) {
  return (
    <div className="inline-flex h-5 items-center justify-center rounded border bg-input px-1.5 font-mono font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
      {children}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: "inventory-aider.png",
      label: "Creator",
      description: <>Create new features</>,
      shortcut: <span className="flex gap-1"><Kbd>{getMetaKeyLabel()}</Kbd><Kbd>2</Kbd></span>,
      path: "/inventory/aiderMode",
    },
    {
      icon: "inventory-perplexity.png",
      label: "Search",
      description: <>Up-to-date information</>,
      shortcut: <span className="flex gap-1"><Kbd>{getMetaKeyLabel()}</Kbd><Kbd>3</Kbd></span>,
      path: "/inventory/perplexityMode",
    },
    {
      icon: "inventory-something.png",
      label: "Inventory",
      description: <>See all your AI tools</>,
      shortcut: <span className="flex gap-1"><Kbd>{getMetaKeyLabel()}</Kbd><Kbd>SHIFT</Kbd><Kbd>1</Kbd></span>,
      path: "/inventory",
    },
  ];

  const updateOverlayStyle = (borderRadius: string, boxShadow: string) => {
    document.documentElement.style.setProperty('--overlay-border-radius', borderRadius);
    document.documentElement.style.setProperty('--overlay-box-shadow', boxShadow);
  };

  useEffect(() => {
    updateOverlayStyle('0px', 'transparent');
    return () => {
      updateOverlayStyle('12px', '0 8px 24px rgba(0, 0, 0, 0.25)');
    }
  }, []);

  return (
<div className="h-full flex items-center justify-center">
  <div className="grid grid-cols-3 gap-8">
    {menuItems.map((item) => (
      <div
        key={item.label}
        className="text-white flex flex-col cursor-pointer items-center justify-center gap-2 p-4 
          rounded-lg hover:text-background transition-all duration-200 
          transform hover:scale-105"
        onClick={() => navigate(item.path)}
      >
        <div>{item.shortcut}</div>
        <img 
          src={`${getLogoPath(item.icon)}`} 
          width="70%" 
          height="70%" 
          alt="" 
          className="mb-2"
        />
        <div className="text-center">
          <div className="flex flex-col justify-center gap-2 items-center">
            <div className="font-bold">{item.label}</div>
            <p className="mt-1">{item.description}</p>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
  );
}
