Mem0 is a service we use.
it takes ours chat msgs with ai and tries to extract out useful bits from it that can 
be used as memories in future chats.

right now its not working that good.
so we want to remove it.

instead, what we want is have our own local mechanism.

Current System:
- Uses Mem0 service to automatically extract memories from chat messages
- Has a full UI implementation for managing memories
- Stores memories on a remote server
- Integrates with VSCode through specific endpoints
Desired Changes:
- Remove Mem0 service integration
- Create a local memory storage system using JSON
- Allow users to manually create/manage memories
- Attach memories to first prompts in new chat sessions

Here's my proposed step-by-step plan:

Step 1: Create Local Storage Infrastructure
- Create a new JSON file structure for storing memories locally
- Define the location (same as config file)
- Create basic read/write functions for the JSON file

Step 2: Remove Mem0 Service Integration
- Remove server-side API calls to Mem0
- Remove Mem0-specific code from VSCode extension
- Keep the existing UI components as they can be reused

Step 3: Implement Local Memory Management
- Modify existing memory management functions to work with local JSON
- Update the memory CRUD operations
- Ensure proper error handling for file operations

Step 4: Update Memory Attachment
- Implement the mechanism to attach memories to new chat sessions
- Modify the chat initialization process



Later Task - full cleanup.
API to Local Structure Adaptation:
We're currently adapting between two memory structures:
API Memory (old Mem0 format):

interface Memory {
    id: string;
    memory: string;          // actual content
    created_at: string;
    updated_at: string;
    total_memories: number;  // not needed locally
    owner: string;          // not needed locally
    organization: string;   // not needed locally
    metadata: any;         // not needed locally
    type: string;         // not needed locally
}

Local Memory (our new format):
interface Memory {
    id: string;
    content: string;      // renamed from memory
    timestamp: string;    // simplified from created_at/updated_at
    isNew?: boolean;      // UI state
    isModified?: boolean; // UI state
    isDeleted?: boolean;  // UI state
}

The adaptation happens in localMemoryService.ts through the convertToAPIMemory and convertToLocalMemory functions. We could clean this up later by:
- Removing the API conversion entirely once we're sure no other parts of the system expect the old format
- Simplifying the memory interface to just id, content, and timestamp
- Moving UI state management to a separate layer

The main differences between the structures are:
Local Memory: Simple structure with id, content, and timestamp
API Memory: More complex with additional fields like owner, organization, metadata, etc

To clean this up in the future, you could:
Remove the API conversion layer entirely since it's no longer needed
Simplify the memory interface to just the essential fields
Update the chat system to work directly with the local memory format
Remove unused fields from the state management