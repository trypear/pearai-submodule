// DEPRECATED AS OF v1.8.1


// import * as vscode from "vscode";
// import * as cp from "child_process";
// import { Core } from "core/core";
// import { ContinueGUIWebviewViewProvider } from "../../ContinueGUIWebviewViewProvider";
// import { getIntegrationTab } from "../../util/integrationUtils";
// import Aider from "core/llm/llms/AiderLLM";
// import { execSync } from "child_process";
// import { isFirstPearAICreatorLaunch } from "../../copySettings";
// import { VsCodeWebviewProtocol } from "../../webviewProtocol";
// import * as os from "os";
// import { PEARAI_OVERLAY_VIEW_ID } from "../../util/pearai/pearaiViewTypes";

// export const PEARAI_AIDER_VERSION = "0.72.0";

// const PLATFORM = process.platform;
// const IS_WINDOWS = PLATFORM === "win32";
// const IS_MAC = PLATFORM === "darwin";
// const IS_LINUX = PLATFORM === "linux";

// const pythonCommand = IS_WINDOWS ? "py -3.9" : "python3.9";

// let aiderPanel: vscode.WebviewPanel | undefined;

// // Aider process management functions
// // startAiderProcess is in util because if it is in aiderProcess, it introduces circular dependencies between aiderProcess.ts and aiderLLM.ts
// export async function startAiderProcess(core: Core) {
//   const config = await core.configHandler.loadConfig();
//   const aiderModel = config.models.find((model) => model instanceof Aider) as
//     | Aider
//     | undefined;

//   if (!aiderModel) {
//     console.warn("No Aider model found in configuration");
//     return;
//   }

//   // Check if current workspace is a git repo
//   const workspaceFolders = vscode.workspace.workspaceFolders;
//   if (!workspaceFolders || workspaceFolders.length === 0) {
//     await aiderModel.setAiderState({state: "notgitrepo"});
//     // vscode.window.showErrorMessage('Please open a workspace folder to use PearAI Creator.');
//     return;

//   }

//   const isGitRepo = await isGitRepository(workspaceFolders[0].uri.fsPath);
//   if (!isGitRepo) {
//     console.dir("setting state to notgitrepo");
//     await aiderModel.setAiderState({state: "notgitrepo"});
//     return;
//   }

//   const isAiderInstalled = await checkAiderInstallation();

//   if (!isAiderInstalled) {
//     await aiderModel.setAiderState({state: "uninstalled"});
//     // TODO: @nang: add a state variable for aider toggled. If it is, then install aider.
//     // await aiderModel.setAiderState({state: "installing"});
//     // const installSuccess = await installAider(core);
//     // if (!installSuccess) {
//     //   await aiderModel.setAiderState({state: "uninstalled"});
//     //   return;
//     // }
//     return;
//   }


//   try {
//     await aiderModel.startAiderChat(aiderModel.model, aiderModel.apiKey);
//   } catch (e) {
//     console.warn(`Error starting Aider process: ${e}`);
//   }
// }

// export async function sendAiderProcessStateToGUI(core: Core, webviewProtocol: VsCodeWebviewProtocol) {
//   const config = await core.configHandler.loadConfig();
//   const aiderModel = config.models.find((model) => model instanceof Aider) as
//     | Aider
//     | undefined;


//   if (!aiderModel) {
//     webviewProtocol?.request("setAiderProcessStateInGUI", { state: "stopped" }, [PEARAI_OVERLAY_VIEW_ID]);
//     return;
//   }
//   console.dir("Sending state to Aider GUI:");
//   console.dir(aiderModel.getAiderState())
//   webviewProtocol?.request("setAiderProcessStateInGUI", aiderModel.getAiderState(), [PEARAI_OVERLAY_VIEW_ID]);
// }

// export async function killAiderProcess(core: Core) {
//   const config = await core.configHandler.loadConfig();
//   const aiderModels = config.models.filter(
//     (model) => model instanceof Aider,
//   ) as Aider[];

//   try {
//     if (aiderModels.length > 0) {
//       aiderModels.forEach((model) => {
//         model.killAiderProcess();
//       });
//     }
//   } catch (e) {
//     console.warn(`Error killing Aider process: ${e}`);
//   }
// }

