import { PearAICreatorMode } from "./integrations/creator";
import { IMessenger } from "core/util/messenger";
import { ToCoreProtocol, FromCoreProtocol } from "core/protocol";
import { Core } from "core/core";
import * as vscode from "vscode";

function base64UrlDecode(input: string): string {
  // Replace base64url characters with base64 standard characters
  input = input.replace(/-/g, "+").replace(/_/g, "/");

  // Add padding if needed
  const pad = input.length % 4;
  if (pad) {
    input += "=".repeat(4 - pad);
  }

  return atob(input);
}

function decodeJwtPayload(token: string): { sub?: string } {
  if (!token || typeof token !== "string") {
    console.error("Invalid token format");
    return {};
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("Invalid JWT structure");
      return {};
    }

    const payload = JSON.parse(base64UrlDecode(parts[1]));

    if (!payload || typeof payload !== "object") {
      console.error("Invalid payload structure");
      return {};
    }

    if (typeof payload.sub !== "string") {
      console.error("Invalid sub claim format");
      return {};
    }

    return { sub: payload.sub };
  } catch (error) {
    console.error("Error decoding JWT");
    return {};
  }
}

/**
 * Public interface for the PearAI Extension API
 * This interface defines the public classes that other extensions can use
 */
export interface IPearAIApi {
  readonly creatorMode: PearAICreatorMode;
}

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
      const result = this.messenger.invoke("llm/checkPearAITokens", undefined);
      if (result.tokensEdited && result.accessToken) {
        const decoded = decodeJwtPayload(result.accessToken);
        return decoded.sub;
      }
      return undefined;
    } catch (error) {
      console.error("Error getting user ID:", error);
      return undefined;
    }
  }
}
