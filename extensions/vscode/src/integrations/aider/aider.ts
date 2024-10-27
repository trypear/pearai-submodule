import { Core } from "core/core";
import * as cp from "child_process";
import * as os from "os";
import * as process from "process";
import { PearAICredentials } from "core/pearaiServer/PearAICredentials";
import { SERVER_URL } from "core/util/parameters";
import * as vscode from "vscode";

const PLATFORM = process.platform;
const IS_WINDOWS = PLATFORM === "win32";
const IS_MAC = PLATFORM === "darwin";
const IS_LINUX = PLATFORM === "linux";

export class AiderProcessManager {
  private static instance: AiderProcessManager | null = null;
  private aiderProcess: cp.ChildProcess | null = null;

  private constructor() {}
  public aiderOutput: string = "";
  public isAiderUp: boolean = false;

  public static getInstance(): AiderProcessManager {
    if (!AiderProcessManager.instance) {
      AiderProcessManager.instance = new AiderProcessManager();
    }
    return AiderProcessManager.instance;
  }

  private getUserShell(): string {
    if (IS_WINDOWS) {
      return process.env.COMSPEC || "cmd.exe";
    }
    return process.env.SHELL || "/bin/sh";
  }

  private getUserPath(): string {
    try {
      let command: string;
      const shell = this.getUserShell();

      if (os.platform() === "win32") {
        command =
          "powershell -Command \"[Environment]::GetEnvironmentVariable('Path', 'User') + ';' + [Environment]::GetEnvironmentVariable('Path', 'Machine')\"";
      } else {
        command = `${shell} -ilc 'echo $PATH'`;
      }

      return cp.execSync(command, { encoding: "utf8" }).trim();
    } catch (error) {
      console.error("Error getting user PATH:", error);
      return process.env.PATH || "";
    }
  }

