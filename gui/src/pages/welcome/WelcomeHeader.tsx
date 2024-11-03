import React from 'react';
import { ArrowLongRightIcon } from "@heroicons/react/24/outline";
import { getMetaKeyLabel } from '@/util';
import { ArrowLeftIcon } from 'lucide-react';

interface WelcomeHeaderProps {
  onBack?: () => void;
  showBack?: boolean;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ onBack, showBack = true }) => {
  if (!showBack) return null;

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowLeft') {
        onBack?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  return (
    <div
    onClick={onBack}
    className="fixed top-3 left-6 cursor-pointer flex items-center justify-center gap-1"
    >
        <ArrowLongRightIcon className="w-4 h-4 rotate-180" />
        <span className="text-base text-center">Back</span>
        <span className="flex items-center gap-1 text-base">
            <kbd className="flex items-center justify-center w-3 h-3 text-base">{getMetaKeyLabel()}</kbd>
            <kbd className="flex items-center justify-center w-3 h-3"><ArrowLeftIcon className="w-3 h-3" /></kbd>
        </span>
    </div>
  );
};