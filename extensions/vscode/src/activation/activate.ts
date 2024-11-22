import { getContinueRcPath, getTsConfigPath, migrate } from "core/util/paths";
import { Telemetry } from "core/util/posthog";
import path from "node:path";
import * as vscode from "vscode";
import { VsCodeExtension } from "../extension/VsCodeExtension";
import registerQuickFixProvider from "../lang-server/codeActions";
import { getExtensionVersion } from "../util/util";
import { getExtensionUri } from "../util/vscode";
import { VsCodeContinueApi } from "./api";
import { setupInlineTips } from "./inlineTips";
import { isFirstLaunch } from "../copySettings";
import { exec } from 'child_process';


export async function isVSCodeExtensionInstalled(extensionId: string): Promise<boolean> {
  return vscode.extensions.getExtension(extensionId) !== undefined;
};

export async function attemptInstallExtension(extensionId: string): Promise<void> {
  // Check if extension is already installed
  const extension = vscode.extensions.getExtension(extensionId);

  if (extension) {
      // vscode.window.showInformationMessage(`Extension ${extensionId} is already installed.`);
      return;
  }

  try {
      await vscode.commands.executeCommand('workbench.extensions.installExtension', extensionId);
      // vscode.window.showInformationMessage(`Successfully installed extension: ${extensionId}`);
  } catch (error) {
      // vscode.window.showErrorMessage(`Failed to install extension: ${extensionId}`);
      console.error(error);
  }
}

export async function attemptUninstallExtension(extensionId: string): Promise<void> {
  // Check if extension is installed
  const extension = vscode.extensions.getExtension(extensionId);

  if (!extension) {
      // Extension is not installed
      return;
  }

  try {
      await vscode.commands.executeCommand('workbench.extensions.uninstallExtension', extensionId);
      // vscode.window.showInformationMessage(`Successfully uninstalled extension: ${extensionId}`);
  } catch (error) {
      // vscode.window.showErrorMessage(`Failed to uninstall extension: ${extensionId}`);
      console.error(error);
  }
}


async function setProjectId(context: vscode.ExtensionContext) {
  // this function sets a project id based on the root commit hash of the current git repository
  // it can be used to uniquely identify a project and store personalization memories
  try {
      // check if already set
      if (context.workspaceState.get('projectId')) {
          console.dir("PROJECT ID ALREADY SET");
          console.dir(context.workspaceState.get('projectId'));
          return;
      }
      // Get the Git repository info
      const gitRepo = vscode.workspace.workspaceFolders?.[0];
      if (gitRepo) {
          // Get the root commit hash
          exec('git rev-list --max-parents=0 HEAD -n 1', { cwd: gitRepo.uri.fsPath }, (err, stdout) => {
              if (!err) {
                 // use root commit hash as project id because it remains constant for the entire life of the repo
                  const rootCommitHash = stdout.trim();
                  console.dir("GOT PROJECT ID");
                  console.dir(rootCommitHash);
                  context.workspaceState.update('projectId', rootCommitHash);  // store in workspace state
              }
          });
      }  // if not git initialized, id will simply be user-id (uid)
  } catch (error) {
      console.error('Failed to initialize project ID:', error);
  }
}


export async function activateExtension(context: vscode.ExtensionContext) {
  // Add necessary files
  getTsConfigPath();
  getContinueRcPath();

  // Register commands and providers
  registerQuickFixProvider();
  setupInlineTips(context);

  const vscodeExtension = new VsCodeExtension(context);

  // migrate("showWelcome_1", () => {
  //   vscode.commands.executeCommand(
  //     "markdown.showPreview",
  //     vscode.Uri.file(
  //       path.join(getExtensionUri().fsPath, "media", "welcome.md"),
  //     ),
  //   );

  //   vscode.commands.executeCommand("pearai.focusContinueInput");
  // });


  // for DEV'ing welcome page
  // if (true || isFirstLaunch(context)) {
  //   vscode.commands.executeCommand("pearai.startOnboarding");
  // }

  setProjectId(context);
  if (isFirstLaunch(context)) {
    vscode.commands.executeCommand("pearai.startOnboarding");
    setupPearAPPLayout(context);
  }

  // vscode.commands.executeCommand("pearai.focusContinueInput");

  // Load PearAI configuration
  if (!context.globalState.get("hasBeenInstalled")) {
    context.globalState.update("hasBeenInstalled", true);
    Telemetry.capture(
      "install",
      {
        extensionVersion: getExtensionVersion(),
      },
      true,
    );
  }

  const api = new VsCodeContinueApi(vscodeExtension);
  const continuePublicApi = {
    registerCustomContextProvider: api.registerCustomContextProvider.bind(api),
  };

  // 'export' public api-surface
  // or entire extension for testing
  return process.env.NODE_ENV === "test"
    ? {
        ...continuePublicApi,
        extension: vscodeExtension,
      }
    : continuePublicApi;
}

// Custom Layout settings that we want default for PearAPP
const setupPearAPPLayout = async (context: vscode.ExtensionContext) => {
  vscode.commands.executeCommand("workbench.action.movePearExtensionToAuxBar");
  // set activity bar position to top
  vscode.commands.executeCommand("workbench.action.activityBarLocation.top");
};
