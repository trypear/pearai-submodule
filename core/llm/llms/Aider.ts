import {
  ChatMessage,
  CompletionOptions,
  LLMOptions,
  ModelProvider,
} from "../../index.js";
import { SERVER_URL } from "../../util/parameters.js";
import { BaseLLM } from "../index.js";
import { streamSse, streamJSON } from "../stream.js";
import { checkTokens } from "../../db/token.js";
import { stripImages } from "../images.js";
import { countTokens } from "../countTokens.js";
import * as cp from "child_process";
import * as process from "process";
import { PearAICredentials } from "../../pearaiServer/PearAICredentials.js";
import { getHeaders } from "../../pearaiServer/stubs/headers.js";
import { execSync } from "child_process";
import * as os from "os";
import * as vscode from "vscode";
import {
  startAiderChat,
  killAiderProcess,
  aiderCtrlC,
  sendToAiderChat,
  isAiderProcessUp,
  AiderProcessManager,
} from "../../../extensions/vscode/src/integrations/aider/aider";

const PLATFORM = process.platform;
const IS_WINDOWS = PLATFORM === "win32";
const IS_MAC = PLATFORM === "darwin";
const IS_LINUX = PLATFORM === "linux";

export const AIDER_QUESTION_MARKER = "[Yes]\\:";
export const AIDER_END_MARKER = "─────────────────────────────────────";

export interface AiderStatusUpdate {
  status: "stopped" | "starting" | "ready" | "crashed";
}

class Aider extends BaseLLM {
  getCurrentDirectory: (() => Promise<string>) | null = null;
  static providerName: ModelProvider = "aider";
  static defaultOptions: Partial<LLMOptions> = {
    model: "pearai_model",
    contextLength: 8192,
    completionOptions: {
      model: "pearai_model",
      maxTokens: 2048,
    },
  };

  private credentials: PearAICredentials;
  private aiderManager: AiderProcessManager;

  constructor(options: LLMOptions) {
    super(options);
    if (options.getCurrentDirectory) {
      this.getCurrentDirectory = options.getCurrentDirectory;
    }
    this.credentials = new PearAICredentials(
      options.getCredentials,
      options.setCredentials || (async () => {}),
    );
    this.aiderManager = new AiderProcessManager();
    console.log("Aider constructor called");
  }


  public setPearAIAccessToken(value: string | undefined): void {
    this.credentials.setAccessToken(value);
  }

  public setPearAIRefreshToken(value: string | undefined): void {
    this.credentials.setRefreshToken(value);
  }


  private _convertArgs(options: CompletionOptions): any {
    return {
      model: options.model,
      frequency_penalty: options.frequencyPenalty,
      presence_penalty: options.presencePenalty,
      max_tokens: options.maxTokens,
      stop: options.stop?.slice(0, 2),
      temperature: options.temperature,
      top_p: options.topP,
    };
  }

  protected async *_streamComplete(
    prompt: string,
    options: CompletionOptions,
  ): AsyncGenerator<string> {
    for await (const chunk of this._streamChat(
      [{ role: "user", content: prompt }],
      options,
    )) {
      yield stripImages(chunk.content);
    }
  }

  countTokens(text: string): number {
    return countTokens(text, this.model);
  }

  protected _convertMessage(message: ChatMessage) {
    if (typeof message.content === "string") {
      return message;
    }
    return {
      ...message,
      content: message.content.map((part) => {
        if (part.type === "text") {
          return part;
        }
        return {
          type: "image",
          source: {
            type: "base64",
            media_type: "image/jpeg",
            data: part.imageUrl?.url.split(",")[1],
          },
        };
      }),
    };
  }

  protected async *_streamChat(
    messages: ChatMessage[],
    options: CompletionOptions,
  ): AsyncGenerator<ChatMessage> {
    console.log("Inside Aider _streamChat");
    const lastMessage = messages[messages.length - 1].content.toString();
    this.aiderManager.sendToAiderChat(lastMessage);

    let lastProcessedIndex = 0;
    let responseComplete = false;

    const END_MARKER = "\n> ";

    const escapeDollarSigns = (text: string | undefined) => {
      if (!text) return "Aider response over";
      return text.replace(/([\\$])/g, "\\$1");
    };

    while (!responseComplete) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const newOutput = this.aiderManager.aiderOutput.slice(lastProcessedIndex);
      if (newOutput) {
        lastProcessedIndex = this.aiderManager.aiderOutput.length;
        yield {
          role: "assistant",
          content: escapeDollarSigns(newOutput),
        };

        if (newOutput.endsWith(END_MARKER)) {
          responseComplete = true;
          break;
        }
      }

      if (!aiderManager.isAiderProcessUp()) {
        break;
      }
    }
  }

  async listModels(): Promise<string[]> {
    return ["claude-3-5-sonnet-20240620", "pearai_model", "gpt-4o"];
  }

  supportsFim(): boolean {
    return false;
  }
}

export default Aider;
