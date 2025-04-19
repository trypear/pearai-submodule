import * as vscode from 'vscode';
import { assert } from '../../util/assert';
import { CreatorModeState, ExecutePlanRequest, IPearAICreatorMode } from 'core';
import { IMessenger } from 'core/util/messenger';
import { ToCoreFromIdeOrWebviewProtocol } from 'core/protocol/core';
import { FromCoreProtocol } from 'core/protocol';


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
 */
export class PearAICreatorMode implements IPearAICreatorMode {
  // Private event emitters
  private readonly _onDidChangeCreatorModeState = new vscode.EventEmitter<CreatorModeState>();
  private readonly _onDidRequestExecutePlan = new vscode.EventEmitter<ExecutePlanRequest>();

  // The abort token we can send to the LLM
  private cancelToken: AbortSignal | undefined;

  // Public events
  public readonly onDidChangeCreatorModeState = this._onDidChangeCreatorModeState.event;

  public readonly onDidRequestExecutePlan = this._onDidRequestExecutePlan.event;


  private creatorState: CreatorModeState = "OVERLAY_CLOSED";

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
      this._onDidRequestExecutePlan
    );
  }

  public dispose(): void {
    // Dispose of event emitters and other disposables
    this._disposables.forEach(d => d.dispose());
    this._disposables = [];
  }

  public async changeState(state: CreatorModeState): Promise<void> {
    switch(state) {
      case "OVERLAY_OPEN":
        await vscode.commands.executeCommand('workbench.action.toggleCreatorView'); // TODO: change into openCreatorView
        break;
      case "OVERLAY_CLOSED":
        await vscode.commands.executeCommand("workbench.action.closeCreatorView");
      case "OVERLAY_CLOSED_CREATOR_ACTIVE":
        await vscode.commands.executeCommand("workbench.action.progressCreatorToNextStage");

    }

    this._onDidChangeCreatorModeState.fire(this.creatorState);
  }


  /**
   * Opens the creator mode interface
   */
  public async openCreatorOverlay(): Promise<void> {
    try {
      // Execute the command to open the creator mode interface
      await vscode.commands.executeCommand('workbench.action.toggleCreatorView');
      // this._onDidChangeCreatorModeState.fire(true);
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
      // this._onDidChangeCreatorModeState.fire(false);
    } catch (error) {
      console.error('Failed to close creator mode:', error);
      throw error;
    }
  }

  public async handleIncomingWebViewMessage(msg: WebViewMessageIncoming, send: (messageType: string, payload: Record<string, unknown>) => string): Promise<void> {
    assert(!!msg.messageId || !!msg.messageType, "Message ID or type missing :(");

    if (msg.messageType === "ProcessLLM") {
      try {
        console.dir('GOT ProcessLLM');

        const { messages } = msg.payload;

        const gen = this._messenger.invoke(
          "llm/streamChat",
          {
            messages,
            title: "pearai_model",
            completionOptions: {
              // TODO: FILL THIS OUT?
              prompt_key: "creator_mode_plan",
              stream: true,
            },
          }
        );

        let completeResponse = "";
        let next = await gen.next();

        while (!next.done) {
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
      const payload = {
        plan: `${msg.payload.request}`,
        text: msg.payload.request,
        newProject: msg.payload.request.newProject,
        ...msg.payload
      };
      this._onDidRequestExecutePlan.fire(payload); // sends off the request to the roo code extension to execute the plan
      this.changeState("OVERLAY_CLOSED_CREATOR_ACTIVE");

      // TODO: handle being inside of the "creator mode" whilst still having access to all of the shizz
    } else if (msg.messageType === "SubmitRequestNoPlan") {
      console.dir(`MSG PAYLOAD TEXT FOR SubmitRequestNoPlan: ${msg.payload.text}`);
      // Handle direct request without planning
      // Format payload to match ExecutePlanRequest
      const payload = {
        plan: `${msg.payload.request}`,
        text: msg.payload.request,
        newProject: msg.payload.request.newProject,
        ...msg.payload
      };
      this._onDidRequestExecutePlan.fire(payload);
      this.changeState("OVERLAY_CLOSED_CREATOR_ACTIVE");
    } else if (msg.messageType === "Close") {
      await this.closeCreatorOverlay();
    }
  }

}