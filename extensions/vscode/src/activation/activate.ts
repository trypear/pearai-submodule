import { getContinueRcPath, getTsConfigPath, migrate } from "core/util/paths";
import { Telemetry } from "core/util/posthog";
import path from "node:path";
import * as vscode from "vscode";
import { VsCodeExtension } from "../extension/VsCodeExtension";
import registerQuickFixProvider from "../lang-server/codeActions";
import { getExtensionVersion } from "../util/util";
import { VsCodeContinueApi } from "./api";
import { setupInlineTips } from "./inlineTips";
import { isFirstLaunch, OLD_FIRST_LAUNCH_KEY } from "../copySettings";

export let vscodeExtension: VsCodeExtension | undefined;

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

  // If state is set and is true, it's not first launch
  if (context.globalState.get(OLD_FIRST_LAUNCH_KEY)) {
    vscode.commands.executeCommand("pearai.welcome.markNewOnboardingComplete")
    // mark the old key false, so that this condition only runs once and never again.
    await context.globalState.update(OLD_FIRST_LAUNCH_KEY, false);
  }

  vscodeExtension = new VsCodeExtension(context);

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

  setupPearAppLayout(context);

  if (isFirstLaunch(context)) {
    vscode.commands.executeCommand("pearai.startOnboarding");
  }


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

  // Force PearAI view mode
  try {
    await vscode.workspace.getConfiguration().update('workbench.sideBar.location', 'left', true);

  } catch (error) {
    console.dir(error);
  }

    // Force PearAI update mode
    try {
      const currentUpdateMode = vscode.workspace.getConfiguration().get('update.mode');
      if (currentUpdateMode !== 'default') {
        await vscode.workspace.getConfiguration().update('update.mode', 'default', true);
      }
    } catch (error) {
      console.dir(error);
    }

  const api = new VsCodeContinueApi(vscodeExtension);
  const continuePublicApi = {
    registerCustomContextProvider: api.registerCustomContextProvider.bind(api),
  };

  // 'export' public api-surface
  // or entire extension for testing
  return {
      ...continuePublicApi,
      extension: vscodeExtension,
    };
}

// Custom Layout settings that we want default for PearAPP
const setupPearAppLayout = async (context: vscode.ExtensionContext) => {
  if (!vscode.workspace.workspaceFolders) {
    console.log("No workspace folders found");
    vscode.commands.executeCommand("workbench.action.closeSidebar");
    vscode.commands.executeCommand("workbench.action.closeAuxiliaryBar");
  } else {
    // Get auxiliary bar visibility state
    vscode.commands.executeCommand("workbench.action.movePearExtensionToAuxBar");
    const pearAIVisible = vscode.workspace.getConfiguration().get('workbench.auxiliaryBar.visible');
    // Show auxiliary bar if it's not already visible
    if (!pearAIVisible) {
      await vscode.commands.executeCommand('workbench.action.toggleAuxiliaryBar');
    }
    // Default to agent view
    vscode.commands.executeCommand("pearai.focusAgentView");
  }

  if (isFirstLaunch(context)) {
    // set activity bar position to top
    vscode.commands.executeCommand("workbench.action.activityBarLocation.top");
  }
};