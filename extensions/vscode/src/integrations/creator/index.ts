import * as vscode from "vscode";
import { assert } from "../../util/assert";
import {
  CreatorModeState,
  ExecutePlanRequest,
  IPearAICreatorMode,
  PearAICreatorModeMessage,
  PearAICreatorSavedGlobalState,
  SubmitIdeaType,
} from "core";
import { IMessenger } from "core/util/messenger";
import { ToCoreFromIdeOrWebviewProtocol } from "core/protocol/core";
import { FromCoreProtocol } from "core/protocol";

/**
 * The format for all of the messages that come from the webview
 */
export interface WebViewMessageIncoming {
  destination: "creator"; // making sure we route the message over to here
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
  private readonly _onDidChangeCreatorModeState =
    new vscode.EventEmitter<CreatorModeState>();
  private readonly _onDidRequestExecutePlan =
    new vscode.EventEmitter<ExecutePlanRequest>();

  private feedbackMessages: any[] | undefined = undefined;

  // The abort token we can send to the LLM
  private cancelToken: AbortSignal | undefined;

  // Public events
  public readonly onDidChangeCreatorModeState =
    this._onDidChangeCreatorModeState.event;

  public readonly onDidRequestExecutePlan = this._onDidRequestExecutePlan.event;

  private creatorState: CreatorModeState = "OVERLAY_CLOSED";

  // Creator mode state
  // private _isCreatorModeActive: boolean = false;

  // Disposables
  private _disposables: vscode.Disposable[] = [];

  constructor(
    private readonly _messenger: IMessenger<
      ToCoreFromIdeOrWebviewProtocol,
      FromCoreProtocol
    >,
    private readonly context: vscode.ExtensionContext,
  ) {
    // Add emitters to disposables
    this._disposables.push(
      this._onDidChangeCreatorModeState,
      this._onDidRequestExecutePlan,
    );
  }

  public dispose(): void {
    // Dispose of event emitters and other disposables
    this._disposables.forEach((d) => d.dispose());
    this._disposables = [];
  }

  public async changeState(state: CreatorModeState): Promise<void> {
    switch (state) {
      case "OVERLAY_OPEN":
        await vscode.commands.executeCommand(
          "workbench.action.toggleCreatorView",
        ); // TODO: change into openCreatorView
        break;
      case "OVERLAY_CLOSED":
        await vscode.commands.executeCommand(
          "workbench.action.closeCreatorView",
        );
      case "OVERLAY_CLOSED_CREATOR_ACTIVE":
        await vscode.commands.executeCommand(
          "workbench.action.progressCreatorToNextStage",
        );
    }

    this._onDidChangeCreatorModeState.fire(this.creatorState);
  }

  /**
   * Opens the creator mode interface
   */
  public async openCreatorOverlay(): Promise<void> {
    try {
      // Execute the command to open the creator mode interface
      await vscode.commands.executeCommand(
        "workbench.action.toggleCreatorView",
      );
      // this._onDidChangeCreatorModeState.fire(true);
    } catch (error) {
      console.error("Failed to open creator mode:", error);
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
      console.error("Failed to close creator mode:", error);
      throw error;
    }
  }

