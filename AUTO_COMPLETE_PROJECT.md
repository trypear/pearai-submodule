# Tab Auto-Complete Feature Architecture

## Key Files

1. `core/autocomplete/completionProvider.ts` - Main completion logic
2. `extensions/vscode/src/util/loadAutocompleteModel.ts` - Model loading and management
3. `core/autocomplete/postprocessing.ts` - Completion post-processing
4. `core/autocomplete/templates.ts` - Templates for different models
5. `core/autocomplete/ranking.ts` - Completion ranking logic
6. `core/autocomplete/languages.ts` - Completion languages logic
7. `core/core.ts` - Configuration for the model for the auto completion.
8. `core/index.d.ts` - Examples of the TabAutocomleteOptions
9. `core/autocomplete/cache.ts` - Cache for autocomplete
10. `core/autocomplete/constructPrompt.ts` - Prompt construction
11. `core/autocomplete/slidingWindow.ts` - More examples
12. `core/config/load.ts` - Loading

## Core Components

### CompletionProvider

The heart of the auto-complete feature is the `CompletionProvider` class in `completionProvider.ts`. It handles:

- Getting tab completions via `getTabCompletion()`
- Managing completion state and lifecycle
- Handling user acceptance/rejection of completions
- Caching completions for performance
- Error handling and telemetry

### TabAutocompleteModel

Located in `loadAutocompleteModel.ts`, this class manages:

- Model initialization and configuration
- Default model selection (Starcoder2 3b by default)
- Model switching and cleanup
- Integration with the global configuration

### Architecture Flow

1. **Trigger**: When a user presses tab, the VS Code extension activates the completion provider
2. **Input Processing**:
   - Current file contents and cursor position are captured
   - Recently edited files and ranges are collected
   - Clipboard content is included for context

3. **Completion Generation**:
   - The LLM (Language Model) generates completions based on the context
   - Templates are applied based on the selected model
   - Completions are post-processed for better quality

4. **Display and Interaction**:
   - Completions are shown inline in VS Code
   - Users can accept (tab) or reject (escape) suggestions
   - Accepted completions are logged for telemetry

### Configuration

The system uses a configuration key `tabAutocompleteModel` to manage:

- Model selection and configuration
- Performance parameters
- Caching settings
- Template customization
- Uses config.json in the user's profile directory (e.g. ~\.pearai\config.json)

### Advanced Features

1. **Caching**: Uses `AutocompleteLruCache` for performance
2. **Error Handling**: Sophisticated error management with selective error display
3. **Telemetry**: Tracks completion acceptance and performance metrics
4. **Multi-model Support**: Can switch between different AI models
5. **Context Awareness**: Uses file history and clipboard for better completions

### Integration Points

1. VS Code Extension API
2. Language Server Protocol (LSP) for definitions
3. Multiple AI model providers
4. File system for context gathering
5. Configuration system for customization

This architecture provides a robust, extensible system for AI-powered code completion that can be adapted for different models and use cases.

# Chat Auto-Complete Feature Plan

## New Components/Files

1. **New Files:**
   - `gui/src/components/mainInput/ChatAutocomplete.tsx` - Main auto-complete logic and UI
   - `gui/src/hooks/useChatAutocomplete.ts` - Custom hook for auto-complete functionality
   - `gui/src/services/chatAutocomplete.ts` - Service to handle model interactions

2. **Minimal Changes to Existing Files:**
   - `ContinueInputBox.tsx` - Add auto-complete component integration
   - `TipTapEditor.tsx` - Add event handlers for auto-complete triggers

## Technical Implementation Details

1. **Chat Auto-complete Service:**
   - Use existing model configuration from `tabAutocompleteModel` in config.json
   - Create streaming completion endpoint for real-time suggestions
   - Implement caching for better performance
   - Handle error cases gracefully

2. **Auto-complete Hook:**
   - Manage auto-complete state
   - Handle debounced input changes
   - Process model responses
   - Cache recent completions

3. **Auto-complete UI Implementation:**
   - Inline text suggestions with grey color/opacity
   - Suggestions appear directly after user's typed text
   - Keyboard navigation for multiple suggestions:
     - Arrow keys to navigate through suggestion parts
     - Tab to accept full/partial suggestion
     - Escape to dismiss
   - Cursor automatically moves to end of accepted text
   - Styling consistent with existing UI

4. **Context Management:**
   - Use recent chat history as context
   - Include current input text
   - Include relevant code context:
     - Active file contents
     - Related code snippets
     - Project structure context

5. **Model Prompting:**
   - Create specific prompts for chat completion
   - Example: "Given the conversation history and current input, predict the next few words the user might type..."
   - Include conversation style and tone matching
   - Consider code context in predictions when relevant

## Integration Points

1. **TipTap Editor Integration:**
   - Minimal changes to listen for typing events
   - Handle suggestion acceptance
   - Manage cursor position
   - Support for inline suggestion rendering

2. **Model Configuration:**
   - Read from user's config.json
   - Use same model as code auto-complete
   - Handle API errors gracefully
   - Should pay attention to how the tab code auto-complete feature is disabled, enabled, and if a tabAutocompleteModel does not exist in the config.json, then the chat auto-complete feature should be disabled.  

## Performance Considerations

1. Debounce input events (300ms)
2. Cache recent completions
3. Limit context window size
4. Stream responses for better UX

## Implementation Priority

1. Core auto-complete service with model integration
2. Basic inline suggestion UI
3. Context management with code awareness
4. Keyboard navigation and partial acceptance
5. Performance optimizations and caching
