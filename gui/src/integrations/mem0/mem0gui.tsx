import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Plus, Brain, Sparkles, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import HeaderButtonWithText from "@/components/HeaderButtonWithText";
import { TrashIcon, Pencil2Icon, ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Badge } from "../../components/ui/badge";
import { useContext } from 'react';
import { IdeMessengerContext } from '../../context/IdeMessenger';
import { setMem0Memories } from "@/redux/slices/stateSlice";
import { RootState } from "@/redux/store";
import { useNavigate } from "react-router-dom";
import InventoryDetails from "../../components/InventoryDetails";
import { NoResultsView } from "./StatusViews";
import { EmptyView } from "./StatusViews";
import { UpdatingView } from "./StatusViews";
import { LoadingView } from "./StatusViews";
import { DisabledView } from "./StatusViews";
import { MemoryCard } from "./MemoryCard";
import { ActionButton, SearchBar } from "./components";


export interface Memory {
  id: string;
  content: string;
  timestamp: string;
  isNew?: boolean;
  isModified?: boolean;
  isDeleted?: boolean;
}

interface MemoryChange {
    type: 'edit' | 'delete' | 'new';
    id: string;
    content?: string; // For edits
}

export const lightGray = "#999998";

interface StatusCardProps {
    title: string;
    description: string;
    icon: 'brain' | 'search';
    showSparkles?: boolean;
    animate?: boolean;
    secondaryDescription?: string;
}

function StatusCard({ title, description, icon, showSparkles = false, animate = false, secondaryDescription = "" }: StatusCardProps) {
    return (
      <Card className="p-16 bg-input hover:bg-input/90 transition-colors mx-auto">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {icon === 'brain' ? (
              <Brain className={`w-16 h-16 ${animate ? 'animate-pulse' : ''}`} />
            ) : (
              <Search className="w-16 h-16" />
            )}
            {showSparkles && (
              <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            )}
          </div>
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs text-center">
            {description}
          </p>
          {secondaryDescription && <p className="mt-2 text-sm text-muted-foreground max-w-xs text-center">
            {secondaryDescription}
          </p>}
        </div>
      </Card>
    )
  }

function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Check if same day
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    }
    // Check if yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    // Check if within last week
    if (date > oneWeekAgo) {
      return 'This week';
    }
    // Otherwise return formatted date
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

