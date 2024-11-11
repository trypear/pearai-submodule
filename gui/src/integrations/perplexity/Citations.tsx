import { cn } from "@/lib/utils";
import { Citation } from 'core';

interface CitationsProps {
  citations: Citation[];
  className?: string;
  isLast: boolean;
  active: boolean;
}

const CitationCard = ({ 
  citation, 
  isLast, 
  index,
  active
}: { 
  citation: Citation; 
  isLast: boolean; 
  index: number;
  active: boolean;
}) => {
  const favicon = `https://www.google.com/s2/favicons?domain=${citation.url}&size=128`;

  return (
    <a
      href={citation.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex-shrink-0 w-40 text-xs px-3 bg-sidebar-background rounded-md hover:shadow-md hover:!opacity-70 hover:text-foreground transition-shadow duration-200 group no-underline",
        isLast && active && "opacity-0 animate-fadeIn"

      )}
      style={{ 
        animationDelay: `${index * 200}ms`,
        animationFillMode: 'forwards'
      }}
    >
      <div className="flex flex-col">
        <div className="font-medium py-2 h-[3rem] text-foreground line-clamp-3 no-underline">
          {citation.title}
        </div>
        <div className="flex items-center space-x-2">
          <img 
            src={favicon} 
            alt="" 
            className="w-4 h-4 rounded-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'default-favicon.png';
            }}
          />
          <p className="text-xs py-2 m-0 text-input-foreground text-button truncate no-underline">
            {new URL(citation.url).hostname}
          </p>
        </div>
      </div>
    </a>
  );
};

export const Citations = ({ citations, className, isLast, active}: CitationsProps) => {
  if (!citations?.length) return null;

  return (
    <div className={cn("mb-4", className)}>
      <div className="font-base my-2 text-sm text-muted-foreground">Sources:</div> 
      <div className="overflow-x-auto pb-2">
        <div className="flex space-x-2">
          {citations.map((citation, i) => (
            <CitationCard 
              key={citation.url} 
              citation={citation} 
              isLast={isLast}
              index={i}
              active={active}
            />
          ))}
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-transparent via-input to-transparent mt-2 opacity-50" />
    </div>
  );
};