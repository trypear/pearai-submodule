import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import * as React from "react";
import HeaderButtonWithText from "@/components/HeaderButtonWithText";
import { TrashIcon, Pencil2Icon, ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

interface Memory {
  id: string;
  content: string;
  timestamp: string;
}

// todo: fetch memories from API and show max 4 per page
const DUMMY_MEMORIES: Memory[] = [
    {
      id: "1",
      content: "Frequently uses Axios for HTTP requests and Lodash for utility functions.",
      timestamp: "Yesterday"
    },
    {
      id: "2",
      content: "Often encounters issues with async/await syntax, particularly in error handling.",
      timestamp: "Yesterday"
    },
    {
      id: "3",
      content: "Prefers writing unit tests with Jest and follows the AAA (Arrange, Act, Assert) pattern.",
      timestamp: "Yesterday"
    },
    {
      id: "4",
      content: "Uses Z-shell with custom aliases for git commands and directory navigation.",
      timestamp: "Yesterday"
    },
    {
      id: "5",
      content: "Prefers using VS Code's built-in debugger instead of logging statements for troubleshooting.",
      timestamp: "Yesterday"
    },
    {
      id: "6",
      content: "Regular user of Docker for development environment consistency.",
      timestamp: "2 days ago"
    },
    {
      id: "7",
      content: "Familiar with React hooks, especially useState and useEffect.",
      timestamp: "2 days ago"
    }
  ];

export const lightGray = "#999998";


export default function Mem0GUI() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newMemoryContent, setNewMemoryContent] = useState("");
  const [memories, setMemories] = useState<Memory[]>(DUMMY_MEMORIES);

  const searchRef = React.useRef<HTMLDivElement>(null)
  const memoriesPerPage = 4;

  const handleAddNewMemory = () => {
    const newMemory: Memory = {
      id: Date.now().toString(), // temporary ID generation
      content: "",
      timestamp: "Just now"
    };
    
    setMemories(prev => [newMemory, ...prev]); // Add to beginning of list
    setEditedContent(""); // Clear edited content
    setEditingId(newMemory.id); // Automatically enter edit mode

    // todo: api call to add memory in mem0
  };


  // Handle edit button click
  const onEdit = (memory: Memory) => {
    setEditingId(memory.id);
    setEditedContent(memory.content);
  }

  // Handle save edit
  const handleSaveEdit = () => {
    setMemories(prevMemories => 
      prevMemories.map(memory => 
        memory.id === editingId
          ? { ...memory, content: editedContent }
          : memory
      )
    );
    
    // Reset editing state
    setEditingId(null);
    setEditedContent("");
  }

  // Handle cancel edit
  const handleCancelEdit = (memory: Memory) => {
    if (memory.content === "") {
        // If this was a new memory, remove it
        setMemories(prev => prev.filter(m => m.id !== memory.id));
      }
    setEditingId(null);
    setEditedContent("");
  }

    // Update filteredMemories to use memories state
    const filteredMemories = React.useMemo(() => {
        return memories.filter(memory => 
        memory.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, memories]);
  

  // Get total pages based on filtered results
  const totalPages = Math.ceil(filteredMemories.length / memoriesPerPage);

  // Reset to first page when search query changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const getCurrentPageMemories = () => {
    const startIndex = (currentPage - 1) * memoriesPerPage;
    const endIndex = startIndex + memoriesPerPage;
    return filteredMemories.slice(startIndex, endIndex);
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }

  const handleDelete = (memoryId: string) => {
    // Remove from local state
    setMemories(prevMemories => 
    prevMemories.filter(memory => memory.id !== memoryId))
  };

  // Handle clicking outside of search to collapse it
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsExpanded(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="flex flex-col h-full bg-background p-4">
        <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold">PearAI Memory Control Panel</h2>
            <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAddNewMemory}
            className="hover:bg-input/90"
          >
            <Plus className="h-5 w-5" />
          </Button>
          <div
            ref={searchRef}
            className={`relative transition-all duration-200 ease-in-out mr-12 ${
              isExpanded ? "w-[250px]" : "w-[120px]"
            }`}
          >   
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={18} />
            <Input
              type="text"
              placeholder="Search memories"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-10 text-foreground bg-input rounded-xl"
              onFocus={() => setIsExpanded(true)}
            />
          </div>
        </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
        {getCurrentPageMemories().map((memory: Memory) => (
          <Card key={memory.id} className="p-2 bg-input hover:bg-input/90 transition-colors mx-auto">
            <div className="flex justify-between items-start">
            {editingId === memory.id ? (
                <div className="flex-1">
                    <div className="mr-6">
                        <Input
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full bg-background text-foreground border border-input"
                        placeholder="Write a memory..."
                        autoFocus
                    />
                    </div>
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
                      onClick={handleSaveEdit}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground ml-2">{memory.content}</p>
              )}
              {!editingId && (
                <div className="flex gap-1 ml-4">
                  <HeaderButtonWithText text="Edit Memory">
                    <Pencil2Icon
                      color={lightGray}
                      width="1.2em"
                      height="1.2em"
                      onClick={() => onEdit(memory)}
                    />
                  </HeaderButtonWithText>
                  <HeaderButtonWithText text="Delete Memory">
                    <TrashIcon
                      color={lightGray}
                      width="1.2em"
                      height="1.2em"
                      onClick={() => handleDelete(memory.id)}
                    />
                  </HeaderButtonWithText>
                </div>
              )}
            </div>
            {editingId !== memory.id && <p className="text-xs text-muted-foreground mt-1 ml-2">{memory.timestamp}</p>}
          </Card>
        ))}
      </div>

      <div className="flex justify-end mt-2 mb-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <HeaderButtonWithText
            disabled={currentPage === 1}
            className={`px-2 py-1 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:text-foreground'}`}
          >
            <ChevronLeftIcon
                color={lightGray} 
                width="1.2em"
                height="1.2em"
                onClick={handlePrevPage}
            />
          </HeaderButtonWithText>
          {filteredMemories.length > 0 ? `${currentPage} of ${totalPages}` : '0 of 0'}
          <HeaderButtonWithText
            disabled={currentPage === totalPages}
            className={`px-2 py-1 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:text-foreground'}`}
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
    </div>
  );
}
