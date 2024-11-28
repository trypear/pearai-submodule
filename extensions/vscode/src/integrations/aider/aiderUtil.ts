import * as vscode from "vscode";
import * as cp from "child_process";
import { Core } from "core/core";
import { ContinueGUIWebviewViewProvider, PEAR_OVERLAY_VIEW_ID } from "../../ContinueGUIWebviewViewProvider";
import { getIntegrationTab } from "../../util/integrationUtils";
import Aider from "core/llm/llms/AiderLLM";
import { execSync } from "child_process";
import { isFirstPearAICreatorLaunch } from "../../copySettings";
import { VsCodeWebviewProtocol } from "../../webviewProtocol";
import * as os from "os";

export const PEARAI_AIDER_VERSION = "0.64.0";

const PLATFORM = process.platform;
const IS_WINDOWS = PLATFORM === "win32";
const IS_MAC = PLATFORM === "darwin";
const IS_LINUX = PLATFORM === "linux";

let aiderPanel: vscode.WebviewPanel | undefined;

// Aider process management functions
// startAiderProcess is in util because if it is in aiderProcess, it introduces circular dependencies between aiderProcess.ts and aiderLLM.ts
export async function startAiderProcess(core: Core) {
  const config = await core.configHandler.loadConfig();
  const aiderModel = config.models.find((model) => model instanceof Aider) as
    | Aider
    | undefined;

  if (!aiderModel) {
    console.warn("No Aider model found in configuration");
    return;
  }

  // Check if current workspace is a git repo
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    await aiderModel.setAiderState({state: "notgitrepo"});
    // vscode.window.showErrorMessage('Please open a workspace folder to use PearAI Creator.');
    return;
  }

  const isGitRepo = await isGitRepository(workspaceFolders[0].uri.fsPath);
  if (!isGitRepo) {
    console.dir("setting state to notgitrepo");
    await aiderModel.setAiderState({state: "notgitrepo"});
    return;
  }

  const isAiderInstalled = await checkAiderInstallation();

  if (!isAiderInstalled) {
    await aiderModel.setAiderState({state: "uninstalled"});
    return;
  }
  

  try {
    await aiderModel.startAiderChat(aiderModel.model, aiderModel.apiKey);
  } catch (e) {
    console.warn(`Error starting Aider process: ${e}`);
  }
}

export async function sendAiderProcessStateToGUI(core: Core, webviewProtocol: VsCodeWebviewProtocol) {
  const config = await core.configHandler.loadConfig();
  const aiderModel = config.models.find((model) => model instanceof Aider) as
    | Aider
    | undefined;


  if (!aiderModel) {
    webviewProtocol?.request("setAiderProcessStateInGUI", { state: "stopped" }, [PEAR_OVERLAY_VIEW_ID]);
    return;
  }
  console.dir("Sending state to Aider GUI:");
  console.dir(aiderModel.getAiderState())
  webviewProtocol?.request("setAiderProcessStateInGUI", aiderModel.getAiderState(), [PEAR_OVERLAY_VIEW_ID]);
}

export async function killAiderProcess(core: Core) {
  const config = await core.configHandler.loadConfig();
  const aiderModels = config.models.filter(
    (model) => model instanceof Aider,
  ) as Aider[];

  try {
    if (aiderModels.length > 0) {
      aiderModels.forEach((model) => {
        model.killAiderProcess();
      });
    }
  } catch (e) {
    console.warn(`Error killing Aider process: ${e}`);
  }
}

export async function aiderCtrlC(core: Core) {
  const config = await core.configHandler.loadConfig();
  const aiderModels = config.models.filter(
    (model) => model instanceof Aider,
  ) as Aider[];

  try {
    if (aiderModels.length > 0) {
      aiderModels.forEach((model) => {
        if (Aider.aiderProcess) {
          model.aiderCtrlC();
        }
      });
      // This is when we cancelled an ongoing request
    }
  } catch (e) {
    console.warn(`Error sending Ctrl-C to Aider process: ${e}`);
  }
}

