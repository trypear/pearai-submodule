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