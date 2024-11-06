import { useNavigate } from "react-router-dom";
import { Bot, Search, Box } from 'lucide-react';

const tools = [
  {
    id: "aiderMode",
    name: "Creator (aider)",
    description: "AI assistant to help complete features directly",
    icon: <Bot className="h-10 w-10" />,
    path: "/inventory/aiderMode"
  },
  {
    id: "perplexityMode",
    name: "Search (Perplexity)",
    description: "AI-powered search for up-to-date information",
    icon: <Search className="h-10 w-10" />,
    path: "/inventory/perplexityMode"
  },
  {
    id: "inventory",
    name: "Inventory",
    description: "Browse and manage your AI tools",
    icon: <Box className="h-10 w-10" />,
    path: "/inventory"
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-8">Welcome to PearAI</h1>
      <div className="grid grid-cols-3 gap-20">
        {tools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => navigate(tool.path)}
            className="flex flex-col items-center cursor-pointer group"
          >
            <div className="w-20 h-20 rounded-xl bg-button flex items-center justify-center 
                          text-5xl transition-all duration-200 
                          group-hover:shadow-lg group-hover:scale-105
                          border border-input">
              {tool.icon}
            </div>
            <h3 className="mt-4 text-lg font-semibold">{tool.name}</h3>
            <p className="text-sm text-muted-foreground text-center mt-2 max-w-[200px]">
              {tool.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}