// export async function aiderCtrlC(core: Core) {
//   const config = await core.configHandler.loadConfig();
//   const aiderModels = config.models.filter(
//     (model) => model instanceof Aider,
//   ) as Aider[];

//   try {
//     if (aiderModels.length > 0) {
//       aiderModels.forEach((model) => {
//         if (Aider.aiderProcess) {
//           model.aiderCtrlC();
//         }
//       });
//       // This is when we cancelled an ongoing request
//     }
//   } catch (e) {
//     console.warn(`Error sending Ctrl-C to Aider process: ${e}`);
//   }
// }

// export async function aiderResetSession(core: Core) {
//   const config = await core.configHandler.loadConfig();
//   const aiderModel = config.models.find(
//     (model) => model instanceof Aider
//   ) as Aider | undefined;

//   try {
//     if (aiderModel && Aider.aiderProcess) {
//       aiderModel.aiderResetSession(aiderModel.model, aiderModel.apiKey);
//     }
//   } catch (e) {
//     console.warn(`Error resetting Aider session: ${e}`);
//   }
// }


// export async function openAiderPanel(
//   core: Core,
//   sidebar: ContinueGUIWebviewViewProvider,
//   extensionContext: vscode.ExtensionContext,
// ) {
//   // Check if aider is already open by checking open tabs
//   const aiderTab = getIntegrationTab("pearai.aiderGUIView");
//   console.log("Aider tab found:", aiderTab);
//   console.log("Aider tab active:", aiderTab?.isActive);
//   console.log("Aider panel exists:", !!aiderPanel);

//   // Check if the active editor is the Continue GUI View
//   if (aiderTab && aiderTab.isActive) {
//     vscode.commands.executeCommand("workbench.action.closeActiveEditor"); //this will trigger the onDidDispose listener below
//     return;
//   }

//   if (aiderTab && aiderPanel) {
//     //aider open, but not focused - focus it
//     aiderPanel.reveal();
//     return;
//   }

//   //create the full screen panel
//   let panel = vscode.window.createWebviewPanel(
//     "pearai.aiderGUIView",
//     "PearAI Creator (Powered by aider)",
//     vscode.ViewColumn.One,
//     {
//       retainContextWhenHidden: true,
//     },
//   );
//   aiderPanel = panel;

//   //Add content to the panel
//   panel.webview.html = sidebar.getSidebarContent(
//     extensionContext,
//     panel,
//     undefined,
//     undefined,
//     true,
//     "/aiderMode",
//   );

//   sidebar.webviewProtocol?.request(
//     "focusContinueInputWithNewSession",
//     undefined,
//     ["pearai.aiderGUIView"],
//   );

//   //When panel closes, reset the webview and focus
//   panel.onDidDispose(
//     () => {
//       // Kill background process
//       // core.invoke("llm/killAiderProcess", undefined);

//       // The following order is important as it does not reset the history in chat when closing creator
//       vscode.commands.executeCommand("pearai.focusContinueInput");
//       sidebar.resetWebviewProtocolWebview();
//     },
//     null,
//     extensionContext.subscriptions,
//   );
// }

// export async function installAider(core: Core) {
//   // Check if Aider is already installed
//   const isAiderInstalled = await checkAiderInstallation();
//   if (isAiderInstalled) {
//     return true;
//   }

//   if (IS_MAC) {
//     return await installAiderMac(core);
//   } else if (IS_LINUX) {
//     return await installAiderLinux(core);
//   } else if (IS_WINDOWS) {
//     return await installAiderWindows(core);
//   }

//   vscode.window.showErrorMessage("Unsupported operating system");
//   return false;
// }

// export async function uninstallAider(core: Core) {
//   const isAiderInstalled = await checkAiderInstallation();
//   if (!isAiderInstalled) {
//     return;
//   }
//   vscode.window.showInformationMessage("Uninstalling Aider...");
//   if (IS_WINDOWS) {
//     execSync("python3.9 -m pipx uninstall aider-chat");
//   } else {
//     execSync("pipx uninstall aider");
//   }
// }

// export function getUserShell(): string {
//   if (IS_WINDOWS) {
//     return process.env.COMSPEC || "cmd.exe";
//   }
//   return process.env.SHELL || "/bin/sh";
// }

// export function getUserPath(): string {
//   try {
//     let pathCommand: string;
//     const shell = getUserShell();

