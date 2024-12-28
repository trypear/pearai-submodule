import { cn } from "@/lib/utils";
import { History, HistorySource } from '../pages/history';
import { useEffect, useRef } from "react";

export const HistorySidebar = ({ isOpen, onClose, from }: { isOpen: boolean; onClose: () => void; from: HistorySource }) => {
    const sidebarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    return (
        <div 
            ref={sidebarRef}
            className={cn("absolute left-0 top-0 bg-background border-r shadow-lg z-50 transition-all duration-200 h-full flex flex-col", 
            isOpen ? "w-72 translate-x-0" : "-translate-x-full hidden")}
        >
            <History from={from} onClose={onClose} />
        </div>
    );
};
