import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TrashIcon, Pencil2Icon } from "@radix-ui/react-icons";
import HeaderButtonWithText from "@/components/HeaderButtonWithText";
import { Memory } from "./types";
import { lightGray } from "./utils";
import { formatTimestamp } from "./utils";
import { Sparkles } from "lucide-react";

interface MemoryCardProps {
  memory: Memory;
  editingId: string | null;
  editedContent: string;
  editCardRef: React.RefObject<HTMLDivElement>;
  onEdit: (memory: Memory) => void;
  setEditedContent: (content: string) => void;
  handleCancelEdit: (memory: Memory) => void;
  handleUnsavedEdit: () => void;
  handleDelete: (id: string) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
}

export function MemoryCard({
  memory,
  editingId,
  editedContent,
  editCardRef,
  onEdit,
  setEditedContent,
  handleCancelEdit,
  handleUnsavedEdit,
  handleDelete,
  handleKeyPress
}: MemoryCardProps) {
  return (
    <Card
      className={`relative p-4 bg-background hover:bg-input/5 hover:cursor-pointer transition-all duration-300 mx-auto
        border border-[#754ae9]/20 hover:border-[#754ae9]/40
        ${memory.isDeleted ? 'opacity-50' : ''}
        ${memory.isModified ? 'border-l-4 border-l-[#754ae9]' : ''}
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#754ae9]/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity
        after:absolute after:w-1 after:right-0 after:top-0 after:bottom-0 after:bg-[#754ae9]/20 after:transition-all after:duration-300 hover:after:bg-[#754ae9]/40
        group
      `}
      onClick={() => editingId !== memory.id && onEdit(memory)}
    >
      <div className="relative z-10">
        <div className="flex justify-between items-start">
          {editingId === memory.id ? (
            <div ref={editCardRef} className="flex-1">
              <div className="mr-6">
                <Input
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full bg-background/50 text-foreground border border-[#754ae9]/30 focus:border-[#754ae9] transition-colors"
                  placeholder="Write a memory..."
                  autoFocus
                  onKeyDown={handleKeyPress}
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCancelEdit(memory)}
                  className="border-[#754ae9]/30 hover:bg-[#754ae9]/10"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleUnsavedEdit}
                  className="bg-[#754ae9] hover:bg-[#754ae9]/90"
                >
                  Save Memory
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col flex-1 space-y-2">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Sparkles className="w-4 h-4 text-[#754ae9] opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground leading-relaxed">{memory.content}</p>
                  <div className="flex gap-2 mt-1">
                    {memory.isNew && (
                      <span className="text-xs text-[#754ae9]">New Memory Fragment</span>
                    )}
                    {memory.isDeleted && (
                      <span className="text-xs text-red-500">Corrupted Memory</span>
                    )}
                    {memory.isModified && (
                      <span className="text-xs text-[#754ae9]">Modified Memory</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {!editingId && (
            <div className="flex gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <HeaderButtonWithText text="Edit Memory Fragment">
                <Pencil2Icon
                  className="w-4 h-4 text-[#754ae9] hover:text-[#754ae9]/80 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(memory);
                  }}
                />
              </HeaderButtonWithText>
              <HeaderButtonWithText text="Delete Memory Fragment">
                <TrashIcon
                  className="w-4 h-4 text-[#754ae9] hover:text-[#754ae9]/80 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(memory.id);
                  }}
                />
              </HeaderButtonWithText>
            </div>
          )}
        </div>
        {editingId !== memory.id && (
          <p className="text-xs text-[#754ae9]/70 mt-2 ml-7 font-mono">
            Memory Fragment • {formatTimestamp(memory.timestamp)}
          </p>
        )}
      </div>
    </Card>
  );
} 