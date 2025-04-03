import * as vscode from 'vscode';
import { assert } from '../../util/assert';
import type { FromCoreProtocol, ToCoreProtocol } from "../../../../../core/protocol";
import type { IMessenger } from "../../../../../core/util/messenger";
import { ProtocolGeneratorType, ToCoreFromIdeOrWebviewProtocol } from 'core/protocol/core';
import { MessageContent, ChatMessage } from 'core';

/**
 * Interface for the Creator Mode API
 * Provides methods and events for controlling the Creator Mode UI and functionality
 */
export interface IPearAICreatorMode {
  /**
   * Whether the creator mode interface is currently opened
   */
  readonly isCreatorModeActive: boolean;

  /**
   * Event that fires when the creator mode is activated or deactivated
   */
  readonly onDidChangeCreatorModeState: vscode.Event<boolean>;

  /**
   * Event that fires when a new task should be created
   * Other extensions can listen to this event to handle task creation
   */
  readonly onDidRequestNewTask: vscode.Event<CreatorTaskRequest>;

  /**
   * Event that fires when a plan has been created and needs to be executed
   */
  readonly onDidRequestExecutePlan: vscode.Event<ExecutePlanRequest>;

  /**
   * Opens the creator mode interface
   * @returns A Promise that resolves when the interface is opened
   */
  openCreatorMode(): Promise<void>;

  /**
   * Closes the creator mode interface
   * @returns A Promise that resolves when the interface is closed
   */
  closeCreatorMode(): Promise<void>;

  /**
   * Creates a new task in creator mode
   * @param task The task details
   * @returns A Promise that resolves when the task is created
   */
  createTask(task: CreatorTaskRequest): Promise<void>;

  /**
   * Disposes of resources used by the creator mode
   */
  dispose(): void;
}

/**
 * Represents a request to create a new task in creator mode
 */
export interface CreatorTaskRequest {
  /**
   * The text of the task
   */
  initialPrompt: string;
  
  /**
   * The plan that the AI generated with the user
   */
  plan: string;

  /**
   * The file path of the new task?
   * TODO: are we going to pass this through?
   */
  // filePath?: string;

  /**
   * Optional base64-encoded images to include with the task
   * TODO: are we doing images?
   */
  images?: string[];
}

/**
 * Represents a request to execute a plan
 */
export interface ExecutePlanRequest {
  /**
   * The path to the file containing the plan
   */
  filePath?: string;
  
  /**
   * Optional code to include in the plan execution
   */
  code?: string;
  
  /**
   * Additional context for the plan execution
   */
  context?: string;
}

/**
 * The format for all of the messages that come from the webview
 */
export interface WebViewMessageIncoming {
  destination: "creator";// making sure we route the message over to here
  messageType: string; // the "action" for the message - keeping format consistent with other areas
  messageId: string; // used to keep track of the messages, so we know which message is a reply to 
  payload: any; // for any misc data
}

// the message format already established in the webview protocol file
export interface WebMessageOutgoing {
  payload: any;
  messageId: string;
}

/**
 * Implementation of the Creator Mode API
 * Manages the creator mode interface state and events
 * TODO: GO OVER ALL OF THESE FUNCTIONS - THEY ARE PLACEHOLDERS AND THEY NEED MODIFYING
 */
export class PearAICreatorMode implements IPearAICreatorMode {
  // Private event emitters
  private readonly _onDidChangeCreatorModeState = new vscode.EventEmitter<boolean>();
  private readonly _onDidRequestNewTask = new vscode.EventEmitter<CreatorTaskRequest>();
  private readonly _onDidRequestExecutePlan = new vscode.EventEmitter<ExecutePlanRequest>();
  
  // Public events
  public readonly onDidChangeCreatorModeState = this._onDidChangeCreatorModeState.event;
  public readonly onDidRequestNewTask = this._onDidRequestNewTask.event;
  public readonly onDidRequestExecutePlan = this._onDidRequestExecutePlan.event;
  
  // Creator mode state
  private _isCreatorModeActive: boolean = false;
  
  // Disposables
  private _disposables: vscode.Disposable[] = [];

  constructor(
    private readonly messenger: IMessenger<ToCoreFromIdeOrWebviewProtocol, FromCoreProtocol>
  ) {
    // Add emitters to disposables
    this._disposables.push(
      this._onDidChangeCreatorModeState,
      this._onDidRequestNewTask,
      this._onDidRequestExecutePlan
    );
  }

  public dispose(): void {
    // Dispose of event emitters and other disposables
    this._disposables.forEach(d => d.dispose());
    this._disposables = [];
  }
  
  
  /**
   * Whether the creator mode interface is currently active
   */
  public get isCreatorModeActive(): boolean {
    return this._isCreatorModeActive;
  }
  
