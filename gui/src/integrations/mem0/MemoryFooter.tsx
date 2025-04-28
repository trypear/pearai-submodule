import { Button } from "@/components/ui/button";
import HeaderButtonWithText from "@/components/HeaderButtonWithText";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { lightGray } from "./utils";

interface MemoryFooterProps {
    currentPage: number;
    totalPages: number;
    handlePrevPage: () => void;
    handleNextPage: () => void;
    hasMemories: boolean;
    isUpdating: boolean;
}

export function MemoryFooter({
    currentPage,
    totalPages,
    handlePrevPage,
    handleNextPage,
    hasMemories,
    isUpdating
}: MemoryFooterProps) {
    return (
        <div className="pb-2 flex items-center">
            {hasMemories && (
                <div className="flex flex-1 items-center">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <HeaderButtonWithText
                            disabled={currentPage === 1}
                            className={`px-2 py-1 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:text-foreground"
                                }`}
                        >
                            <ChevronLeftIcon
                                color={lightGray}
                                width="1.2em"
                                height="1.2em"
                                onClick={handlePrevPage}
                            />
                        </HeaderButtonWithText>
                        {`${currentPage} of ${totalPages}`}
                        <HeaderButtonWithText
                            disabled={currentPage === totalPages}
                            className={`px-2 py-1 ${currentPage === totalPages
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:text-foreground"
                                }`}
                        >
                            <ChevronRightIcon
                                color={lightGray}
                                width="1.2em"
                                height="1.2em"
                                onClick={handleNextPage}
                            />
                        </HeaderButtonWithText>
                    </div>
                </div>
            )}
        </div>
    );
} 