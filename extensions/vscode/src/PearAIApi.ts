import { PearAICreatorMode } from "./integrations/creator";
import { IMessenger } from "core/util/messenger";
import { ToCoreProtocol, FromCoreProtocol } from "core/protocol";
import { Core } from "core/core";
import * as vscode from "vscode";
import { IPearAIApi } from "core";

/**
 * Public interface for the PearAI Extension API
 * This interface defines the public classes that other extensions can use
 */

export class PearAIApi implements IPearAIApi {
  private readonly messenger: IMessenger<ToCoreProtocol, FromCoreProtocol>;
  readonly creatorMode: PearAICreatorMode;
  private readonly core: Core;

  constructor(core: Core, context: vscode.ExtensionContext) {
    this.messenger = core.messenger;
    this.core = core;
    this.creatorMode = new PearAICreatorMode(this.messenger, context);
  }

  public async getUserId(): Promise<string | undefined> {
    try {
      return this.messenger.invoke("llm/getUserId", undefined);
    } catch (error) {
      console.error("Error getting user ID:", error);
      return undefined;
    }
  }
}
