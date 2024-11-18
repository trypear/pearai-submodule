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
