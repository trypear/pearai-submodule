import { FromWebviewProtocol, ToWebviewProtocol } from "core/protocol";
import { Message } from "core/util/messenger";
import fs from "node:fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import * as vscode from "vscode";
import { IMessenger } from "../../../core/util/messenger";
import { getExtensionUri } from "./util/vscode";
import { getApi } from "./extension";
import { assert } from "./util/assert";

export async function showTutorial() {
  const tutorialPath = path.join(
    getExtensionUri().fsPath,
    "pearai_tutorial.py",
  );
  // Ensure keyboard shortcuts match OS
  if (process.platform !== "darwin") {
    let tutorialContent = fs.readFileSync(tutorialPath, "utf8");
    tutorialContent = tutorialContent
      .replaceAll("⌘", "^")
      .replaceAll("Cmd", "Ctrl");
    fs.writeFileSync(tutorialPath, tutorialContent);
  }

  const doc = await vscode.workspace.openTextDocument(
    vscode.Uri.file(tutorialPath),
  );
  await vscode.window.showTextDocument(doc, { preview: false });
}

export class VsCodeWebviewProtocol
  implements IMessenger<FromWebviewProtocol, ToWebviewProtocol>
{
  listeners = new Map<
    keyof FromWebviewProtocol,
    ((message: Message) => any)[]
  >();

  send(messageType: string, data: any, messageId?: string, specificWebviews?: string[],
  ): string {
    const id = messageId ?? uuidv4();
    if (specificWebviews) {
      specificWebviews.forEach(name => {
        try {
          const webview = this.webviews.get(name);
          if (webview) {
            webview.postMessage({
              messageType,
              data,
              messageId: id,
            });
          }
        } catch (error) {
          console.error(`Failed to post message to webview ${name}:`, error);
        }
      });
    } else {
      this.webviews.forEach(webview => {
        webview.postMessage({
          messageType,
          data,
          messageId: id,
        });
      });
    }
    return id;
  }

  on<T extends keyof FromWebviewProtocol>(
    messageType: T,
    handler: (
      message: Message<FromWebviewProtocol[T][0]>,
    ) => Promise<FromWebviewProtocol[T][1]> | FromWebviewProtocol[T][1],
  ): void {
    if (!this.listeners.has(messageType)) {
      this.listeners.set(messageType, []);
    }
    this.listeners.get(messageType)?.push(handler);
  }

  _webviews: Map<string, vscode.Webview> = new Map();
  _webviewListeners: Map<string, vscode.Disposable> = new Map();

  get webviews(): Map<string, vscode.Webview> {
    return this._webviews;
  }
  resetWebviews() {
    this._webviews.clear();
    this._webviewListeners.forEach(listener => listener.dispose());
    this._webviewListeners.clear();
  }

  resetWebviewToDefault() {
    const defaultViewKey = "pearai.chatView";

    // Remove all entries except for the chat view
    this._webviews.forEach((value, key) => {
      if (key !== defaultViewKey) {
        this._webviews.delete(key);
      }
    });

    // Dispose and remove all listeners except for the chat view
    this._webviewListeners.forEach((listener, key) => {
      if (key !== defaultViewKey) {
        listener.dispose();
        this._webviewListeners.delete(key);
      }
    });
  }

  addWebview(viewType: string, webView: vscode.Webview) {
    this._webviews.set(viewType, webView);
    const listener = webView.onDidReceiveMessage(async (msg) => {
      if(msg?.destination === "creator") {
        const creatorMode = getApi()?.creatorMode;
        assert(!!creatorMode, "creator mode is not present in submodule API :(");
        if(webView) {
          const respond = (messageType: string, message: Record<string, unknown>) =>
            this.send(messageType, message, msg.messageId);
          creatorMode.handleIncomingWebViewMessage(msg, respond);
        } else {
          console.error("WARNING: ⚠️ CREATOR WEBVIEW DOES NOT EXIST ⚠️");
        }

        return;
      }

      if (!msg.messageType || !msg.messageId) {
        throw new Error(`Invalid webview protocol msg: ${JSON.stringify(msg)}`);
      }

      const respond = (message: any) =>
        this.send(msg.messageType, message, msg.messageId);

      const handlers = this.listeners.get(msg.messageType) || [];
      for (const handler of handlers) {
        try {
          const response = await handler(msg);
          if (
            response &&
            typeof response[Symbol.asyncIterator] === "function"
          ) {
            let next = await response.next();
            while (!next.done) {
              respond(next.value);
              next = await response.next();
            }
            respond({ done: true, content: next.value?.content });
          } else {
            respond(response || {});
          }
        } catch (e: any) {
          respond({ done: true, error: e });

          console.error(
            `Error handling webview message: ${JSON.stringify(
              { msg },
              null,
              2,
            )}\n\n${e}`,
          );

          let message = e.message;

          if (e.cause) {
            if (e.cause.name === "ConnectTimeoutError") {
              message = `Connection timed out. If you expect it to take a long time to connect, you can increase the timeout in config.json by setting "requestOptions": { "timeout": 10000 }. You can find the full config reference here: https://trypear.ai/reference/config`;
            } else if (e.cause.code === "ECONNREFUSED") {
              message = `Connection was refused. This likely means that there is no server running at the specified URL. If you are running your own server you may need to set the "apiBase" parameter in config.json. For example, you can set up an OpenAI-compatible server like here: https://trypear.ai/reference/Model%20Providers/openai#openai-compatible-servers--apis`;
            } else {
              message = `The request failed with "${e.cause.name}": ${e.cause.message}. If you're having trouble setting up PearAI, please see the troubleshooting guide for help.`;
            }
          }
          // PearAI login issues
          else if (message.includes("401") && message.includes("PearAI")) {
            vscode.window
              .showErrorMessage(
                message,
                'Login To PearAI',
                'Show Logs',
              )
              .then((selection) => {
                if (selection === 'Login To PearAI') {
                  // Redirect to auth login URL
                  vscode.env.openExternal(
                    vscode.Uri.parse(
                      'https://trypear.ai/signin?callback=pearai://pearai.pearai/auth',
                    ),
                  );
                } else if (selection === 'Show Logs') {
                  vscode.commands.executeCommand(
                    'workbench.action.toggleDevTools',
                  );
                }
              });
          }
          // PearAI Free trial ended case
          else if (message.includes("403") && message.includes("PearAI")) {
            vscode.window
              .showErrorMessage(
                message,
                'View PearAI Pricing',
                'Show Logs',
              )
              .then((selection) => {
                if (selection === 'View PearAI Pricing') {
                  // Redirect to auth login URL
                  vscode.env.openExternal(
                    vscode.Uri.parse(
                      'https://trypear.ai/pricing',
                    ),
                  );
                } else if (selection === 'Show Logs') {
                  vscode.commands.executeCommand(
                    'workbench.action.toggleDevTools',
                  );
                }
              });
          }
          else if (message.includes("https://proxy-server")) {
            message = message.split("\n").filter((l: string) => l !== "")[1];
            try {
              message = JSON.parse(message).message;
            } catch {}
            if (message.includes("exceeded")) {
              message +=
                " To keep using PearAI, you can set up a local model or use your own API key.";
            }

            vscode.window
              .showInformationMessage(message, "Add API Key", "Use Local Model")
              .then((selection) => {
                if (selection === "Add API Key") {
                  this.request("addApiKey", undefined);
                } else if (selection === "Use Local Model") {
                  this.request("setupLocalModel", undefined);
                }
              });
          } else if (message.includes("Please sign in with GitHub")) {
            vscode.window
              .showInformationMessage(
                message,
                "Sign In",
                "Use API key / local model",
              )
              .then((selection) => {
                if (selection === "Sign In") {
                  vscode.authentication
                    .getSession("github", [], {
                      createIfNone: true,
                    })
                    .then(() => {
                      this.reloadConfig();
                    });
                } else if (selection === "Use API key / local model") {
                  this.request("openOnboarding", undefined);
                }
              });
          } else {
            vscode.window
              .showErrorMessage(
                message,
                "Show Logs",
                "Troubleshooting",
              )
              .then((selection) => {
                if (selection === "Show Logs") {
                  vscode.commands.executeCommand(
                    "workbench.action.toggleDevTools",
                  );
                } else if (selection === "Troubleshooting") {
                  vscode.env.openExternal(
                    vscode.Uri.parse(
                      "https://trypear.ai/troubleshooting",
                    ),
                  );
                }
              });
          }
        }
      }
    }, this);
    this._webviewListeners.set(viewType, listener);
  }

  removeWebview(name: string) {
    const webView = this._webviews.get(name);
    if (webView) {
      this._webviews.delete(name);
      this._webviewListeners.get(name)?.dispose();
      this._webviewListeners.delete(name);
    }
  }

  constructor(private readonly reloadConfig: () => void) {}

  invoke<T extends keyof FromWebviewProtocol>(
    messageType: T,
    data: FromWebviewProtocol[T][0],
    messageId?: string,
  ): FromWebviewProtocol[T][1] {
    throw new Error("Method not implemented.");
  }

  onError(handler: (error: Error) => void): void {
    throw new Error("Method not implemented.");
  }

  public request<T extends keyof ToWebviewProtocol>(
    messageType: T,
    data: ToWebviewProtocol[T][0],
    specificWebviews?: string[]
  ): Promise<ToWebviewProtocol[T][1]> {
    const messageId = uuidv4();
    return new Promise(async (resolve) => {
      let i = 0;
      while (this.webviews.size === 0) {
        if (i >= 10) {
          resolve(undefined);
          return;
        } else {
          await new Promise((res) => setTimeout(res, i >= 5 ? 1000 : 500));
          i++;
        }
      }

      this.send(messageType, data, messageId, specificWebviews);
      const disposables: vscode.Disposable[] = [];
      this.webviews.forEach((webview, name) => {
        const disposable = webview.onDidReceiveMessage(
          (msg: Message<ToWebviewProtocol[T][1]>) => {
            if (msg.messageId === messageId) {
              resolve(msg.data);
              disposables.forEach(d => d.dispose());
            }
          }
        );
        disposables.push(disposable);
      });
    });
  }
}
