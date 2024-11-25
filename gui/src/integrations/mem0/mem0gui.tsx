import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import * as React from "react";
import HeaderButtonWithText from "@/components/HeaderButtonWithText";
import { TrashIcon, Pencil2Icon } from "@radix-ui/react-icons";

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
  }
];

export const lightGray = "#999998";

export default function Mem0GUI() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = React.useState(false)
  const searchRef = React.useRef<HTMLDivElement>(null)

  const onDelete = () => {
    // todo
    console.dir("delete pressed")
  }

  const onEdit = () => {
    // todo
    console.dir("edit pressed")
  }

  // todo: handle search query by filtering the results

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
            <div
            ref={searchRef}
            className={`relative transition-all duration-200 ease-in-out mr-14 ${
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

      <div className="flex-1 overflow-y-auto space-y-2">
        {DUMMY_MEMORIES.map((memory) => (
          <Card key={memory.id} className="p-4 bg-input hover:bg-input/90 transition-colors">
            <div className="flex justify-between items-start">
              <p className="text-sm text-foreground">{memory.content}</p>
              <div className="flex gap-1">
                <HeaderButtonWithText text="Edit Memory">
                    <Pencil2Icon
                        color={lightGray}
                        width="1.2em"
                        height="1.2em"
                        onClick={onEdit}
                    />
                </HeaderButtonWithText>
                <HeaderButtonWithText text="Delete Memory">
                    <TrashIcon
                        color={lightGray}
                        width="1.2em"
                        height="1.2em"
                        onClick={onDelete}
                    />
                </HeaderButtonWithText>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{memory.timestamp}</p>
          </Card>
        ))}
      </div>

      <div className="flex justify-between mt-4">
        <p className="text-sm text-muted-foreground">1 of 3</p>
        <div className="flex gap-2">
            {/* todo: onclick for cancel -> go back */}
          <Button variant="outline" size="sm">Cancel</Button>
          {/* todo: onclick for save -> shoot api calls to make changes. Can mem0 do batch update? */}
          <Button size="sm">Save</Button>
        </div>
      </div>
    </div>
  );
}
