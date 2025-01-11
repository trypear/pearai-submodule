import { cn } from "@/lib/utils";
import { History, HistorySource } from '../pages/history';
import { useEffect, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/16/solid";

export const HistorySidebar = ({ isOpen, onClose, from }: { isOpen: boolean; onClose: () => void; from: HistorySource }) => {
    const sidebarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        // document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    return (
        <div 
            ref={sidebarRef}
            className={cn("px-4 py-4 absolute rounded-xl right-0 top-0 bg-background border-r shadow-lg z-50 h-[95%] flex flex-col", 
            isOpen ? "w-72" : " hidden")}
        >
            <XMarkIcon className="h-6 w-6 ml-auto" onClick={onClose}/>
            <History from={from} onClose={onClose} />
        </div>
    );
};