//     if (os.platform() === "win32") {
//       // For Windows, we'll use a PowerShell command
//       pathCommand =
//         "powershell -Command \"[Environment]::GetEnvironmentVariable('Path', 'User') + ';' + [Environment]::GetEnvironmentVariable('Path', 'Machine')\"";
//     } else {
//       // For Unix-like systems (macOS, Linux)
//       pathCommand = `${shell} -ilc 'echo $PATH'`;
//     }

//     return execSync(pathCommand, { encoding: "utf8" }).trim();
//   } catch (error) {
//     console.error("Error getting user PATH:", error);
//     return process.env.PATH || "";
//   }
// }

// // Utility functions for installation and checks
// export async function checkPython39Installation(): Promise<boolean> {
//   try {
//     const pythonVersion = await executeCommand(`${pythonCommand} --version`);
//     if (pythonVersion.includes("Python 3.9")) {
//       return true;
//     }

//     if (IS_MAC) {
//       console.log("Installing Python 3.9 via Homebrew...");
//       await executeCommand("brew install python@3.9");
//       await executeCommand("brew link python@3.9");
//     } else if (IS_LINUX) {
//       console.log("Installing Python 3.9...");
//       if (await (await executeCommand("which apt")).length > 0) {
//         // Debian/Ubuntu
//         await executeCommand("sudo apt update");
//         await executeCommand("sudo apt install -y python3.9");
//       } else if (await (await executeCommand("which dnf")).length > 0) {
//         // Fedora/RHEL
//         await executeCommand("sudo dnf install -y python39");
//       }
//     } else if (IS_WINDOWS) {
//       console.log("Please install Python 3.9 from python.org");
//       vscode.window.showErrorMessage(
//         "Python 3.9 is required. Please install it from python.org and try again."
//       );
//       return false;
//     }

//     // Verify installation
//     const newPythonVersion = await executeCommand("python3.9 --version");
//     return newPythonVersion.includes("Python 3.9");
//   } catch (error) {
//     console.warn(`Python 3.9 check/installation failed: ${error}`);
//     return false;
//   }
// }

// export async function checkAiderInstallation(): Promise<boolean> {
//   const commands = [
//     "aider --version",
//   ];

//   for (const cmd of commands) {
//     try {
//       await executeCommand(cmd);
//       return true;
//     } catch (error) {
//       console.warn(`Failed to execute ${cmd}: ${error}`);
//     }
//   }
//   return false;
// }

// export async function checkBrewInstallation(): Promise<boolean> {
//   try {
//     await executeCommand("brew --version");
//     return true;
//   } catch (error) {
//     console.warn(`Brew is not installed: ${error}`);
//     return false;
//   }
// }

// async function installAiderMac(core: Core): Promise<boolean> {
//   // Step 1: Check for Homebrew
//   let isBrewInstalled = await checkBrewInstallation();
//   if (!isBrewInstalled) {
//     vscode.window.showErrorMessage("Homebrew is required. Please install Homebrew manually and try again.");
//     return false;
//   }

//   // Step 2: Check and install Python 3.9
//   await checkPython39Installation();

//   // Step 3: Check for pipx and install if needed
//   try {
//     console.log("Checking pipx installation...");
//     try {
//       await executeCommand("pipx --version");
//       console.log("pipx is already installed");
//     } catch {
//       console.log("Installing pipx...");
//       await executeCommand("brew install pipx");
//       await executeCommand("pipx ensurepath");
//     }
//   } catch (error) {
//     console.error("Failed to install pipx:", error);
//     vscode.window.showErrorMessage("Failed to install pipx");
//     return false;
//   }

//   // Step 4: Install Aider via pipx
//   try {
//     console.log("Installing Aider...");
//     await executeCommand(`pipx install --python python3.9 aider-chat==${PEARAI_AIDER_VERSION}`);
//   } catch (error) {
//     console.error("Failed to install Aider:", error);
//     vscode.window.showErrorMessage("Failed to install Aider");
//     return false;
//   }

//   vscode.window.showInformationMessage(`Aider ${PEARAI_AIDER_VERSION} installation completed successfully.`);
//   core.invoke("llm/startAiderProcess", undefined);
//   return true;
// }

