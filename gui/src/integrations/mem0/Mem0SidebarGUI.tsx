import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Plus, RotateCcw } from "lucide-react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { useContext } from 'react';
import { IdeMessengerContext } from '../../context/IdeMessenger';
import { setMem0Memories } from "@/redux/slices/stateSlice";
import { RootState } from "@/redux/store";
import { useNavigate } from "react-router-dom";
import { getLogoPath } from "@/pages/welcome/setup/ImportExtensions";
import { Memory, MemoryChange } from "./types";
import { SearchBar, ActionButton, StatusCard } from "./components";
import { MemoryCard } from "./MemoryCard";
import { Button } from "@/components/ui/button";
import HeaderButtonWithText from "@/components/HeaderButtonWithText";
import { lightGray } from "./utils";
import {
  DisabledView,
  UpdatingView,
  LoadingView,
  EmptyView,
  NoResultsView,
} from "./StatusViews";
import { MemoryFooter } from "./MemoryFooter";

const MEMORIES_PER_PAGE = 4;

export default function Mem0SidebarGUI() {
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
  const isEnabled = (useSelector((state: RootState) => state.state.config.integrations || [])).find(i => i.name === 'mem0')?.enabled;

  // for batch edits
  const [unsavedChanges, setUnsavedChanges] = useState<MemoryChange[]>([]);
  const [originalMemories, setOriginalMemories] = useState<Memory[]>([]);

  const searchRef = useRef<HTMLDivElement>(null)
  const editCardRef = useRef<HTMLDivElement>(null);

  const fetchMemories = async () => {
    try {
      setIsLoading(true);
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

    // Reset unsaved changes and editing state
    setUnsavedChanges([]);
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
  const totalPages = Math.ceil(filteredMemories.length / MEMORIES_PER_PAGE);

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
    const startIndex = (currentPage - 1) * MEMORIES_PER_PAGE;
    const endIndex = startIndex + MEMORIES_PER_PAGE;
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
    const isEditingNewMemory = editingId && unsavedChanges.some(change => change.type === 'new' && change.id === editingId);

    if (isLoading) {
      return isUpdating ? <UpdatingView /> : <LoadingView />;
    }

    if (!isEditingNewMemory && unsavedChanges.length > 0 && !isEnabled) {
      return <DisabledView hasUnsavedChanges={unsavedChanges.length > 0} />;
    }

    if (memories.length === 0) {
      return <EmptyView onAddMemory={handleAddNewMemory} />;
    }

    if (filteredMemories.length === 0) {
      return <NoResultsView />;
    }

    return (
      <div className="h-full pr-2">
        {getCurrentPageMemories().map((memory: Memory) => (
          <MemoryCard
            key={memory.id}
            memory={memory}
            editingId={editingId}
            editedContent={editedContent}
            editCardRef={editCardRef}
            onEdit={onEdit}
            setEditedContent={setEditedContent}
            handleCancelEdit={handleCancelEdit}
            handleUnsavedEdit={handleUnsavedEdit}
            handleDelete={handleDelete}
            handleKeyPress={handleKeyPress}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full px-3 py-1">
      <header className="flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <div className="flex items-center gap-2">
            <ActionButton
              icon={Plus}
              tooltip="Add a new memory"
              onClick={handleAddNewMemory}
              disabled={!!searchQuery || isExpanded}
            />
            <ActionButton
              icon={RotateCcw}
              tooltip="Refresh memories"
              onClick={fetchMemories}
              disabled={isLoading}
            />
          </div>
        </div>
      </header>

      <div className={`flex-1 ${memories.length === 0 ?  'absolute inset-x-0 px-2': 'space-y-3 overflow-hidden'}`}>
        {renderContent()}
      </div>

      <MemoryFooter
        unsavedChanges={unsavedChanges.length > 0}
        handleCancelAllChanges={handleCancelAllChanges}
        handleSaveAllChanges={handleSaveAllChanges}
        currentPage={currentPage}
        totalPages={totalPages}
        handlePrevPage={handlePrevPage}
        handleNextPage={handleNextPage}
        hasMemories={filteredMemories.length > 0}
        isUpdating={isUpdating}
      />
    </div>
  );
}
