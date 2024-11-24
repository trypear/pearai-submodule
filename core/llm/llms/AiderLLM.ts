import {
  ChatMessage,
  CompletionOptions,
  LLMOptions,
  ModelProvider,
} from "../../index.js";
import { BaseLLM } from "../index.js";
import { stripImages } from "../images.js";
import { countTokens } from "../countTokens.js";
import * as process from "process";
import { PearAICredentials } from "../../pearaiServer/PearAICredentials.js";
import type { AiderState } from "../../../extensions/vscode/src/integrations/aider/types/aiderTypes";
import { AiderProcessManager } from "../../../extensions/vscode/src/integrations/aider/aiderProcess"


const PLATFORM = process.platform;
const IS_WINDOWS = PLATFORM === "win32";
const IS_MAC = PLATFORM === "darwin";
const IS_LINUX = PLATFORM === "linux";
const EDIT_FORMAT: string = "normal"; // options ["normal", "udiff"]
const UDIFF_FLAG = EDIT_FORMAT === "udiff";
const AIDER_READY_FLAG = UDIFF_FLAG ? "udiff> " : "> ";
const END_MARKER = IS_WINDOWS
  ? UDIFF_FLAG
    ? "\r\nudiff> "
    : "\r\n> "
  : UDIFF_FLAG
    ? "\nudiff> "
    : "\n> ";
const READY_PROMPT_REGEX = />[^\S\r\n]*(?:[\r\n]|\s)*(?:\s+)(?:[\r\n]|\s)*$/;

export const AIDER_QUESTION_MARKER = "[Yes]\\:";
export const AIDER_END_MARKER = "─────────────────────────────────────";
const COMPLETION_DELAY = 1500; // 1.5 seconds wait time

class Aider extends BaseLLM {

  getCurrentDirectory: (() => Promise<string>) | null = null;
  static providerName: ModelProvider = "aider";
  private aiderOutput: string = '';

  static defaultOptions: Partial<LLMOptions> = {
    model: "pearai_model",
    contextLength: 8192,
    completionOptions: {
      model: "pearai_model",
      maxTokens: 2048,
    },
  };

  public aiderProcess: AiderProcessManager;
  private credentials: PearAICredentials;

  constructor(options: LLMOptions) {
    super(options);
    if (options.getCurrentDirectory) {
      this.getCurrentDirectory = options.getCurrentDirectory;
    }
    this.credentials = new PearAICredentials(
      options.getCredentials,
      options.setCredentials || (async () => {}),
    );
    console.log("Aider constructor called");
    this.model = options.model;
    this.apiKey = options.apiKey;
    this.credentials.checkAndUpdateCredentials();
    this.aiderProcess = new AiderProcessManager(this.apiKey, this.model, this.credentials);

  }

  public setPearAIAccessToken(value: string | undefined): void {
    this.credentials.setAccessToken(value);
  }

  public setPearAIRefreshToken(value: string | undefined): void {
    this.credentials.setRefreshToken(value);
  }

  public startAiderChat(model: string, apiKey: string | undefined) {
    return this.aiderProcess.startAiderChat(model, apiKey);
  }

  public killAiderProcess() {
    return this.aiderProcess.killAiderProcess();
  }

  public getAiderState(): AiderState {
    return this.aiderProcess.state;
  }

  public setAiderState(state: AiderState) {
    return this.aiderProcess.updateState(state);
  }

  public aiderCtrlC() {
    return this.aiderProcess.aiderCtrlC();
  }

  public aiderResetSession(model: string, apiKey: string | undefined) {
    return this.aiderProcess.resetSession(model, apiKey);
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
    console.dir("Sending to PearAI Creator:");
    console.dir(lastMessage);
    this.aiderProcess.sendToAiderChat(lastMessage);

    let lastProcessedIndex = 0;
    let responseComplete = false;
    let potentialCompletion = false;
    let potentialCompletionTimeout: NodeJS.Timeout | null = null;

    const escapeDollarSigns = (text: string | undefined) => {
      if (!text) {
        return "Aider response over";
      }
      return text.replace(/([\\$])/g, "\\$1");
    };

    while (!responseComplete) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const newOutput = this.aiderProcess.aiderOutput.slice(lastProcessedIndex);

      if (newOutput) {
        if (potentialCompletionTimeout) {
          // If we get new output while waiting, clear the timeout
          clearTimeout(potentialCompletionTimeout);
          potentialCompletionTimeout = null;
          potentialCompletion = false;
        }

        if (READY_PROMPT_REGEX.test(newOutput)) {
          // Instead of marking complete immediately, set up potential completion
          if (!potentialCompletion) {
            potentialCompletion = true;
            potentialCompletionTimeout = setTimeout(() => {
              responseComplete = true;
            }, COMPLETION_DELAY);
          }
        }

        lastProcessedIndex = this.aiderProcess.aiderOutput.length;
        yield {
          role: "assistant",
          content: escapeDollarSigns(newOutput),
        };

        // Safety check
        // if (this.aiderProcess?.killed) {
        //   if (potentialCompletionTimeout) {
        //     clearTimeout(potentialCompletionTimeout);
        //   }
        //   this.setAiderState("stopped");
        //   break;
        // }
      }
    }

    // Clean up any remaining timeout
    if (potentialCompletionTimeout) {
      clearTimeout(potentialCompletionTimeout);
    }

    // Reset the output after capturing a complete response
    this.aiderProcess.aiderOutput = "";
  }

  async listModels(): Promise<string[]> {
    return ["aider", "pearai_model", "claude-3-5-sonnet-20240620", "gpt-4o"];
  }

  supportsFim(): boolean {
    return false;
  }
}

export default Aider;