// async function installAiderLinux(core: Core): Promise<boolean> {
//   // Step 1: Check package manager
//   let packageManager: string;
//   try {
//     await executeCommand("which apt");
//     packageManager = "apt";
//   } catch {
//     try {
//       await executeCommand("which dnf");
//       packageManager = "dnf";
//     } catch {
//       vscode.window.showErrorMessage("Unsupported Linux distribution. Please install manually.");
//       return false;
//     }
//   }

//   // Step 2: Install Python 3.9
//   checkPython39Installation()

//   // Step 3: Install pipx
//   try {
//     console.log("Installing pipx...");
//     await executeCommand("python3.9 -m pip install --user pipx");
//     await executeCommand("python3.9 -m pipx ensurepath");
//   } catch (error) {
//     console.error("Failed to install pipx:", error);
//     vscode.window.showErrorMessage("Failed to install pipx");
//     return false;
//   }

//   // Step 4: Install Aider
//   try {
//     console.log("Installing Aider...");
//     await executeCommand(`python3.9 -m pipx install --python python3.9 aider-chat==${PEARAI_AIDER_VERSION}`);
//   } catch (error) {
//     console.error("Failed to install Aider:", error);
//     vscode.window.showErrorMessage("Failed to install Aider");
//     return false;
//   }

//   vscode.window.showInformationMessage(`Aider ${PEARAI_AIDER_VERSION} installation completed successfully.`);
//   core.invoke("llm/startAiderProcess", undefined);
//   return true;
// }

// async function installAiderWindows(core: Core): Promise<boolean> {
//   // Step 1: Check Python 3.9
//   checkPython39Installation()

//   // Step 2: Install pipx
//   try {
//     console.log("Installing pipx...");
//     await executeCommand(`${pythonCommand} -m pip install --user pipx`);
//     await executeCommand(`${pythonCommand} -m pipx ensurepath`);
//   } catch (error) {
//     console.error("Failed to install pipx:", error);
//     vscode.window.showErrorMessage("Failed to install pipx");
//     return false;
//   }

//   // Step 3: Install Aider
//   try {
//     console.log("Installing Aider...");
//     await executeCommand(`${pythonCommand} -m pipx install --python python3.9 aider-chat==${PEARAI_AIDER_VERSION}`);
//   } catch (error) {
//     console.error("Failed to install Aider:", error);
//     vscode.window.showErrorMessage("Failed to install Aider");
//     return false;
//   }

//   vscode.window.showInformationMessage(`Aider ${PEARAI_AIDER_VERSION} installation completed successfully.`);
//   core.invoke("llm/startAiderProcess", undefined);
//   return true;
// }

// export async function executeCommand(command: string): Promise<string> {
//   return new Promise((resolve, reject) => {
//     cp.exec(command, (error, stdout, stderr) => {
//       if (error) {
//         reject(stderr || error);
//       } else {
//         resolve(stdout);
//       }
//     });
//   });
// }

// export async function checkGitRepository(currentDirectory?: string): Promise<boolean> {
//   try {
//       const currentDir = currentDirectory || process.cwd();
//       // Use a more robust git check method
//       execSync('git rev-parse --is-inside-work-tree', { cwd: currentDir });
//       return true;
//   } catch {
//       return false;
//   }
// }

// export function checkCredentials(model: string, credentials: { getAccessToken: () => string | undefined }): boolean {
//   // Implement credential check logic
//   if (!model.includes("claude") && !model.includes("gpt")) {
//       const accessToken = credentials.getAccessToken();
//       return !!accessToken;
//   }
//   return true;
// }

// export async function getCurrentWorkingDirectory(getCurrentDirectory?: () => Promise<string>): Promise<string> {
//   if (getCurrentDirectory) {
//       return await getCurrentDirectory();
//   }
//   return process.cwd();
// }

// // check if directory is a git repo
// async function isGitRepository(directory: string): Promise<boolean> {
//   try {
//     const result = execSync('git rev-parse --is-inside-work-tree', {
//       cwd: directory,
//       stdio: ['ignore', 'pipe', 'ignore'],
//       encoding: 'utf-8'
//     }).trim();
//     return result === 'true';
//   } catch (error) {
//     console.log('Aider Error:Directory is not a git repository:', error);
//     return false;
//   }
// }
