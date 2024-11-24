// Note: This file has been modified significantly from its original contents. New commands have been added, and there has been renaming from Continue to PearAI. pearai-submodule is a fork of Continue (https://github.com/continuedev/continue).

import { ConfigHandler } from "core/config/ConfigHandler";
import {
  FromCoreProtocol,
  FromWebviewProtocol,
  ToCoreProtocol,
} from "core/protocol";
import { ToWebviewFromCoreProtocol } from "core/protocol/coreWebview";
import { ToIdeFromWebviewOrCoreProtocol } from "core/protocol/ide";
import { ToIdeFromCoreProtocol } from "core/protocol/ideCore";
import {
  CORE_TO_WEBVIEW_PASS_THROUGH,
  WEBVIEW_TO_CORE_PASS_THROUGH,
} from "core/protocol/passThrough";
import { InProcessMessenger, Message } from "core/util/messenger";
import { getConfigJsonPath } from "core/util/paths";
import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";
import { VerticalPerLineDiffManager } from "../diff/verticalPerLine/manager";
import { VsCodeIde } from "../ideProtocol";
import {
  getControlPlaneSessionInfo,
  WorkOsAuthProvider,
} from "../stubs/WorkOsAuthProvider";
import { getExtensionUri } from "../util/vscode";
import { VsCodeWebviewProtocol } from "../webviewProtocol";
import { attemptInstallExtension, attemptUninstallExtension, isVSCodeExtensionInstalled } from "../activation/activate";
import { checkAiderInstallation } from "../integrations/aider/aiderUtil";
import { TOOL_COMMANDS, ToolType } from "../util/integrationUtils";

/**
 * A shared messenger class between Core and Webview
 * so we don't have to rewrite some of the handlers
 */
type TODO = any;
type ToIdeOrWebviewFromCoreProtocol = ToIdeFromCoreProtocol &
  ToWebviewFromCoreProtocol;
export class VsCodeMessenger {
  onWebview<T extends keyof FromWebviewProtocol>(
    messageType: T,
    handler: (
      message: Message<FromWebviewProtocol[T][0]>,
    ) => Promise<FromWebviewProtocol[T][1]> | FromWebviewProtocol[T][1],
  ): void {
    this.webviewProtocol.on(messageType, handler);
  }

  onCore<T extends keyof ToIdeOrWebviewFromCoreProtocol>(
    messageType: T,
    handler: (
      message: Message<ToIdeOrWebviewFromCoreProtocol[T][0]>,
    ) =>
      | Promise<ToIdeOrWebviewFromCoreProtocol[T][1]>
      | ToIdeOrWebviewFromCoreProtocol[T][1],
  ): void {
    this.inProcessMessenger.externalOn(messageType, handler);
  }

  onWebviewOrCore<T extends keyof ToIdeFromWebviewOrCoreProtocol>(
    messageType: T,
    handler: (
      message: Message<ToIdeFromWebviewOrCoreProtocol[T][0]>,
    ) =>
      | Promise<ToIdeFromWebviewOrCoreProtocol[T][1]>
      | ToIdeFromWebviewOrCoreProtocol[T][1],
  ): void {
    this.onWebview(messageType, handler);
    this.onCore(messageType, handler);
  }

