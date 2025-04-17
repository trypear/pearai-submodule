import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { Brain, Sparkles } from "lucide-react";
import { StatusCardProps } from "./types";
import { vscBackground, vscInputBackground } from "@/components";

export const SearchBar = ({ searchQuery, setSearchQuery }) => (
  <div className="relative flex items-center">
    <input
      type="text"
      placeholder="Search memories"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="pl-3 pr-8 text-sm bg-input rounded-md p-1 border-none focus:outline-none"
      style={{
        backgroundColor: "var(--vscode-editor-background)",
        color: "var(--vscode-editor-foreground)",
        fontFamily: "inherit"
      }}
    />
    <Search
      className="absolute right-2 text-muted-foreground"
      size={16}
    />
  </div>
);

export const ActionButton = ({ icon: Icon, tooltip, onClick, disabled }) => (
  <TooltipProvider>
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClick}
          disabled={disabled}
          className="h-9 w-9 p-0 hover:bg-input/90"
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={-15} alignOffset={2}>
        <p className="text-xs px-2 py-1 rounded-lg" style={{
          backgroundColor: vscInputBackground
        }}>
          {tooltip}
        </p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export function StatusCard({ title, description, icon, showSparkles = false, animate = false, secondaryDescription = "" }: StatusCardProps) {
  return (
    <Card className="p-16 bg-input hover:bg-input/90 transition-colors mx-auto">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          {icon === 'brain' ? (
            <Brain className={`w-16 h-16 ${animate ? 'animate-pulse' : ''}`} />
          ) : (
            <Search className="w-16 h-16" />
          )}
          {showSparkles && (
            <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
          )}
        </div>
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs text-center">
          {description}
        </p>
        {secondaryDescription && <p className="mt-2 text-sm text-muted-foreground max-w-xs text-center">
          {secondaryDescription}
        </p>}
      </div>
    </Card>
  );
} 