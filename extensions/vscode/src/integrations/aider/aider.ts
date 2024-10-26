import * as vscode from "vscode";
import * as cp from "child_process";
import { Core } from "core/core";
import { ContinueGUIWebviewViewProvider } from "../../ContinueGUIWebviewViewProvider";
import { getIntegrationTab } from "../../util/integrationUtils";
import Aider from "core/llm/llms/Aider";

const PLATFORM = process.platform;
const IS_WINDOWS = PLATFORM === "win32";
const IS_MAC = PLATFORM === "darwin";
const IS_LINUX = PLATFORM === "linux";

let aiderPanel: vscode.WebviewPanel | undefined;

// Aider process management functions
export async function startAiderProcess(core: Core) {
  const config = await core.configHandler.loadConfig();
  const aiderModel = config.models.find(model => model instanceof Aider) as Aider | undefined;

  if (aiderModel) {
    core.send("aiderProcessStateUpdate", { status: "starting" });
    try {
      await setupPythonEnvironmentVariables();
      await aiderModel.startAiderChat(aiderModel.model, aiderModel.apiKey);
      core.send("aiderProcessStateUpdate", { status: "ready" });
    } catch (e) {
      console.warn(`Error starting Aider process: ${e}`);
      core.send("aiderProcessStateUpdate", { status: "crashed" });
    }
  } else {
    console.warn("No Aider model found in configuration");
  }
}

export async function killAiderProcess(core: Core) {
  const config = await core.configHandler.loadConfig();
  const aiderModels = config.models.filter(model => model instanceof Aider) as Aider[];

  try {
    if (aiderModels.length > 0) {
      aiderModels.forEach(model => {
        model.killAiderProcess();
      });
      core.send("aiderProcessStateUpdate", { status: "stopped" });
    }
  } catch (e) {
    console.warn(`Error killing Aider process: ${e}`);
  }
}

export async function aiderCtrlC(core: Core) {
  const config = await core.configHandler.loadConfig();
  const aiderModels = config.models.filter(model => model instanceof Aider) as Aider[];

  try {
    if (aiderModels.length > 0) {
      aiderModels.forEach(model => {
        if (model.aiderProcess) {
          model.aiderCtrlC();
        }
      });
      core.send("aiderProcessStateUpdate", { status: "stopped" });
    }
  } catch (e) {
    console.warn(`Error sending Ctrl-C to Aider process: ${e}`);
  }
}

export async function aiderResetSession(core: Core) {
  const config = await core.configHandler.loadConfig();
  const aiderModels = config.models.filter(model => model instanceof Aider) as Aider[];

  try {
    if (aiderModels.length > 0) {
      aiderModels.forEach(model => {
        if (model.aiderProcess) {
          model.aiderResetSession(model.model, model.apiKey);
        }
      });
    }
  } catch (e) {
    console.warn(`Error resetting Aider session: ${e}`);
  }
}

export async function handleAiderMode(
  core: Core,
  sidebar: ContinueGUIWebviewViewProvider,
  extensionContext: vscode.ExtensionContext,
) {
  await installPythonAider();
  // Check if aider is already open by checking open tabs
  const aiderTab = getIntegrationTab("pearai.aiderGUIView");
  core.invoke("llm/startAiderProcess", undefined);
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

  sidebar.webviewProtocol?.request("focusContinueInputWithNewSession", undefined, ["pearai.aiderGUIView"]);

  //When panel closes, reset the webview and focus
  panel.onDidDispose(
    () => {
      // Kill background process
      core.invoke("llm/killAiderProcess", undefined);

      // The following order is important as it does not reset the history in chat when closing creator
      vscode.commands.executeCommand("pearai.focusContinueInput");
      sidebar.resetWebviewProtocolWebview();
    },
    null,
    extensionContext.subscriptions,
  );
}

