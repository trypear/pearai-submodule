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

  setupPearAppLayout(context);

  if (isFirstLaunch(context)) {
    vscode.commands.executeCommand("pearai.startOnboarding");
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

  // Force PearAI view mode
  try {
    await vscode.workspace.getConfiguration().update('workbench.sideBar.location', 'left', true);
    // Get auxiliary bar visibility state
    const pearAIVisible = vscode.workspace.getConfiguration().get('workbench.auxiliaryBar.visible');

    // Show auxiliary bar if it's not already visible
    if (!pearAIVisible) {
      await vscode.commands.executeCommand('workbench.action.toggleAuxiliaryBar');
    }
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

  try {
    // Default to agent view
    vscode.commands.executeCommand("pearai.focusAgentView");
  } catch (error) {
    // vscode.window.showErrorMessage(`Failed to install extension: ${extensionId}`);
    console.error(error);
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
const setupPearAppLayout = async (context: vscode.ExtensionContext) => {
  console.log("Starting setupPearAppLayout - IM HERE 9999");

  // move pearai extension views to auxiliary bar (secondary side bar)
  console.log("About to move extension to aux bar - IM HERE 9999");

  if (!vscode.workspace.workspaceFolders) {
    console.log("No workspace folders found - IM HERE 9999");
    vscode.commands.executeCommand("workbench.action.closeSidebar");
    console.log("Sidebar closed - IM HERE 9999");
    vscode.commands.executeCommand("workbench.action.closeAuxiliaryBar");
    console.log("Auxiliary bar closed - IM HERE 9999");
  } else {
    vscode.commands.executeCommand("workbench.action.movePearExtensionToAuxBar");
  }

  if (isFirstLaunch(context)) {
    console.log("First launch detected - IM HERE 9999");
    // set activity bar position to top
    vscode.commands.executeCommand("workbench.action.activityBarLocation.top");
    console.log("Activity bar moved to top - IM HERE 9999");
  }

  console.log("Setup complete - IM HERE 9999");
};