  private async handleReplaceWorkspaceFolder(path: string): Promise<void> {
    console.dir("REPLACE WORKSPACE FOLDER:");
    console.dir(path);

    // Resolve ~ to home directory
    let resolvedPath = path;
    if (resolvedPath.startsWith("~")) {
      const os = require("os");
      resolvedPath = resolvedPath.replace("~", os.homedir());
      console.dir("RESOLVED PATH:");
      console.dir(resolvedPath);
    }

    // Create the new folder URI
    const folderUri = vscode.Uri.file(resolvedPath);

    console.dir("FOLDERURI:");
    console.dir(folderUri);

    // Create the folder
    try {
      await vscode.workspace.fs.createDirectory(folderUri);
      vscode.window.showInformationMessage(`Folder "${resolvedPath}" created.`);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to create folder: ${error}`);
      return;
    }

    try {
      if (!vscode.workspace) {
        throw new Error("No workspace found");
      }

      const result = vscode.workspace.updateWorkspaceFolders(
        // vscode.workspace.workspaceFolders
        //   ? vscode.workspace.workspaceFolders.length
        //   : 0,
        // null,
        0,
        vscode.workspace.workspaceFolders?.length || 0,
        {
          uri: folderUri,
        },
      );
      console.log("MADE WORKSPACE FOLDER!!");
      if (!result) {
        vscode.window.showErrorMessage(
          "Failed to replace workspace folder. This may be due to VS Code not supporting dynamic root changes in the current mode or a misconfiguration.",
        );
      }
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to replace workspace folder: ${error}`,
      );
    }
  }

  public async handleIncomingWebViewMessage(
    msg: PearAICreatorModeMessage,
    send: (messageType: string, payload: Record<string, unknown>) => string,
  ): Promise<void> {
    assert(
      !!msg.messageId || !!msg.messageType,
      "Message ID or type missing :(",
    );

    if (msg.messageType === "ProcessLLM") {
      try {
        console.dir("GOT ProcessLLM");

        const { messages } = msg.payload;

        const gen = this._messenger.invoke("llm/streamChat", {
          messages,
          title: "pearai_model",
          completionOptions: {
            prompt_key: "creator_mode_plan",
            stream: true,
          },
        });

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
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error("Plan creation failed:", error);
        send("error", {
          text: "Failed to create plan: " + errorMessage,
        });
      }
    } else if (msg.messageType === "SubmitIdea") {
      console.log("MSG PAYLOAD FOR SubmitIdea:", msg.payload);
      // Handle direct request without planning
      // Format payload to match ExecutePlanRequest
      this.changeState("OVERLAY_CLOSED_CREATOR_ACTIVE");

      if (msg.payload.newProjectPath && msg.payload.newProjectType !== "NONE") {
        await this.saveMsg(msg);
        await this.handleReplaceWorkspaceFolder(msg.payload.newProjectPath);
      } else {
        this._onDidRequestExecutePlan.fire({
          ...msg.payload,
          plan: msg.payload.request,
        });
      }
    } else if (msg.messageType === "Close") {
      await this.closeCreatorOverlay();
    }
  }

  /**
   * When we change the workspace folder, it restarts the extensions so we need to remember what we're doing
   */
  private async saveMsg(msg: SubmitIdeaType) {
    await this.context.globalState.update("PearAICreatorModeClassState", {
      msg,
      creatorState: this.creatorState,
      timestamp: Date.now(),
    } satisfies PearAICreatorSavedGlobalState);
  }

  /**
   * When we start up the extension again, we have to check if we have a saved state
   */
  public triggerCachedCreatorEvent(clear: boolean = false) {
    const globalStateMsg =
      this.context.globalState.get<PearAICreatorSavedGlobalState>(
        "PearAICreatorModeClassState",
      );

    if (globalStateMsg) {
      const { msg, creatorState, timestamp } = globalStateMsg;
      if (Date.now() - timestamp < 1000 * 20) {
        // If the timestamp is within the last 20 seconds, we can use it
        this.creatorState = creatorState;
        this._onDidRequestExecutePlan.fire({
          ...msg.payload,
          plan: msg.payload.request,
        });
      }
    }

    // Clear the global state after using it
    if (clear) {
      this.context.globalState.update("PearAICreatorModeClassState", undefined);
    }
  }

  public async openFeedbackForm(messages: any[]): Promise<void> {
    // First, open the overlay
    this.feedbackMessages = messages;

    // Then navigate to the inventory settings page
    // TODO: navigate to the right page on the overlay
    await vscode.commands.executeCommand("pearai.showOverlay.feedback");
  }

  public getFeedbackMessages(): any[] | undefined {
    return this.feedbackMessages;
  }
}
