// components/Citations.tsx
import { useState, useEffect, useContext } from 'react';
import { cn } from "@/lib/utils";
import { IdeMessengerContext } from "../../context/IdeMessenger";

interface CitationInfo {
  url: string;
  title: string;
  favicon: string;
}

interface CitationsProps {
  citations: string[];
  className?: string;
}

const CitationCard = ({ url }: { url: string }) => {
    const ideMessenger = useContext(IdeMessengerContext);

  const [info, setInfo] = useState<CitationInfo>({
    url,
    title: new URL(url).hostname,
    favicon: `https://www.google.com/s2/favicons?domain=${url}&size=128`
  });

  useEffect(() => {
    const fetchPageInfo = async () => {
      try {
        const res = await ideMessenger.request("getUrlTitle", url);
        setInfo(prev => ({
          ...prev,
          title: res
        }));
      } catch (error) {
        console.error('Failed to fetch page info:', error);
      }
    };
    fetchPageInfo();
  }, []);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-shrink-0 w-40 text-xs px-3 bg-sidebar-background rounded-md hover:shadow-md hover:opacity-70 hover:text-foreground transition-shadow duration-200 group no-underline"
    >
      <div className="flex flex-col">
        <div className="font-medium py-2 h-[3rem] text-foreground line-clamp-3  no-underline">
          {info.title}
        </div>
        <div className="flex items-center space-x-2">
          <img 
            src={info.favicon} 
            alt="" 
            className="w-4 h-4 rounded-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'default-favicon.png';
            }}
          />
          <p className="text-xs py-2 m-0 text-input-foreground text-button truncate no-underline">
            {new URL(info.url).hostname}
          </p>
        </div>
      </div>
    </a>
  );
};

export const Citations = ({ citations, className }: CitationsProps) => {
  if (!citations?.length) return null;

  return (
    <div className={cn("mb-4", className)}>
      <div className="font-base my-2 text-sm text-muted-foreground">Citations:</div> 
      <div className="overflow-x-auto pb-2">
        <div className="flex space-x-4">
          {citations.map((citation, i) => (
            <CitationCard key={i} url={citation} />
          ))}
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-transparent via-input to-transparent mt-2 opacity-50" />
    </div>
  );
};
