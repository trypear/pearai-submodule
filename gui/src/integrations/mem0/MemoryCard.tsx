import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// import { Pencil1Icon } from "@radix-ui/react-icons";
import { PencilIcon } from "@heroicons/react/24/outline";
import { TrashIcon } from "@heroicons/react/24/outline";
import HeaderButtonWithText from "@/components/HeaderButtonWithText";
import { Memory } from "./types";
import { lightGray } from "./utils";
import { formatTimestamp } from "./utils";

interface MemoryCardProps {
  memory: Memory;
  editingId: string | null;
  editedContent: string;
  editCardRef: React.RefObject<HTMLDivElement>;
  onEdit: (memory: Memory) => void;
  setEditedContent: (content: string) => void;
  handleCancelEdit: (memory: Memory) => void;
  handleSaveMemory: (id: string, content: string) => void;
  handleDelete: (id: string) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  validationError: string;
}

export function MemoryCard({
  memory,
  editingId,
  editedContent,
  editCardRef,
  onEdit,
  setEditedContent,
  handleCancelEdit,
  handleSaveMemory,
  handleDelete,
  handleKeyPress,
  validationError
}: MemoryCardProps) {
  return (
    <div
      className={`p-3 mt-2 rounded-xl flex flex-col gap-2 bg-input hover:bg-input/90 hover:cursor-pointer transition-colors mx-auto
        ${memory.isDeleted ? 'opacity-50' : ''}
        ${memory.isModified ? 'border-l-4 border-l-yellow-500' : ''}`}
      onClick={() => editingId !== memory.id && onEdit(memory)}
      style={{
        backgroundColor: "var(--vscode-editor-background)"
      }}
    >
      <div className="flex justify-between items-start">
        {editingId === memory.id ? (
          <div ref={editCardRef} className="flex-1">
            <div className="mr-6">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full bg-background text-foreground border-none resize-y min-h-[100px] p-2 rounded-md outline-none focus:outline-none font-inherit"
                placeholder="Write a memory..."
                autoFocus
                onKeyDown={handleKeyPress}
                style={{
                  backgroundColor: "var(--vscode-sideBar-background)",
                  fontFamily: "inherit"
                }}
              />
            </div>
            {validationError && <div className="text-red-500 text-sm mt-1 mb-2">{validationError}</div>}
            <div className="flex justify-end gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCancelEdit(memory)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => handleSaveMemory(memory.id, editedContent)}
              >
                Save Memory
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1">
            <div className="flex items-center gap-2">
              <div className="text-sm text-foreground">{memory.content}</div>
              {memory.isNew && <span className="text-xs text-green-500">(new)</span>}
              {memory.isDeleted && <span className="text-xs text-red-500">(deleted)</span>}
              {memory.isModified && <span className="text-xs text-yellow-500">(modified)</span>}
            </div>
          </div>
        )}
      </div>
      {editingId !== memory.id && (
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            {formatTimestamp(memory.timestamp)}
          </div>
          {!editingId && (
            <div className="flex gap-1">
              <HeaderButtonWithText text="Edit Memory">
                <PencilIcon
                  color={lightGray}
                  width="1em"
                  height="1em"
                  strokeWidth={2}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(memory);
                  }}
                />
              </HeaderButtonWithText>
              <HeaderButtonWithText text="Delete Memory">
                <TrashIcon
                  color="#FF6359"
                  width="1.2em"
                  height="1.2em"
                  strokeWidth={2}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(memory.id);
                  }}
                />
              </HeaderButtonWithText>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 