async function checkPythonInstallation(): Promise<boolean> {
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

async function checkAiderInstallation(): Promise<boolean> {
  const commands = [
    "aider --version",
    "python -m aider --version",
    "python3 -m aider --version"
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

async function installPythonAider() {
  const isPythonInstalled = await checkPythonInstallation();
  console.log("PYTHON CHECK RESULT :");
  console.dir(isPythonInstalled);
  const isAiderInstalled = await checkAiderInstallation();
  console.log("AIDER CHECK RESULT :");
  console.dir(isAiderInstalled);

  if (isPythonInstalled && isAiderInstalled) {
    return;
  }

  if (!isPythonInstalled) {
    const installPythonConfirm = await vscode.window.showInformationMessage(
      "Python is required to run Creator (Aider). Choose 'Install' to install Python3.9",
      "Install",
      "Cancel",
      "Manual Installation Guide",
    );

    if (installPythonConfirm === "Cancel") {
      return;
    } else if (installPythonConfirm === "Manual Installation Guide") {
      vscode.env.openExternal(
        vscode.Uri.parse(
          "https://trypear.ai/blog/how-to-setup-aider-in-pearai",
        ),
      );
      return;
    }

    vscode.window.showInformationMessage("Installing Python 3.9");
    const terminal = vscode.window.createTerminal("Python Installer");
    terminal.show();
    terminal.sendText(getPythonInstallCommand());

    vscode.window.showInformationMessage(
      "Please restart PearAI after python installation completes sucessfully, and then run Creator (Aider) again.",
      "OK",
    );

    return;
  }

  if (!isAiderInstalled) {
    vscode.window.showInformationMessage("Installing Aider");
    const aiderTerminal = vscode.window.createTerminal("Aider Installer");
    aiderTerminal.show();
    let command = "";
    if (IS_WINDOWS) {
      command += "python -m pip install -U aider-chat;";
      command += 'echo "`nAider installation complete."';
      } else {
      command += "python3 -m pip install -U aider-chat;";
      command += "echo '\nAider installation complete.'";
    }
    aiderTerminal.sendText(command);
  }
}

async function executeCommand(command: string): Promise<string> {
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

function getPythonInstallCommand(): string {
  switch (PLATFORM) {
    case "win32":
      return "winget install Python.Python.3.9";
    case "darwin":
      return "brew install python@3";
    default: // Linux
      return "sudo apt-get install -y python3";
  }
}



async function isPythonInPath(): Promise<boolean> {
  try {
    switch (PLATFORM) {
      case "win32": {
        // Check user PATH environment variable on Windows
        const userPath = await executeCommand('powershell -Command "[Environment]::GetEnvironmentVariable(\'Path\', \'User\')"');
        const pythonPath = await executeCommand("where python");
        const pythonDir = pythonPath.split('\r\n')[0].replace(/\\python\.exe$/, '');
        return userPath.toLowerCase().includes(pythonDir.toLowerCase());
      }
      case "darwin":
      case "linux": {
        // Check if python/python3 command is accessible and resolve its real path
        try {
          const shellProfile = IS_MAC ? "~/.zshrc" : "~/.bashrc";
          const command = IS_MAC ? "which python3" : "which python3";
          const pythonPath = await executeCommand(command);
          
          // Check if PATH entry exists in profile
          const grepCommand = IS_MAC 
            ? `cat ${shellProfile} | grep -l "export PATH=.*${pythonPath.trim()}.*"` 
            : `cat ${shellProfile} | grep -l "export PATH=.*${pythonPath.trim()}.*"`;
          
          await executeCommand(grepCommand);
          return true;
        } catch {
          return false;
        }
      }
      default:
        return false;
    }
  } catch (error) {
    console.warn(`Error checking Python in PATH: ${error}`);
    return false;
  }
}

async function setupPythonEnvironmentVariables(): Promise<void> {
  // First check if Python is already in PATH
  const pythonAlreadyInPath = await isPythonInPath();
  if (pythonAlreadyInPath) {
    console.log("Python is already in PATH, skipping environment setup");
    return;
  }

  switch (PLATFORM) {
    case "win32":
      try {
        // For Windows, modify PATH through PowerShell
        const pythonPath = await executeCommand("where python");
        if (pythonPath) {
          const pythonDir = pythonPath.split('\r\n')[0].replace(/\\python\.exe$/, '');
          const command = `
            $currentPath = [Environment]::GetEnvironmentVariable('Path', 'User');
            if ($currentPath -notlike '*${pythonDir}*') {
              [Environment]::SetEnvironmentVariable('Path', "$currentPath;${pythonDir}", 'User');
              [Environment]::SetEnvironmentVariable('Path', "$currentPath;${pythonDir}\\Scripts", 'User');
              Write-Host "Python paths added to PATH environment variable."
            }
          `;
          await executeCommand(`powershell -Command "${command}"`);
          vscode.window.showInformationMessage("Python has been added to your PATH environment variable.");
        }
      } catch (error) {
        console.warn(`Error setting up Python PATH on Windows: ${error}`);
        vscode.window.showErrorMessage("Failed to add Python to PATH. You may need to add it manually.");
      }
      break;

    case "darwin":
      try {
        // For macOS, modify PATH in shell profile
        const homeDir = process.env.HOME;
        const profilePath = `${homeDir}/.zshrc`;
        const pythonPath = await executeCommand("which python3");
        if (pythonPath) {
          const pythonDir = pythonPath.trim().replace(/\/python3$/, '');
          
          // Check if entry already exists
          const checkCommand = `grep -l "export PATH=.*${pythonDir}.*" ${profilePath}`;
          try {
            await executeCommand(checkCommand);
          } catch {
            // Entry doesn't exist, add it
            const exportCommand = `\nexport PATH="${pythonDir}:$PATH"\n`;
            await executeCommand(`echo '${exportCommand}' >> ${profilePath}`);
            // Also add to current session
            process.env.PATH = `${pythonDir}:${process.env.PATH}`;
            vscode.window.showInformationMessage("Python has been added to your PATH in .zshrc");
          }
        }
      } catch (error) {
        console.warn(`Error setting up Python PATH on macOS: ${error}`);
        vscode.window.showErrorMessage("Failed to add Python to PATH. You may need to add it manually.");
      }
      break;

    case "linux":
      try {
        // For Linux, modify PATH in bash profile
        const homeDir = process.env.HOME;
        const profilePath = `${homeDir}/.bashrc`;
        const pythonPath = await executeCommand("which python3");
        if (pythonPath) {
          const pythonDir = pythonPath.trim().replace(/\/python3$/, '');
          
          // Check if entry already exists
          const checkCommand = `grep -l "export PATH=.*${pythonDir}.*" ${profilePath}`;
          try {
            await executeCommand(checkCommand);
          } catch {
            // Entry doesn't exist, add it
            const exportCommand = `\nexport PATH="${pythonDir}:$PATH"\n`;
            await executeCommand(`echo '${exportCommand}' >> ${profilePath}`);
            // Also add to current session
            process.env.PATH = `${pythonDir}:${process.env.PATH}`;
            vscode.window.showInformationMessage("Python has been added to your PATH in .bashrc");
          }
        }
      } catch (error) {
        console.warn(`Error setting up Python PATH on Linux: ${error}`);
        vscode.window.showErrorMessage("Failed to add Python to PATH. You may need to add it manually.");
      }
      break;
  }
}

// async function installPythonAider() {
//   const isPythonInstalled = await checkPythonInstallation();
//   console.log("PYTHON CHECK RESULT :");
//   console.dir(isPythonInstalled);
//   const isAiderInstalled = await checkAiderInstallation();
//   console.log("AIDER CHECK RESULT :");
//   console.dir(isAiderInstalled);

//   if (isPythonInstalled && isAiderInstalled) {
//     return;
//   }

//   if (!isPythonInstalled) {
//     const installPythonConfirm = await vscode.window.showInformationMessage(
//       "Python is required to run Creator (Aider). Choose 'Install' to install Python3.9",
//       "Install",
//       "Cancel",
//       "Manual Installation Guide",
//     );

//     if (installPythonConfirm === "Cancel") {
//       return;
//     } else if (installPythonConfirm === "Manual Installation Guide") {
//       vscode.env.openExternal(
//         vscode.Uri.parse(
//           "https://trypear.ai/blog/how-to-setup-aider-in-pearai",
//         ),
//       );
//       return;
//     }

//     vscode.window.showInformationMessage("Installing Python 3.9");
//     const terminal = vscode.window.createTerminal("Python Installer");
//     terminal.show();
//     terminal.sendText(getPythonInstallCommand());

//     // Add environment setup after installation with a reasonable delay
//     await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for installation to complete
    
//     // Check installation and setup environment variables
//     const pythonInstallVerified = await checkPythonInstallation();
//     if (pythonInstallVerified) {
//       await setupPythonEnvironmentVariables();
//       vscode.window.showInformationMessage(
//         "Python installation completed. Environment variables have been configured.",
//         "OK"
//       );
//     } else {
//       vscode.window.showErrorMessage(
//         "Python installation may not have completed successfully. Please verify the installation and try again.",
//         "OK"
//       );
//     }

//     return;
//   }

//   if (!isAiderInstalled) {
//     vscode.window.showInformationMessage("Installing Aider");
//     const aiderTerminal = vscode.window.createTerminal("Aider Installer");
//     aiderTerminal.show();
//     let command = "";
//     if (IS_WINDOWS) {
//       command += "python -m pip install -U aider-chat;";
//       command += 'echo "`nAider installation complete."';
//     } else {
//       command += "python3 -m pip install -U aider-chat;";
//       command += "echo '\nAider installation complete.'";
//     }
//     aiderTerminal.sendText(command);
//   }
// }

