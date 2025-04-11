import * as vscode from 'vscode';
import { assert } from '../../util/assert';
import { ChatMessage } from 'core';
import { Core } from 'core/core';
import { IMessenger } from 'core/util/messenger';
import { ToCoreFromIdeOrWebviewProtocol } from 'core/protocol/core';
import { FromCoreProtocol } from 'core/protocol';

/**
 * Interface for the Creator Mode API
 * Provides methods and events for controlling the Creator Mode UI and functionality
 */
export interface IPearAICreatorMode {
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
  openCreatorOverlay(): Promise<void>;

  /**
   * Closes the creator mode interface
   * @returns A Promise that resolves when the interface is closed
   */
  closeCreatorOverlay(): Promise<void>;

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
  // filePath?: string;

  /**
   * Optional code to include in the plan execution
   */
  // code?: string;

  /**
   * Additional context for the plan execution
   */
  plan?: string;
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

  // The abort token we can send to the LLM
  private cancelToken: AbortSignal | undefined;

  // Public events
  public readonly onDidChangeCreatorModeState = this._onDidChangeCreatorModeState.event;
  public readonly onDidRequestNewTask = this._onDidRequestNewTask.event;
  public readonly onDidRequestExecutePlan = this._onDidRequestExecutePlan.event;


  private creatorState: "PLANNING" | "CREATING" | "NONE" = "NONE";

  // Creator mode state
  // private _isCreatorModeActive: boolean = false;

  // Disposables
  private _disposables: vscode.Disposable[] = [];

  constructor(
    private readonly _messenger: IMessenger<ToCoreFromIdeOrWebviewProtocol, FromCoreProtocol>,
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
   * Opens the creator mode interface
   */
  public async openCreatorOverlay(): Promise<void> {
    try {
      // Execute the command to open the creator mode interface
      await vscode.commands.executeCommand('workbench.action.toggleCreatorView');
      this._onDidChangeCreatorModeState.fire(true);
    } catch (error) {
      console.error('Failed to open creator mode:', error);
      throw error;
    }
  }

  /**
   * Closes the creator mode interface
   */
  public async closeCreatorOverlay(): Promise<void> {

    try {
      // Close the creator mode interface
      await vscode.commands.executeCommand("workbench.action.closeCreatorView");
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
    // TODO: Go trigger creator mode view 
    // TODO: run animation to close overlay
  }


  public async handleIncomingWebViewMessage(msg: WebViewMessageIncoming, send: (messageType: string, payload: Record<string, unknown>) => string): Promise<void> {
    assert(!!msg.messageId || !!msg.messageType, "Message ID or type missing :(");

    if (msg.messageType === "NewIdea") {
      try {
        console.dir('GOT NewIdea');

        const messages: ChatMessage[] = [
          // TODO: PROMPT INJECTION!
          {
            content: msg.payload.text,
            role: "user"
          }
        ];

        const abortController = new AbortController();
        this.cancelToken = abortController.signal;

        const gen = this._messenger.invoke(
          "llm/streamChat",
          {
            messages,
            title: "pearai_model",
            completionOptions: {
              // TODO: FILL THIS OUT?
            }
          }
        );
        let completeResponse = "";
        let next = await gen.next();

        while (!next.done) {
          // if (!activeRef.current) {
          //   abortController.abort();
          //   break;
          // }
          completeResponse += next.value.content;
          send("planCreationStream", {
            plan: completeResponse,
          });
          // TODO: maybe stripImages?
          next = await gen.next();
        }

        send("planCreationCompleted", {
          plan: completeResponse,
        })

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Plan creation failed:", error);
        send("error", {
          text: "Failed to create plan: " + errorMessage
        });
      }
    } else if (msg.messageType === "SubmitPlan") {
      console.dir(`MSG PAYLOAD TEXT FOR SUBMITPLAN: ${msg.payload.text}`);
      this._onDidRequestExecutePlan.fire(msg.payload);

      await this.closeCreatorOverlay();
    } else if (msg.messageType === "Close") {
      await this.closeCreatorOverlay();
    }
  }

}