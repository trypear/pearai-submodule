import { Button } from "@/components/ui/button";
import HeaderButtonWithText from "@/components/HeaderButtonWithText";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { lightGray } from "./utils";

interface MemoryFooterProps {
    unsavedChanges: boolean;
    handleCancelAllChanges: () => void;
    handleSaveAllChanges: () => void;
    currentPage: number;
    totalPages: number;
    handlePrevPage: () => void;
    handleNextPage: () => void;
    hasMemories: boolean;
}

export function MemoryFooter({
    unsavedChanges,
    handleCancelAllChanges,
    handleSaveAllChanges,
    currentPage,
    totalPages,
    handlePrevPage,
    handleNextPage,
    hasMemories
}: MemoryFooterProps) {
    return (
        <div className="mt-6 mb-4 flex items-center">
            {unsavedChanges && (
                <div className="absolute left-1/2 transform -translate-x-1/2 gap-2">
                    <Button
                        variant="outline"
                        onClick={handleCancelAllChanges}
                        className="text-sm"
                    >
                        Cancel Changes
                    </Button>
                    <Button onClick={handleSaveAllChanges} className="text-sm">
                        Save All Changes
                    </Button>
                </div>
            )}

            {hasMemories && (
                <div className="flex flex-1 justify-end">
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