export function DeprecatedMem0GUI() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const ideMessenger = useContext(IdeMessengerContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const memories = useSelector(
    (store: RootState) => store.state.memories,
  );
  const isEnabled = (useSelector((state: RootState) => state.state.config.integrations || [])).find(i => i.name === 'mem0').enabled;

  // for batch edits
  const [unsavedChanges, setUnsavedChanges] = useState<MemoryChange[]>([]);
  const [originalMemories, setOriginalMemories] = useState<Memory[]>([]);

  const searchRef = useRef<HTMLDivElement>(null)
  const editCardRef = useRef<HTMLDivElement>(null);
  const memoriesPerPage = 4;

  const fetchMemories = async () => {
    try {
        setIsLoading(true);
        // get all memories
        const response = await ideMessenger.request('mem0/getMemories', undefined);
        const memories = response.map((memory) => ({
            id: memory.id,
            content: memory.memory,
            timestamp: memory.updated_at || memory.created_at,
            isModified: false,
            isDeleted: false,
            isNew: false
        }));
        dispatch(setMem0Memories(memories));
        setOriginalMemories(memories);
    } catch (error) {
        console.error('Failed to fetch memories:', error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleAddNewMemory = () => {
    // reset search query if any
    setSearchQuery('');
    setIsExpanded(false);

    const newMemory: Memory = {
      id: Date.now().toString(), // temporary ID generation, this should be the id value returned from the API
      content: "",
      timestamp: new Date().toISOString(),
      isNew: true  // handle creation on BE
    };
    dispatch(setMem0Memories([newMemory, ...memories])); // Add to beginning of list for edit mode on new memory
    setUnsavedChanges(prev => [...prev, {
        type: 'new',
        id: newMemory.id,
        content: ""
      }]);
    setEditedContent(""); // Clear edited content
    setEditingId(newMemory.id); // Automatically enter edit mode
  };


  // Handle edit button click
  const onEdit = (memory: Memory) => {
    setEditingId(memory.id);
    setEditedContent(memory.content);
  }

  const handleSaveAllChanges = async () => {
    try {
        setUnsavedChanges([]);
        setIsUpdating(true);
        setIsLoading(true);
        const response = await ideMessenger.request('mem0/updateMemories', {
          changes: unsavedChanges
        });

        if (response) {
            await fetchMemories();
        }
      } catch (error) {
        console.error('Failed to save memories:', error);
      } finally {
        setIsLoading(false);
        setIsUpdating(false);
      }

    setEditingId(null);
    setEditedContent("");
  };

  const handleCancelAllChanges = () => {
    dispatch(setMem0Memories(originalMemories.map(memory => ({
        ...memory,
        isModified: false,
        isDeleted: false,
        isNew: false
      }))));

    setUnsavedChanges([]);
    setEditingId(null);
    setEditedContent("");
  };

  // batch edit
  const handleUnsavedEdit = () => {
    if (!editingId) return;
    const memory = memories.find(m => m.id === editingId);
    if (editedContent === memory.content) {
        setEditingId(null);
        setEditedContent("");
        return
    };
    if (editedContent === '') {
        handleDelete(memory.id);
        setEditingId(null);
        setEditedContent("");
        return
    }

    // Update or add to unsaved changes
    setUnsavedChanges(prev => {
        const existingChangeIndex = prev.findIndex(change => change.id === editingId);
        if (existingChangeIndex >= 0) {
            // Update existing change
            const newChanges = [...prev];
            newChanges[existingChangeIndex] = {
                ...newChanges[existingChangeIndex],
                content: editedContent
            };
            return newChanges;
        } else {
            // Add new change
            return [...prev, {
                type: memory.isNew ? 'new' : 'edit',
                id: editingId,
                content: editedContent
            }];
        }
    });

    dispatch(setMem0Memories(
      memories.map(memory =>
        memory.id === editingId
          ? { ...memory, content: editedContent, isModified: true }
          : memory
      )
    ));

    setEditingId(null);
    setEditedContent("");
  };

  // Handle cancel edit
  const handleCancelEdit = (memory: Memory) => {
    if (memory.content === "") {
        // If this was a new memory, remove it
        // setMemories(prev => prev.filter(m => m.id !== memory.id));
        dispatch(setMem0Memories(memories.filter(m => m.id !== memory.id)));
      }
    setEditingId(null);
    setEditedContent("");
  }

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (editCardRef.current && !editCardRef.current.contains(event.target as Node)) {
        if (editingId) {
            const memory = memories.find(m => m.id === editingId);
            handleCancelEdit(memory);
        }
      }
    }

    if (editingId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [editingId]);

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUnsavedEdit();
    }
  };

   // Update filteredMemories to use memories state
  const filteredMemories = useMemo(() => {
    return memories.filter(memory =>
    memory.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, memories]);


  // Get total pages based on filtered results
  const totalPages = Math.ceil(filteredMemories.length / memoriesPerPage);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (memories.length === 0) {
      fetchMemories();
    }
  }, []);

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
    setUnsavedChanges(prev => {
        // Remove any existing changes for this memory ID
        const filteredChanges = prev.filter(change => change.id !== memoryId);
        // Add the delete change
        return [...filteredChanges, { type: 'delete', id: memoryId }];
    });

    dispatch(setMem0Memories(memories.map(memory =>
        memory.id === memoryId
            ? { ...memory, isDeleted: true }
            : memory
        )));
  };

  // Handle clicking outside of search to collapse it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsExpanded(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const renderContent = () => {
    // return <EmptyView />
    // return <DisabledView hasUnsavedChanges={unsavedChanges.length > 0} />
    if (unsavedChanges.length > 0 || !isEnabled) {
      return <DisabledView hasUnsavedChanges={unsavedChanges.length > 0} />;
    }

    if (isLoading) {
      return isUpdating ? <UpdatingView /> : <LoadingView />;
    }

    if (memories.length === 0) {
      return <EmptyView onAddMemory={handleAddNewMemory} />;
    }

    if (filteredMemories.length === 0) {
      return <NoResultsView />;
    }

    return getCurrentPageMemories().map((memory: Memory) => (
      // <MemoryCard
      //   key={memory.id}
      //   memory={memory}
      //   editingId={editingId}
      //   editedContent={editedContent}
      //   editCardRef={editCardRef}
      //   onEdit={onEdit}
      //   setEditedContent={setEditedContent}
      //   handleCancelEdit={handleCancelEdit}
      //   handleUnsavedEdit={handleUnsavedEdit}
      //   handleDelete={handleDelete}
      //   handleKeyPress={handleKeyPress}
      // />
      <div>
        deprecated mem0 Mem0GUI
      </div>
    ));
  };

  return (
    <div className="flex flex-col p-3 pb-3 h-screen">
      {!(unsavedChanges.length > 0 || !isEnabled || isLoading || isUpdating || memories.length === 0) &&
        (<div className="flex items-center justify-between">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <div className="flex items-center gap-2">
            <ActionButton
              icon={RotateCcw}
              tooltip="Refresh memories"
              onClick={fetchMemories}
              disabled={isLoading}
            />
            <ActionButton
              icon={Plus}
              tooltip="Add a new memory"
              onClick={handleAddNewMemory}
              disabled={!!searchQuery || isExpanded}
            />

          </div>
        </div>
        )
      }


        <div className="flex-1 overflow-y-auto space-y-3">
        {isLoading ? (
            isUpdating ? (
                <StatusCard
                title="Updating Memories..."
                description="Please wait while we save your changes."
                icon="brain"
                showSparkles
                animate
                />
            ) : (
                <StatusCard
                title="Loading Memories..."
                description="Please wait while we fetch your memories."
                icon="brain"
                animate
                />
            )
            ) : memories.length === 0 ? (
            <StatusCard
                title="No Memories Yet"
                description="PearAI will automatically generate memories by learning about your coding style and preferences as we chat! "
                icon="brain"
                showSparkles
                secondaryDescription="You can also add memories manually by clicking the + button above!"
            />
            ) : filteredMemories.length === 0 ? (
            <StatusCard
                title="No Memories Found"
                description="No memories match your search."
                icon="search"
            />
            )  :
        getCurrentPageMemories().map((memory: Memory) => (
          <Card
          key={memory.id}
          className={`p-2 bg-input hover:bg-input/90 hover:cursor-pointer transition-colors mx-auto
            ${memory.isDeleted ? 'opacity-50' : ''}
            ${memory.isModified ? 'border-l-4 border-l-yellow-500' : ''}`}
            onClick={() => editingId !== memory.id && onEdit(memory)}
          >
            <div className="flex justify-between items-start">
            {editingId === memory.id ? (
                <div ref={editCardRef} className="flex-1">
                    <div className="mr-6">
                        <Input
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full bg-background text-foreground border border-input"
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
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleUnsavedEdit}
                    >
                      Save Draft
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-2 ml-2">
                        <p className="text-sm text-foreground">{memory.content}</p>
                        {
                        memory.isNew ? (
                            <span className="text-xs text-green-500">(new)</span>
                        ) : memory.isDeleted ? (
                            <div className="flex-row items-center gap-2">
                                <span className="text-xs text-red-500">(deleted)</span>
                                <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Remove the delete change
                                    setUnsavedChanges(prev => prev.filter(change =>
                                    !(change.type === 'delete' && change.id === memory.id)
                                    ));

                                    // Restore the memory
                                    dispatch(setMem0Memories(memories.map(m =>
                                    m.id === memory.id
                                        ? { ...m, isDeleted: false }
                                        : m
                                    )));
                                }}
                                className="px-2 py-1 h-6 text-xs"
                                >
                                Undo
                                </Button>
                            </div>
                        ) : memory.isModified && <span className="text-xs text-yellow-500">(modified)</span>
                        }
                    </div>
                </div>
              )}
              {!editingId && (
                <div className="flex gap-1 ml-4">
                  <HeaderButtonWithText text="Edit Memory">
                    <Pencil2Icon
                      color={lightGray}
                      width="1.2em"
                      height="1.2em"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(memory)
                    }}
                    />
                  </HeaderButtonWithText>
                  <HeaderButtonWithText text="Delete Memory">
                    <TrashIcon
                      color={lightGray}
                      width="1.2em"
                      height="1.2em"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(memory.id);
                      }}
                    />
                  </HeaderButtonWithText>
                </div>
              )}
            </div>
            {editingId !== memory.id && <p className="text-xs text-muted-foreground mt-1 ml-2">{formatTimestamp(memory.timestamp)}</p>}
            </Card>
        ))}
      </div>


        <div className="mt-6 mb-4 flex items-center">
            {/* Centered Save/Cancel buttons */}
            {unsavedChanges.length > 0 && (
                <div className="absolute left-1/2 transform -translate-x-1/2 gap-2">
                <Button
                    variant="outline"
                    onClick={handleCancelAllChanges}
                    className="text-sm"
                >
                    Cancel Changes
                </Button>
                <Button
                    onClick={handleSaveAllChanges}
                    className="text-sm"
                >
                    Save All Changes
                </Button>
                </div>
            )}

            <div className="flex flex-1 justify-end mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {filteredMemories.length > 0 && (
                        <>
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
                            {`${currentPage} of ${totalPages}`}
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
                        </>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}

export default function Mem0GUI() {
  return (
    <div>
      This Mem0GUI is deprecated. Please use the new sidebarMem0GUI instead.
    </div>
  )
}