  constructor(
    private readonly inProcessMessenger: InProcessMessenger<
      ToCoreProtocol,
      FromCoreProtocol
    >,
    private readonly webviewProtocol: VsCodeWebviewProtocol,
    private readonly ide: VsCodeIde,
    private readonly verticalDiffManagerPromise: Promise<VerticalPerLineDiffManager>,
    private readonly configHandlerPromise: Promise<ConfigHandler>,
    private readonly workOsAuthProvider: WorkOsAuthProvider,
  ) {
    /** WEBVIEW ONLY LISTENERS **/
    this.onWebview("invokeVSCodeCommandById", (msg) => {
      const commandId = msg.data.commandId;
      const args = msg.data.args ?? [];
      vscode.commands.executeCommand(commandId, ...args);
    });
    // welcome stuff
    this.onWebview("markNewOnboardingComplete", (msg) => {
      vscode.commands.executeCommand("pearai.welcome.markNewOnboardingComplete");
    });
    this.onWebview("closeOverlay", (msg) => {
      vscode.commands.executeCommand("pearai.hideOverlay");
    });
    this.onWebview("lockOverlay", (msg) => {
      vscode.commands.executeCommand("pearai.lockOverlay");
    });
    this.onWebview("unlockOverlay", (msg) => {
      vscode.commands.executeCommand("pearai.unlockOverlay");
    });
    this.onWebview("importUserSettingsFromVSCode", (msg) => {
      vscode.commands.executeCommand("pearai.welcome.importUserSettingsFromVSCode");
    });
    this.onWebview("installVscodeExtension", (msg) => {
      attemptInstallExtension(msg.data.extensionId);
    });
    this.onWebview("uninstallVscodeExtension", (msg) => {
      attemptUninstallExtension(msg.data.extensionId);
    });
    this.onWebview("installAider", (msg) => {
      vscode.commands.executeCommand("pearai.installAider");
    });
    this.onWebview("uninstallAider", (msg) => {
      vscode.commands.executeCommand("pearai.uninstallAider");
    });
    this.onWebview("isAiderInstalled", async (msg) => {
      console.log("Checking Aider installation...");
      const isAiderInstalled = await checkAiderInstallation();
      console.log("Aider installation status:", isAiderInstalled);
      return isAiderInstalled;
    });
    this.onWebview("is_vscode_extension_installed", async (msg) => {
      const isInstalled = await isVSCodeExtensionInstalled(msg.data.extensionId);
      console.log("VSCode extension installation status:", isInstalled);
      return isInstalled;
    });
    this.onWebview("pearWelcomeOpenFolder", (msg) => {
      vscode.commands.executeCommand("workbench.action.files.openFolder");
    });
    this.onWebview("pearInstallCommandLine", (msg) => {
      vscode.commands.executeCommand("workbench.action.installCommandLine");
    });
    // END welcome stuff
    this.onWebview("showFile", (msg) => {
      this.ide.openFile(msg.data.filepath);
    });
    this.onWebview("openConfigJson", (msg) => {
      this.ide.openFile(getConfigJsonPath());
    });
    this.onWebview("readRangeInFile", async (msg) => {
      return await vscode.workspace
        .openTextDocument(msg.data.filepath)
        .then((document) => {
          const start = new vscode.Position(0, 0);
          const end = new vscode.Position(5, 0);
          const range = new vscode.Range(start, end);

          const contents = document.getText(range);
          return contents;
        });
    });
    this.onWebview("openAiderChanges", (msg) => {
      vscode.commands.executeCommand("pearai.openAiderChanges");
    });
    this.onWebview("getNumberOfChanges", (msg) => {
      const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
      const repository = gitExtension?.getAPI(1).repositories[0];

      if (repository) {
          const unstagedChanges = repository.state.workingTreeChanges;
          return unstagedChanges.length;
      }
      return 0;
    });
    this.onWebview("openInventoryHome", (msg) => {
      vscode.commands.executeCommand("pearai.toggleInventoryHome");
    });
    this.onWebview("pearAIinstallation", (msg) => {
      const { tools, installExtensions } = msg.data;
      if (installExtensions) {
        vscode.commands.executeCommand("pearai.welcome.importUserSettingsFromVSCode");
      }
      if (tools) {
        tools.forEach((tool: ToolType) => {
          const toolCommand = TOOL_COMMANDS[tool];
          if (toolCommand) {
            if (toolCommand.args) {
              vscode.commands.executeCommand(toolCommand.command, toolCommand.args);
            } else {
              vscode.commands.executeCommand(toolCommand.command);
            }
          } else {
            console.warn(`Unknown tool: ${tool}`);
          }
        });
      }
    });
    this.onWebview("closePearAIOverlay", (msg) => {
      vscode.commands.executeCommand("pearai.unlockOverlay");
      vscode.commands.executeCommand("pearai.hideOverlay");
    });
    this.onWebview("highlightElement", (msg) => {
      vscode.commands.executeCommand("pearai.highlightElement", msg);
    });
    this.onWebview("unhighlightElement", (msg) => {
      vscode.commands.executeCommand("pearai.unhighlightElement", msg);
    });
    this.onWebview("getUrlTitle", async (msg) => {
      const url = msg.data;
      const res = await fetch(url);
      const text = await res.text();
      const match = text.match(/<title[^>]*>([^<]+)<\/title>/);
      return match ? match[1] : new URL(url).hostname;
    });
    this.onWebview("perplexityMode", (msg) => {
      vscode.commands.executeCommand("pearai.perplexityMode");
    });
    this.onWebview("addPerplexityContext", (msg) => {
      vscode.commands.executeCommand("pearai.addPerplexityContext", msg);
      vscode.commands.executeCommand("pearai.hideOverlay");
    });
    this.onWebview("aiderMode", (msg) => {
      vscode.commands.executeCommand("pearai.aiderMode");
    });
    this.onWebview("aiderCtrlC", (msg) => {
      vscode.commands.executeCommand("pearai.aiderCtrlC");
    });
    this.onWebview("aiderResetSession", (msg) => {
      vscode.commands.executeCommand("pearai.aiderResetSession");
    });
    this.onWebview("refreshAiderProcessState", (msg) => {
      vscode.commands.executeCommand("pearai.refreshAiderProcessState");
    }),
    this.onWebview("toggleDevTools", (msg) => {
      vscode.commands.executeCommand("workbench.action.toggleDevTools");
      vscode.commands.executeCommand("pearai.viewLogs");
    });
    this.onWebview("reloadWindow", (msg) => {
      vscode.commands.executeCommand("workbench.action.reloadWindow");
    });
    this.onWebview("focusEditor", (msg) => {
      vscode.commands.executeCommand("workbench.action.focusActiveEditorGroup");
    });
    this.onWebview("toggleFullScreen", (msg) => {
      vscode.commands.executeCommand("pearai.toggleFullScreen");
    });
    this.onWebview("bigChat", (msg) => {
      vscode.commands.executeCommand("pearai.resizeAuxiliaryBarWidth");
    });
    this.onWebview("pearaiLogin", (msg) => {
      vscode.commands.executeCommand("pearai.login");
    });
    this.onWebview("lastChat", (msg) => {
      vscode.commands.executeCommand("pearai.loadRecentChat");
    });
    this.onWebview("closeChat", (msg) => {
      vscode.commands.executeCommand("pearai.closeChat");
    });
    this.onWebview("openHistory", (msg) => {
      vscode.commands.executeCommand("pearai.viewHistory");
    });
    this.onWebview("appendSelected", (msg) => {
      vscode.commands.executeCommand("pearai.focusContinueInputWithoutClear");
    });
    // History
    this.onWebview("saveFile", async (msg) => {
      return await ide.saveFile(msg.data.filepath);
    });
    this.onWebview("readFile", async (msg) => {
      return await ide.readFile(msg.data.filepath);
    });
    this.onWebview("createFile", async (msg) => {
      const workspaceDirs = await ide.getWorkspaceDirs();
      if (workspaceDirs.length === 0) {
        throw new Error(
          "No workspace directories found. Make sure you've opened a folder in your IDE.",
        );
      }
      const filePath = path.join(
        workspaceDirs[0],
        msg.data.path.replace(/^\//, ""),
      );

      if (!fs.existsSync(filePath)) {
        await ide.writeFile(filePath, "");
      }

      return ide.openFile(filePath);
    });
    this.onWebview("showDiff", async (msg) => {
      return await ide.showDiff(
        msg.data.filepath,
        msg.data.newContents,
        msg.data.stepIndex,
      );
    });

    this.onWebview("applyToCurrentFile", async (msg) => {
      // Select the entire current file
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        vscode.window.showErrorMessage(
          "No active editor to apply edits to. Please open a file you'd like to apply the edits to first.",
        );
        return;
      }

      if (editor.selection.isEmpty) {
        const document = editor.document;
        const start = new vscode.Position(0, 0);
        const end = new vscode.Position(
          document.lineCount - 1,
          document.lineAt(document.lineCount - 1).text.length,
        );
        editor.selection = new vscode.Selection(start, end);
      }

      const verticalDiffManager = await this.verticalDiffManagerPromise;
      const prompt = `The following code was suggested as an edit:\n\`\`\`\n${msg.data.text}\n\`\`\`\nPlease apply it to the previous code.`;

      const configHandler = await configHandlerPromise;
      const config = await configHandler.loadConfig();

      const modelTitle =
        config.experimental?.modelRoles?.applyCodeBlock ??
        (await this.webviewProtocol.request("getDefaultModelTitle", undefined));

      verticalDiffManager.streamEdit(prompt, modelTitle);
    });

    this.onWebview("showTutorial", async (msg) => {
      const tutorialPath = path.join(
        getExtensionUri().fsPath,
        "pearai_tutorial.py",
      );
      // Ensure keyboard shortcuts match OS
      if (process.platform !== "darwin") {
        let tutorialContent = fs.readFileSync(tutorialPath, "utf8");
        tutorialContent = tutorialContent
          .replace("⌘", "^")
          .replace("Cmd", "Ctrl");
        fs.writeFileSync(tutorialPath, tutorialContent);
      }

      const doc = await vscode.workspace.openTextDocument(
        vscode.Uri.file(tutorialPath),
      );
      await vscode.window.showTextDocument(doc);
    });

    this.onWebview("openUrl", (msg) => {
      vscode.env.openExternal(vscode.Uri.parse(msg.data));
    });
    this.onWebview("insertAtCursor", async (msg) => {
      const editor = vscode.window.activeTextEditor;
      if (editor === undefined || !editor.selection) {
        return;
      }

      editor.edit((editBuilder) => {
        editBuilder.replace(
          new vscode.Range(editor.selection.start, editor.selection.end),
          msg.data.text,
        );
      });
    });

    /** PASS THROUGH FROM WEBVIEW TO CORE AND BACK **/
    WEBVIEW_TO_CORE_PASS_THROUGH.forEach((messageType) => {
      this.onWebview(messageType, async (msg) => {
        return (await this.inProcessMessenger.externalRequest(
          messageType,
          msg.data,
          msg.messageId,
        )) as TODO;
      });
    });

    /** PASS THROUGH FROM CORE TO WEBVIEW AND BACK **/
    CORE_TO_WEBVIEW_PASS_THROUGH.forEach((messageType) => {
      this.onCore(messageType, async (msg) => {
        return this.webviewProtocol.request(messageType, msg.data);
      });
    });

    /** CORE ONLY LISTENERS **/
    // None right now

    /** BOTH CORE AND WEBVIEW **/
    this.onWebviewOrCore("getIdeSettings", async (msg) => {
      return ide.getIdeSettings();
    });
    this.onWebviewOrCore("getDiff", async (msg) => {
      return ide.getDiff();
    });
    this.onWebviewOrCore("getTerminalContents", async (msg) => {
      return ide.getTerminalContents();
    });
    this.onWebviewOrCore("getDebugLocals", async (msg) => {
      return ide.getDebugLocals(Number(msg.data.threadIndex));
    });
    this.onWebviewOrCore("getAvailableThreads", async (msg) => {
      return ide.getAvailableThreads();
    });
    this.onWebviewOrCore("getTopLevelCallStackSources", async (msg) => {
      return ide.getTopLevelCallStackSources(
        msg.data.threadIndex,
        msg.data.stackDepth,
      );
    });
    this.onWebviewOrCore("getWorkspaceDirs", async (msg) => {
      return ide.getWorkspaceDirs();
    });
    this.onWebviewOrCore("listFolders", async (msg) => {
      return ide.listFolders();
    });
    this.onWebviewOrCore("writeFile", async (msg) => {
      return ide.writeFile(msg.data.path, msg.data.contents);
    });
    this.onWebviewOrCore("showVirtualFile", async (msg) => {
      return ide.showVirtualFile(msg.data.name, msg.data.content);
    });
    this.onWebviewOrCore("getContinueDir", async (msg) => {
      return ide.getContinueDir();
    });
    this.onWebviewOrCore("openFile", async (msg) => {
      return ide.openFile(msg.data.path);
    });
    this.onWebviewOrCore("runCommand", async (msg) => {
      await ide.runCommand(msg.data.command);
    });
    this.onWebviewOrCore("getSearchResults", async (msg) => {
      return ide.getSearchResults(msg.data.query);
    });
    this.onWebviewOrCore("subprocess", async (msg) => {
      return ide.subprocess(msg.data.command);
    });
    this.onWebviewOrCore("getProblems", async (msg) => {
      return ide.getProblems(msg.data.filepath);
    });
    this.onWebviewOrCore("getBranch", async (msg) => {
      const { dir } = msg.data;
      return ide.getBranch(dir);
    });
    this.onWebviewOrCore("getOpenFiles", async (msg) => {
      return ide.getOpenFiles();
    });
    this.onWebviewOrCore("getCurrentFile", async () => {
      return ide.getCurrentFile();
    });
    this.onWebviewOrCore("getPinnedFiles", async (msg) => {
      return ide.getPinnedFiles();
    });
    this.onWebviewOrCore("showLines", async (msg) => {
      const { filepath, startLine, endLine } = msg.data;
      return ide.showLines(filepath, startLine, endLine);
    });
    // Other
    this.onWebviewOrCore("errorPopup", (msg) => {
      vscode.window
        .showErrorMessage(msg.data.message, "Show Logs")
        .then((selection) => {
          if (selection === "Show Logs") {
            vscode.commands.executeCommand("workbench.action.toggleDevTools");
          }
        });
    });
    this.onWebviewOrCore("infoPopup", (msg) => {
      vscode.window.showInformationMessage(msg.data.message);
    });
    this.onWebviewOrCore("getGitHubAuthToken", (msg) =>
      ide.getGitHubAuthToken(),
    );

    this.onWebviewOrCore("getPearAuth", (msg) => ide.getPearAuth());

    this.onWebviewOrCore("getControlPlaneSessionInfo", async (msg) => {
      return getControlPlaneSessionInfo(msg.data.silent);
    });
    this.onWebviewOrCore("logoutOfControlPlane", async (msg) => {
      const sessions = await this.workOsAuthProvider.getSessions();
      await Promise.all(
        sessions.map((session) => workOsAuthProvider.removeSession(session.id)),
      );
    });
  }
}
