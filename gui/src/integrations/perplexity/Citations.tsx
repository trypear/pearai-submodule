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
      className="flex-shrink-0 w-64 p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 group"
    >
      <div className="flex items-center space-x-3">
        <img 
          src={info.favicon} 
          alt="" 
          className="w-6 h-6 rounded"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'default-favicon.png';
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
            {info.title}
          </p>
          <p className="text-xs text-gray-500 truncate">
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
      <div className="font-medium mb-2 text-sm text-gray-700">Citations:</div>
      <div className="overflow-x-auto pb-2">
        <div className="flex space-x-4">
          {citations.map((citation, i) => (
            <CitationCard key={i} url={citation} />
          ))}
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent mt-2 opacity-50" />
    </div>
  );
};
