import { Home, Search, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: "inventory-something.png",
      label: "Inventory",
      path: "/inventory",
    },
    {
      icon: "inventory-aider.png",
      label: "Creator",
      path: "/inventory/aiderMode",
    },
    {
      icon: "inventory-perplexity.png",
      label: "Search",
      path: "/inventory/perplexityMode",
    },
  ];

  return (
    <div className="h-full flex items-center justify-center bg-black bg-opacity-40">
      <div className="grid grid-cols-3 gap-8">
        {menuItems.map((item) => (
          <div
            key={item.label}
            className="w-32 h-32 flex flex-col cursor-pointer items-center justify-center gap-2 p-4 hover:bg-accent hover:bg-opacity-50 hover:text-accent-foreground transition-colors"
            onClick={() => navigate(item.path)}
          >
            {typeof item.icon === 'string' ? (
              <img src={`${window.vscMediaUrl}/logos/${item.icon}`} width={100} height={100} alt="" /> 
            ) : (
              <item.icon className="w-12 h-12" />
            )}
            <span className="text-sm font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}