  /**
   * Opens the creator mode interface
   */
  public async openCreatorMode(): Promise<void> {
    if (this._isCreatorModeActive) {
      return; // Already open
    }
    
    try {
      // Execute the command to open the creator mode interface
      await vscode.commands.executeCommand('workbench.action.toggleCreatorView');
      this._isCreatorModeActive = true;
      this._onDidChangeCreatorModeState.fire(true);
    } catch (error) {
      console.error('Failed to open creator mode:', error);
      throw error;
    }
  }
  
  /**
   * Closes the creator mode interface
   */
  public async closeCreatorMode(): Promise<void> {
    if (!this._isCreatorModeActive) {
      return; // Already closed
    }

    try {
      // Close the creator mode interface
      await vscode.commands.executeCommand("workbench.action.closeCreatorView");
      this._isCreatorModeActive = false;
      this._onDidChangeCreatorModeState.fire(false);
    } catch (error) {
      console.error('Failed to close creator mode:', error);
      throw error;
    }
  }
  
  /**
   * Whenever we have a new task to execute, this create task method should be called
   * It will fire an event, which the roo code extension will listen to, then it will execute the task
   */
  public async createTask(task: CreatorTaskRequest): Promise<void> {
    

    this._onDidRequestNewTask.fire(task);
    // TODO: setup listeners in roo code
    // TODO: Go trigger creator mode view 
    // TODO: run animation to close overlay
  }
  
  /**
   * Registers commands necessary for creator mode functionality
   */
  // public registerCommands(context: vscode.ExtensionContext): void {
  //   // Register command to open creator mode
  //   const openCreatorModeCmd = vscode.commands.registerCommand('pearai.openCreatorMode', async () => {
  //     await this.openCreatorMode();
  //   });
    
  //   // Register command to close creator mode
  //   const closeCreatorModeCmd = vscode.commands.registerCommand('pearai.closeCreatorMode', async () => {
  //     await this.closeCreatorMode();
  //   });
    
  //   // Register command to create a task
  //   const createTaskCmd = vscode.commands.registerCommand('pearai.createCreatorTask', async (args: CreatorTaskRequest) => {
  //     await this.createTask(args);
  //   });
    
  //   // Register command to execute a plan
  //   const executePlanCmd = vscode.commands.registerCommand('psorPlan', async (args: ExecutePlanRequest) => {
  //     await this.executePlan(args);
  //   });
    
  //   // Add commands to context subscriptions
  //   context.subscriptions.push(
  //     openCreatorModeCmd,
  //     closeCreatorModeCmd,
  //     createTaskCmd,
  //     executePlanCmd
  //   );
    
  //   // Add to disposables for cleanup
  //   this._disposables.push(
  //     openCreatorModeCmd,
  //     closeCreatorModeCmd,
  //     createTaskCmd,
  //     executePlanCmd
  //   );
  // }


  public async handleIncomingWebViewMessage(msg: WebViewMessageIncoming, send: (payload: any) => Thenable<boolean>): Promise<void> {
    assert(!!msg.messageId || !!msg.messageType, "Message ID or type missing :(");
  
    if (msg.messageType === "NewIdea") {
      try {
        console.dir('GOT NewIdea');

        this.messenger.on("llm/streamChat", async function* (message): ProtocolGeneratorType<MessageContent> {
          const { messages, completionOptions, title } = message.data;
          
          // Stream each message as a response
          for (const msg of messages) {
            if (msg.role === 'user') {
              yield {
                done: false,
                content: msg.content,
              };
            }
          }

          // Return final response
          return {
            done: true,
            content: {
              role: 'assistant',
              content: 'Plan creation completed'
            }
          };
        })
        
        // Request plan creation from the LLM service
        const response = this.messenger.invoke("llm/streamChat", {
          title: "gpt-4", // or your configured model
          messages: [
            {
              role: "system",
              content: "You are a planning assistant. Create a clear, step-by-step plan for implementing the user's idea. Focus on technical implementation details and break down complex tasks into manageable steps."
            },
            {
              role: "user",
              content: msg.payload.text
            }
          ],
          completionOptions: {
            temperature: 0.7,
            maxTokens: 2000
          }
        });
  
        // console.dir("REQUESTED STREAM CHAT");
        // console.dir(response);
        // console.dir(typeof response);
        // console.dir(JSON.stringify(response));

        // return;
  
        // Type assertion to ensure response is treated as an AsyncGenerator
        const generator = response as AsyncGenerator<{
          done?: boolean;
          content: MessageContent;
        }>;
  
        // Stream the response chunks
        for await (const chunk of generator) {
          if ('content' in chunk) {
            await send({
              type: "planCreationStream",
              text: chunk.content
            });
          }
        }
  
        console.dir("STREAMED PLAN CREATION")
  
        // Signal completion
        await send({
          type: "planCreationSuccess"
        });
  
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Plan creation failed:", error);
        await send({
          type: "error",
          text: "Failed to create plan: " + errorMessage
        });
      }
    }
  
    if (msg.messageType === "Close") {
      await this.closeCreatorMode();
    }
  }
  
}