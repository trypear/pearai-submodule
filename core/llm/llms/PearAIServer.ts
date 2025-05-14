// core/llm/llms/PearAIServer.ts

import { getHeaders } from "../../pearaiServer/stubs/headers.js";
import {
  ChatMessage,
  CompletionOptions,
  LLMFullCompletionOptions,
  LLMOptions,
  ModelProvider,
  PearAuth,
} from "../../index.js";
import { SERVER_URL } from "../../util/parameters.js";
import { Telemetry } from "../../util/posthog.js";
import { BaseLLM } from "../index.js";
import { streamSse, streamResponse, streamJSON } from "../stream.js";
import { stripImages } from "../images.js";
import {
  compileChatMessages,
  countTokens,
  pruneRawPromptFromTop,
} from "./../countTokens.js";
import { PearAICredentials } from "../../pearaiServer/PearAICredentials.js";
import { readConfigJson } from "../../util/paths.js";
import { execSync } from "child_process";
import * as vscode from "vscode";



class PearAIServer extends BaseLLM {
  private credentials: PearAICredentials;

  static providerName: ModelProvider = "pearai_server";

  constructor(options: LLMOptions) {
    super(options);
    this.credentials = new PearAICredentials(
      options.getCredentials,
      options.setCredentials || (async () => {})
    );
  }

  public setPearAIAccessToken(value: string | undefined): void {
    this.credentials.setAccessToken(value);
  }

  public setPearAIRefreshToken(value: string | undefined): void {
    this.credentials.setRefreshToken(value);
  }

  public async checkAndUpdateCredentials(): Promise<{ tokensEdited: boolean, accessToken?: string, refreshToken?: string }> {
    return this.credentials.checkAndUpdateCredentials();
  }

  private async _getHeaders() {
    await this.credentials.checkAndUpdateCredentials();
    return {
      "Content-Type": "application/json",
      ...(await getHeaders()),
    };
  }

  private async _countTokens(prompt: string, model: string, isPrompt: boolean) {
    // no-op
  }

  public static _getRepoId(): string {
    try {
        const gitRepo = vscode.workspace.workspaceFolders?.[0];
        if (gitRepo) {
          try {
            // First check if git is initialized and has commits
            const hasCommits = execSync(
                "git rev-parse --verify HEAD",
                { cwd: gitRepo.uri.fsPath }
            ).toString().trim();

            if (hasCommits) {
                // If we have commits, get the root commit hash
                const rootCommitHash = execSync(
                    "git rev-list --max-parents=0 HEAD -n 1",
                    { cwd: gitRepo.uri.fsPath }
                ).toString().trim().substring(0, 7);
                return rootCommitHash;
            }
          } catch (gitError) {
              // Git command failed - either git isn't initialized or no commits
              console.debug("Git repository not initialized or no commits present");
          }
        }  // if not git initialized, id will simply be user-id (uid)
        return "global";
    } catch (error) {
        console.error("Failed to initialize project ID:", error);
        console.error("Using user ID as project ID");
        return "global";
    }
  }

  private _convertArgs(options: CompletionOptions): any {
    return {
      model: options.model,
      integrations: readConfigJson().integrations || {},
      repoId: PearAIServer._getRepoId(),
      frequency_penalty: options.frequencyPenalty,
      presence_penalty: options.presencePenalty,
      max_tokens: options.maxTokens,
      stop:
        options.model === "starcoder-7b"
          ? options.stop
          : options.stop?.slice(0, 2),
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
    const args = this._convertArgs(this.collectArgs(options));

    await this._countTokens(
      messages.map((m) => m.content).join("\n"),
      args.model,
      true,
    );

    const promptKey = "prompt_key" in options ? (options.prompt_key as string) : undefined;

    await this.credentials.checkAndUpdateCredentials();

    const body = JSON.stringify({
      messages: messages.map(this._convertMessage),
      ...args,
    });

    const response = await this.fetch(`${SERVER_URL}/server_chat`, {
      method: "POST",
      headers: {
        ...(await this._getHeaders()),
        Authorization: `Bearer ${this.credentials.getAccessToken()}`,
        ...(promptKey ? {"prompt_key": promptKey} : {})
      },
      body: body,
    });

    let completion = "";
    let warningMsg = "";

    for await (const value of streamJSON(response)) {
      if (value.metadata && Object.keys(value.metadata).length > 0) {
        console.dir("Metadata received:")
        console.dir(value.metadata);
        if (value.metadata.ui_only) {
          warningMsg += value.content;
          continue;
        }
      }
      if (value.content) {
        yield {
          role: "assistant",
          content: value.content,
          citations: value?.citations,
        };
        completion += value.content;
      }
    }

    if (warningMsg.includes("pay-as-you-go")) {
          vscode.window.showInformationMessage(
            warningMsg,
            'View Pay-As-You-Go'
        ).then(selection => {
            if (selection === 'View Pay-As-You-Go') {
                vscode.env.openExternal(vscode.Uri.parse('https://trypear.ai/pay-as-you-go'));
            }
        });
    }

    // vscode.window.showInformationMessage(warningMsg);
    // vscode.commands.executeCommand("pearai.freeModelSwitch", {warningMsg});
    this._countTokens(completion, args.model, false);
  }

  async *_streamFim(
    prefix: string,
    suffix: string,
    options: CompletionOptions
  ): AsyncGenerator<string> {
    options.stream = true;

    const result = await this.credentials.checkAndUpdateCredentials();
    if (!result.tokensEdited && !this.credentials.getAccessToken()) {
      return null
    }

    const endpoint = `${SERVER_URL}/server_fim`;
    const resp = await this.fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({
        model: options.model,
        prefix,
        suffix,
        max_tokens: options.maxTokens,
        temperature: options.temperature,
        top_p: options.topP,
        frequency_penalty: options.frequencyPenalty,
        presence_penalty: options.presencePenalty,
        stop: options.stop,
        stream: true,
      }),
      headers: {
        ...(await this._getHeaders()),
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${this.credentials.getAccessToken()}`,
      },
    });
    let completion = "";
    for await (const chunk of streamSse(resp)) {
      yield chunk.choices[0].delta.content;
    }
  }

  async listModels(): Promise<string[]> {
    return [
      "pearai_model",
    ];
  }

  supportsFim(): boolean {
    return false;
  }

  protected async _sendTokensUsed(
    kind: string,
    prompt: string,
    completion: string,
  ) {
    let promptTokens = this.countTokens(prompt);
    let generatedTokens = this.countTokens(completion);

    const response = await this.fetch(`${SERVER_URL}/log_tokens`, {
      method: "POST",
      headers: {
        ...(await this._getHeaders()),
        Authorization: `Bearer ${this.credentials.getAccessToken()}`,
      },
      body: JSON.stringify({
        kind,
        promptTokens,
        generatedTokens
      }),
    })
  }
}

export default PearAIServer;