export async function aiderResetSession(core: Core) {
  const config = await core.configHandler.loadConfig();
  const aiderModel = config.models.find(
    (model) => model instanceof Aider
  ) as Aider | undefined;

  try {
    if (aiderModel && Aider.aiderProcess) {
      aiderModel.aiderResetSession(aiderModel.model, aiderModel.apiKey);
    }
  } catch (e) {
    console.warn(`Error resetting Aider session: ${e}`);
  }
}


export async function installAider(core: Core) {
  const isPythonInstalled = await checkPythonInstallation();
  const isBrewInstalled = IS_MAC || IS_LINUX ? await checkBrewInstallation() : true;
  const isAiderInstalled = await checkAiderInstallation();

  if (isAiderInstalled) {
    return false;
  }

  if (!isAiderInstalled) {
    if (!isBrewInstalled || !isPythonInstalled) {
      vscode.window.showInformationMessage(
        "Please follow manual installation steps to install Aider."
      );
      return;
    }

    vscode.window.showInformationMessage("Installing Aider...");

    let success = false;
    
    if (IS_WINDOWS) {
      const command = [
        "python -m pip install pipx",
        "pipx ensurepath",
        `pipx install aider-chat==${PEARAI_AIDER_VERSION}`,
        `echo "\nAider ${PEARAI_AIDER_VERSION} installation complete."`
      ].join(";");

      try {
        execSync(command);
        success = true;
      } catch (error) {
        console.error("Failed to install Aider via pipx on Windows:", error);
        return true;
      }
    } else {
      // For Mac/Linux, try pipx first
      try {
        const pipxCommand = [
          "brew install pipx",
          `pipx install aider-chat==${PEARAI_AIDER_VERSION}`,
          `echo "\nAider ${PEARAI_AIDER_VERSION} installation complete."`
        ].join(";");
        
        execSync(pipxCommand);
        success = true;
      } catch (pipxError) {
        console.log("Failed to install Aider via pipx, trying brew...");
        
        // If pipx fails, try installing directly with brew
        try {
          execSync("brew install aider");
          success = true;
        } catch (brewError) {
          console.error("Failed to install Aider via brew:", brewError);
          return true;
        }
      }
    }

    if (success) {
      core.invoke("llm/startAiderProcess", undefined);
      return false;
    }
    return true;
  }
}

export async function uninstallAider(core: Core) {
  const isAiderInstalled = await checkAiderInstallation();
  if (!isAiderInstalled) {
    return;
  }
  vscode.window.showInformationMessage("Uninstalling Aider...");
  if (IS_WINDOWS) {
    execSync("python -m pip uninstall -y aider-chat");
  } else {
    execSync("brew uninstall aider");
  }
}

export async function openAiderPanel(
  core: Core,
  sidebar: ContinueGUIWebviewViewProvider,
  extensionContext: vscode.ExtensionContext,
) {
  // Check if aider is already open by checking open tabs
  const aiderTab = getIntegrationTab("pearai.aiderGUIView");
  console.log("Aider tab found:", aiderTab);
  console.log("Aider tab active:", aiderTab?.isActive);
  console.log("Aider panel exists:", !!aiderPanel);

  // Check if the active editor is the Continue GUI View
  if (aiderTab && aiderTab.isActive) {
    vscode.commands.executeCommand("workbench.action.closeActiveEditor"); //this will trigger the onDidDispose listener below
    return;
  }

  if (aiderTab && aiderPanel) {
    //aider open, but not focused - focus it
    aiderPanel.reveal();
    return;
  }

  //create the full screen panel
  let panel = vscode.window.createWebviewPanel(
    "pearai.aiderGUIView",
    "PearAI Creator (Powered by aider)",
    vscode.ViewColumn.One,
    {
      retainContextWhenHidden: true,
    },
  );
  aiderPanel = panel;

  //Add content to the panel
  panel.webview.html = sidebar.getSidebarContent(
    extensionContext,
    panel,
    undefined,
    undefined,
    true,
    "/aiderMode",
  );

  sidebar.webviewProtocol?.request(
    "focusContinueInputWithNewSession",
    undefined,
    ["pearai.aiderGUIView"],
  );

  //When panel closes, reset the webview and focus
  panel.onDidDispose(
    () => {
      // Kill background process
      // core.invoke("llm/killAiderProcess", undefined);

      // The following order is important as it does not reset the history in chat when closing creator
      vscode.commands.executeCommand("pearai.focusContinueInput");
      sidebar.resetWebviewProtocolWebview();
    },
    null,
    extensionContext.subscriptions,
  );
}
export function getUserShell(): string {
  if (IS_WINDOWS) {
    return process.env.COMSPEC || "cmd.exe";
  }
  return process.env.SHELL || "/bin/sh";
}

