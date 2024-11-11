// components/Citations.tsx
import { useState, useEffect, useContext } from 'react';
import { cn } from "@/lib/utils";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { motion } from "framer-motion";
import { Citation } from 'core';


interface CitationInfo {
  url: string;
  title: string;
  favicon: string;
}

interface CitationsProps {
  citations: Citation[];
  className?: string;
  isLast: boolean;
}

const CitationCard = ({ citation }: { citation: Citation }) => {
  const favicon = `https://www.google.com/s2/favicons?domain=${citation.url}&size=128`;

  return (
    <a
      href={citation.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-shrink-0 w-40 text-xs px-3 bg-sidebar-background rounded-md hover:shadow-md hover:opacity-70 hover:text-foreground transition-shadow duration-200 group no-underline"
    >
      <div className="flex flex-col">
        <div className="font-medium py-2 h-[3rem] text-foreground line-clamp-3  no-underline">
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

export const Citations = ({ citations, className, isLast}: CitationsProps) => {
  if (!citations?.length) return null;

  const container = {
    hidden: { opacity: 1, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delayChildren: 2,
        staggerChildren: 2
      }
    }
  }
    
  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  return (
    <div className={cn("mb-4", className)}>
      <div className="font-base my-2 text-sm text-muted-foreground">Sources:</div> 
      <div className="overflow-x-auto pb-2">
        <div className="flex space-x-4 gap-2">
          <motion.div
          variants={container}
          initial={"hidden"}
          animate={"show"}
          style={{ display: 'contents' }}>
            {citations.map((citation, i) => (
              <motion.div
              key={i}
              variants={item}
              transition={{ duration: 0.3 }}
              style={{ display: 'contents' }}
            >
              <CitationCard citation={citation} />
            </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-transparent via-input to-transparent mt-2 opacity-50" />
    </div>
  );
};