  private captureAiderOutput(data: Buffer): void {
    const output = data.toString();
    const cleanOutput = output.replace(/\x1B\[[0-9;]*[JKmsu]/g, "");
    this.aiderOutput += cleanOutput;
  }

  public async startAiderChat(
    model: string,
    apiKey: string | undefined,
    credentials: PearAICredentials,
    getCurrentDirectory: (() => Promise<string>) | null,
  ): Promise<void> {
    if (this.aiderProcess && !this.aiderProcess.killed) {
      console.log("Aider process already running");
      return;
    }

    this.isAiderUp = false;

    return new Promise(async (resolve, reject) => {
      let currentDir: string;
      if (getCurrentDirectory) {
        currentDir = await getCurrentDirectory();
      } else {
        currentDir = "";
      }

      let command: string[];

      const aiderFlags =
        "--no-pretty --yes-always --no-auto-commits --no-suggest-shell-commands";
      const aiderCommands = [
        `python -m aider ${aiderFlags}`,
        `python3 -m aider ${aiderFlags}`,
        `aider ${aiderFlags}`,
      ];
      let commandFound = false;

      for (const aiderCommand of aiderCommands) {
        try {
          await cp.execSync(`${aiderCommand} --version`, { stdio: "ignore" });
          commandFound = true;

          switch (model) {
            case model.includes("claude") && model:
              command = [`${aiderCommand} --model ${model}`];
              break;
            case "gpt-4o":
              command = [`${aiderCommand} --model gpt-4o`];
              break;
            case "pearai_model":
            default:
              await credentials.checkAndUpdateCredentials();
              const accessToken = credentials.getAccessToken();
              if (!accessToken) {
                let message =
                  "PearAI token invalid. Please try logging in or contact PearAI support.";
                vscode.window
                  .showErrorMessage(message, "Login To PearAI", "Show Logs")
                  .then((selection: any) => {
                    if (selection === "Login To PearAI") {
                      vscode.env.openExternal(
                        vscode.Uri.parse(
                          "https://trypear.ai/signin?callback=pearai://pearai.pearai/auth",
                        ),
                      );
                    } else if (selection === "Show Logs") {
                      vscode.commands.executeCommand(
                        "workbench.action.toggleDevTools",
                      );
                    }
                  });
                throw new Error("User not logged in to PearAI.");
              }
              command = [
                aiderCommand,
                "--openai-api-key",
                accessToken,
                "--openai-api-base",
                `${SERVER_URL}/integrations/aider`,
              ];
              break;
          }
          break;
        } catch (error) {
          console.log(
            `Command ${aiderCommand} not found or errored. Trying next...`,
          );
        }
      }

      if (!commandFound) {
        throw new Error(
          "Aider command not found. Please ensure it's installed correctly.",
        );
      }

      const userPath = this.getUserPath();
      const userShell = this.getUserShell();

      const spawnAiderProcess = async () => {
        if (IS_WINDOWS) {
          return spawnAiderProcessWindows();
        } else {
          return spawnAiderProcessUnix();
        }
      };

      const spawnAiderProcessWindows = async () => {
        const envSetCommands = [
          "setx PYTHONIOENCODING utf-8",
          "setx AIDER_SIMPLE_OUTPUT 1",
          "chcp 65001",
        ];

        if (model === "claude-3-5-sonnet-20240620") {
          envSetCommands.push(`setx ANTHROPIC_API_KEY ${apiKey}`);
        } else if (model === "gpt-4o") {
          envSetCommands.push(`setx OPENAI_API_KEY ${apiKey}`);
        } else {
          const accessToken = credentials.getAccessToken();
          envSetCommands.push(`setx OPENAI_API_KEY ${accessToken}`);
        }

        for (const cmd of envSetCommands) {
          await new Promise((resolve, reject) => {
            cp.exec(cmd, { windowsHide: true }, (error, stdout, stderr) => {
              if (error) {
                console.error(`Error executing ${cmd}: ${error}`);
                reject(error);
              } else {
                console.log(`Executed: ${cmd}`);
                resolve(stdout);
              }
            });
          });
        }

        return cp.spawn("cmd.exe", ["/c", ...command], {
          stdio: ["pipe", "pipe", "pipe"],
          cwd: currentDir,
          env: {
            ...process.env,
            PATH: userPath,
            PYTHONIOENCODING: "utf-8",
            AIDER_SIMPLE_OUTPUT: "1",
          },
          windowsHide: true,
        });
      };

      const spawnAiderProcessUnix = () => {
        if (model === "claude-3-5-sonnet-20240620") {
          command.unshift(`export ANTHROPIC_API_KEY=${apiKey};`);
        } else if (model === "gpt-4o") {
          command.unshift(`export OPENAI_API_KEY=${apiKey};`);
        } else {
          const accessToken = credentials.getAccessToken();
          command.unshift(`export OPENAI_API_KEY=${accessToken};`);
        }

        return cp.spawn(userShell, ["-c", command.join(" ")], {
          stdio: ["pipe", "pipe", "pipe"],
          cwd: currentDir,
          env: {
            ...process.env,
            PATH: userPath,
            PYTHONIOENCODING: "utf-8",
            AIDER_SIMPLE_OUTPUT: "1",
          },
        });
      };

      const tryStartAider = async () => {
        console.log("Starting Aider...");
        this.aiderProcess = await spawnAiderProcess();

        if (this.aiderProcess.stdout && this.aiderProcess.stderr) {
          const timeout = setTimeout(() => {
            reject(new Error("Aider failed to start within timeout period"));
          }, 30000);

          this.aiderProcess.stdout.on("data", (data: Buffer) => {
            this.captureAiderOutput(data);
            const output = data.toString();
            console.log("Output: ", output);
            if (output.endsWith("> ")) {
              console.log("Aider is ready!");
              this.isAiderUp = true;
              clearTimeout(timeout);
              resolve();
            }
          });

          this.aiderProcess.stderr.on("data", (data: Buffer) => {
            console.error(`Aider error: ${data.toString()}`);
          });

          this.aiderProcess.on("close", (code: number | null) => {
            console.log(`Aider process exited with code ${code}`);
            this.isAiderUp = false;
            clearTimeout(timeout);
            if (code !== 0) {
              reject(new Error(`Aider process exited with code ${code}`));
            } else {
              this.aiderProcess = null;
              resolve();
            }
          });

          this.aiderProcess.on("error", (error: Error) => {
            console.error(`Error starting Aider: ${error.message}`);
            this.isAiderUp = false;
            clearTimeout(timeout);
            reject(error);
            let message =
              "PearAI Creator (Powered by aider) failed to start. Please contact PearAI support on Discord.";
            vscode.window
              .showErrorMessage(
                message,
                "PearAI Support (Discord)",
                "Show Logs",
              )
              .then((selection: any) => {
                if (selection === "PearAI Support (Discord)") {
                  vscode.env.openExternal(
                    vscode.Uri.parse("https://discord.com/invite/7QMraJUsQt"),
                  );
                } else if (selection === "Show Logs") {
                  vscode.commands.executeCommand(
                    "workbench.action.toggleDevTools",
                  );
                }
              });
          });
        }
      };

      await tryStartAider();
    });
  }

  public sendToAiderChat(message: string): void {
    if (this.aiderProcess && this.aiderProcess.stdin && !this.aiderProcess.killed) {
      const formattedMessage = message.replace(/\n+/g, " ");
      this.aiderProcess.stdin.write(`${formattedMessage}\n`);
    } else {
      console.error("Aider process is not running");
    }
  }

  public isAiderProcessUp(): boolean {
    return this.isAiderUp;
  }

  public killAiderProcess() {
    if (this.aiderProcess && !this.aiderProcess.killed) {
      console.log("Killing Aider process...");
      this.aiderProcess.kill();
      this.aiderProcess = null;
    }
  }

  public aiderCtrlC() {
    if (this.aiderProcess && !this.aiderProcess.killed) {
      console.log("Sending Ctrl+C signal to Aider process...");
      this.sendToAiderChat("\x03"); // Send Ctrl+C to the Aider process
    } else {
      console.log("No active Aider process to send Ctrl+C to.");
    }
  }

  public aiderResetSession() {
    this.killAiderProcess();
    this.isAiderUp = false;
    // Reset the output
    this.aiderOutput = "";
  }
}

import { ContinueGUIWebviewViewProvider } from "../../ContinueGUIWebviewViewProvider";
import { getIntegrationTab } from "../../util/integrationUtils";
import Aider from "core/llm/llms/Aider";

let aiderPanel: vscode.WebviewPanel | undefined;


export async function handleAiderMode(
  core: Core,
  sidebar: ContinueGUIWebviewViewProvider,
  extensionContext: vscode.ExtensionContext,
) {
  const isPythonInstalled = await checkPythonInstallation();
  const isAiderInstalled = await checkAiderInstallation();


  if (!isPythonInstalled || !isAiderInstalled) {
    await handlePythonAiderNotInstalled();
    return;
    // Todo: We should probably have something open up here saying Python not installed
  }

  // Check if aider is already open by checking open tabs
  const aiderTab = getIntegrationTab("pearai.aiderGUIView");
  // core.invoke("llm/startAiderProcess", undefined);
  startAiderChat()
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

async function handlePythonAiderNotInstalled() {
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
      "Python was not found in your ENV PATH. Python is required to run Creator (Aider). Choose 'Install' to install Python3.9 and add it to PATH (if already installed, add it to PATH)",
      "Install",
      "Manual Installation Guide",
      "Cancel",
    );

    if (!installPythonConfirm) {
      return;
    }

    if (installPythonConfirm === "Cancel") {
      return;
    }

    if (installPythonConfirm === "Manual Installation Guide") {
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
      "Please restart PearAI after python installation (or adding to PATH) completes sucessfully, and then run Creator (Aider) again.",
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

// Commented out as the user must do this themselves

// async function isPythonInPath(): Promise<boolean> {
//   try {
//     return checkPythonInstallation();
//   } catch (error) {
//     console.warn(`Error checking Python in PATH: ${error}`);
//     return false;
//   }
// }

// async function setupPythonEnvironmentVariables(): Promise<void> {
//   const pythonAlreadyInPath = await isPythonInPath();
//   if (pythonAlreadyInPath) {
//     console.log("Python is already in PATH, skipping environment setup");
//     return;
//   }

//   vscode.window.showInformationMessage(
//     "Adding Python to PATH. Please restart PearAI after Python is added to PATH successfully.",
//   );
//   const terminal = vscode.window.createTerminal("Python PATH Setup");
//   terminal.show();

//   switch (PLATFORM) {
//     case "win32":
//       terminal.sendText(`
// # PowerShell Script to Add Specific Python Paths to User PATH Variable at the Top

// # Get the current username
// $username = [System.Environment]::UserName

// # Define Python paths with the current username
// $pythonPath = "C:\\Users\\$username\\AppData\\Local\\Programs\\Python\\Python39"
// $pythonScriptsPath = "C:\\Users\\$username\\AppData\\Local\\Programs\\Python\\Python39\\Scripts"

// # Retrieve the current user PATH
// $currentUserPath = [System.Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::User)

// # Add the new paths at the top if they're not already present
// if ($currentUserPath -notlike "*$pythonPath*") {
//     # Prepend the Python paths to the existing user PATH
//     $newUserPath = "$pythonPath;$pythonScriptsPath;$currentUserPath"
//     [System.Environment]::SetEnvironmentVariable("Path", $newUserPath, [System.EnvironmentVariableTarget]::User)
//     Write-Output "Python paths have been added to user PATH."
// } else {
//     Write-Output "Python paths are already in the user PATH. "
//     Write-Output "Try Running PearAI Creator (Aider) Again."
// }
//         `);
//       break;

//     case "darwin":
//       terminal.sendText(`
//           PYTHON_PATH=$(which python3)
//           if [ -n "$PYTHON_PATH" ]; then
//             PYTHON_DIR=$(dirname "$PYTHON_PATH")
//             if ! grep -q "export PATH=.*$PYTHON_DIR" ~/.zshrc; then
//               echo "\\nexport PATH=\\"$PYTHON_DIR:\$PATH\\"" >> ~/.zshrc
//               echo "Python path added to .zshrc"
//               source ~/.zshrc
//             fi
//           fi
//         `);
//       break;

//     case "linux":
//       terminal.sendText(`
//           PYTHON_PATH=$(which python3)
//           if [ -n "$PYTHON_PATH" ]; then
//             PYTHON_DIR=$(dirname "$PYTHON_PATH")
//             if ! grep -q "export PATH=.*$PYTHON_DIR" ~/.bashrc; then
//               echo "\\nexport PATH=\\"$PYTHON_DIR:\$PATH\\"" >> ~/.bashrc
//               echo "Python path added to .bashrc"
//               source ~/.bashrc
//             fi
//           fi
//         `);
//       break;
//   }
// }