export function getUserPath(): string {
  try {
    let pathCommand: string;
    const shell = getUserShell();

    if (os.platform() === "win32") {
      // For Windows, we'll use a PowerShell command
      pathCommand =
        "powershell -Command \"[Environment]::GetEnvironmentVariable('Path', 'User') + ';' + [Environment]::GetEnvironmentVariable('Path', 'Machine')\"";
    } else {
      // For Unix-like systems (macOS, Linux)
      pathCommand = `${shell} -ilc 'echo $PATH'`;
    }

    return execSync(pathCommand, { encoding: "utf8" }).trim();
  } catch (error) {
    console.error("Error getting user PATH:", error);
    return process.env.PATH || "";
  }
}

// Utility functions for installation and checks
export async function checkPythonInstallation(): Promise<boolean> {
  const commands = ["python3 --version", "python --version"];

  for (const command of commands) {
    try {
      await executeCommand(command);
      return true;
    } catch (error) {
      console.warn(`${command} failed: ${error}`);
    }
  }

  console.warn("Python 3 is not installed or not accessible on this system.");
  return false;
}

export async function checkAiderInstallation(): Promise<boolean> {
  const commands = [
    "aider --version",
    "python -m aider --version",
    "python3 -m aider --version",
  ];

  for (const cmd of commands) {
    try {
      await executeCommand(cmd);
      return true;
    } catch (error) {
      console.warn(`Failed to execute ${cmd}: ${error}`);
    }
  }
  return false;
}

export async function checkBrewInstallation(): Promise<boolean> {
  try {
    await executeCommand("brew --version");
    return true;
  } catch (error) {
    console.warn(`Brew is not installed: ${error}`);
    return false;
  }
}

export async function executeCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cp.exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || error);
      } else {
        resolve(stdout);
      }
    });
  });
}

export async function checkGitRepository(currentDirectory?: string): Promise<boolean> {
  try {
      const currentDir = currentDirectory || process.cwd();
      // Use a more robust git check method
      execSync('git rev-parse --is-inside-work-tree', { cwd: currentDir });
      return true;
  } catch {
      return false;
  }
}

export function checkCredentials(model: string, credentials: { getAccessToken: () => string | undefined }): boolean {
  // Implement credential check logic
  if (!model.includes("claude") && !model.includes("gpt")) {
      const accessToken = credentials.getAccessToken();
      return !!accessToken;
  }
  return true;
}

export async function getCurrentWorkingDirectory(getCurrentDirectory?: () => Promise<string>): Promise<string> {
  if (getCurrentDirectory) {
      return await getCurrentDirectory();
  }
  return process.cwd();
}

// check if directory is a git repo
async function isGitRepository(directory: string): Promise<boolean> {
  try {
    const result = execSync('git rev-parse --is-inside-work-tree', {
      cwd: directory,
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf-8'
    }).trim();
    return result === 'true';
  } catch (error) {
    console.log('Aider Error:Directory is not a git repository:', error);
    return false;
  }
}
