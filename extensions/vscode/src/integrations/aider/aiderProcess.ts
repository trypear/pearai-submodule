import * as cp from "child_process";
import * as vscode from "vscode";
import { Core } from "core/core";
import * as os from "os";
import { execSync } from "child_process";
import { AiderState } from "./types/aiderTypes";
import { PearAICredentials } from "core/pearaiServer/PearAICredentials";
import { checkAiderInstallation, checkBrewInstallation, checkCredentials, checkGitRepository, checkPythonInstallation, getCurrentWorkingDirectory } from "./aiderUtil";

export const PLATFORM = process.platform;
export const IS_WINDOWS = PLATFORM === "win32";
export const IS_MAC = PLATFORM === "darwin";
export const IS_LINUX = PLATFORM === "linux";
export const EDIT_FORMAT: string = "normal"; // options ["normal", "udiff"]
export const UDIFF_FLAG = EDIT_FORMAT === "udiff";
export const AIDER_READY_FLAG = UDIFF_FLAG ? "udiff> " : "> ";
export const END_MARKER = IS_WINDOWS
  ? UDIFF_FLAG
    ? "\r\nudiff> "
    : "\r\n> "
  : UDIFF_FLAG
    ? "\nudiff> "
    : "\n> ";
export const READY_PROMPT_REGEX = />[^\S\r\n]*(?:[\r\n]|\s)*(?:\s+)(?:[\r\n]|\s)*$/;
export const AIDER_QUESTION_MARKER = "[Yes]\\:";
export const AIDER_END_MARKER = "─────────────────────────────────────";
export const COMPLETION_DELAY = 1500; // 1.5 seconds wait time

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

export function buildAiderCommand(model: string, accessToken: string | undefined): string[] {
  const aiderCommand = ["aider"];

  // Add command line arguments based on model
  if (model === "pearai_model") {
    aiderCommand.push("--pearai-api");
  } else if (model.includes("claude")) {
    aiderCommand.push("--model", model);
    aiderCommand.push("--anthropic");
  } else if (model.includes("gpt")) {
    aiderCommand.push("--model", model);
    aiderCommand.push("--openai");
  }

  if (UDIFF_FLAG) {
    aiderCommand.push("--edit-format", "udiff");
  }

  // Add access token if provided
  if (accessToken) {
    aiderCommand.push("--pearai-api-key", accessToken);
  }

  return aiderCommand;
}

export async function startAiderProcess(
  currentDir: string,
  command: string[],
  model: string,
  apiKey: string | undefined,
  accessToken: string | undefined
): Promise<cp.ChildProcess | null> {
  const shell = getUserShell();
  const userPath = getUserPath();

  const env = {
    ...process.env,
    PATH: userPath,
  };

  if (apiKey) {
    if (model.includes("claude")) {
      // env.ANTHROPIC_API_KEY = apiKey;
    } else if (model.includes("gpt")) {
      // env.OPENAI_API_KEY = apiKey;
    }
  }

  const options: cp.SpawnOptions = {
    cwd: currentDir,
    env,
    shell: true,
  };

  // For Windows, we need to handle the shell differently
  if (IS_WINDOWS) {
    options.shell = shell;
  }

  try {
    const childProcess = cp.spawn(command[0], command.slice(1), options);
    return childProcess;
  } catch (error) {
    console.error("Error spawning Aider process:", error);
    return null;
  }
}

export function killAiderProcess(process: cp.ChildProcess, onKill?: () => void) {
  if (process && !process.killed) {
    console.log("Killing Aider process...");
    process.kill();
    if (onKill) {
      onKill();
    }
  }
}

export function aiderCtrlC(process: cp.ChildProcess) {
  if (process && !process.killed) {
    console.log("Sending Ctrl+C signal to Aider process...");
    if (process.stdin) {
      process.stdin.write("\x03"); // Send Ctrl+C
    }
  } else {
    console.log("No active Aider process to send Ctrl+C to.");
  }
}

export async function installAider(core: Core) {
    const isPythonInstalled = await checkPythonInstallation();
    const isBrewInstalled =
      IS_MAC || IS_LINUX ? await checkBrewInstallation() : true;
    const isAiderInstalled = await checkAiderInstallation();

    if (isAiderInstalled) {
      return false;
    }

    if (!isAiderInstalled) {
      // if brew or python is not installed, then user must install manually
      if (!isBrewInstalled || !isPythonInstalled) {
        vscode.window.showInformationMessage(
          "Please follow manual installation steps to install Aider.",
        );
        return;
      }

      vscode.window.showInformationMessage("Installing Aider...");

      let command = "";
      if (IS_WINDOWS) {
        command += "python -m pip install -U aider-chat;";
        command += 'echo "`nAider installation complete."';
      } else {
        command += "brew install aider;";
        command += "echo '\nAider installation complete.'";
      }

      try {
        execSync(command);
        // If execution was successful, start the Aider process
        core.invoke("llm/startAiderProcess", undefined);
        return false;
      } catch (error) {
        // Handle the error case
        console.error("Failed to execute Aider command:", error);
        return true;
      }
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

export class AiderProcessManager {
  private aiderProcess: cp.ChildProcess | null = null;
  private apiKey?: string | undefined = undefined
  private model?: string;
//   private getCurrentDirectory: (() => Promise<string>) | undefined;
  private _state: AiderState = { state: "stopped" };
  private credentials: PearAICredentials;

  constructor(apiKey: string | undefined, model: string, credentials: PearAICredentials) {
    this.apiKey = apiKey;
    this.model = model;
    this.credentials = credentials;
  }

  // Getter for state
  get state(): AiderState {
    return this._state;
  }

  // Method to update state
  private updateState(newState: Omit<AiderState, "timeStamp">) {
    this._state = {
      ...newState,
      timeStamp: Date.now()
    };

    // Optional: Emit an event or notify listeners about state change
    this.notifyStateChange();
  }

  // Method to notify state change (can be implemented based on your architecture)
  private notifyStateChange() {
    // Emit event or call callback
    console.log(`Aider state changed to: ${this._state.state}`);
  }

  async startAiderChat(
    model: string,
    apiKey: string | undefined,
  ): Promise<void> {
    // Set state to starting
    this.updateState({ state: "starting" });

    try {
      // Check git repository
      const isGitRepo = await checkGitRepository();
      if (!isGitRepo) {
        this.updateState({ state: "notgitrepo" });
        throw new Error("Not a git repository");
      }

      // Credential checks
      if (!checkCredentials(model, this.credentials)) {
        this.updateState({ state: "signedOut" });
        throw new Error("User not logged in");
      }

      // Build and start the Aider process
      const currentDir = await getCurrentWorkingDirectory();
      const command = buildAiderCommand(model, this.credentials.getAccessToken());

      this.aiderProcess = await startAiderProcess(
        currentDir,
        command,
        model,
        apiKey,
        this.credentials.getAccessToken()
      );

      // Set up process event listeners
      this.setupProcessListeners();

      // Update state to ready
      this.updateState({ state: "ready" });

    } catch (error) {
      console.error("Error in startAiderChat:", error);

      // Determine appropriate error state
      const errorState = this.determineErrorState(error);
      this.updateState({ state: errorState });

      throw error;
    }
  }

  private setupProcessListeners() {
    if (!this.aiderProcess) return;

    // Handle process exit
    this.aiderProcess.on('exit', (code, signal) => {
      console.log(`Aider process exited with code ${code}, signal ${signal}`);

      // Determine state based on exit code/signal
      const newState = code === 0 ? "stopped" : "crashed";
      this.updateState({ state: newState });
    });

    // Handle process error
    this.aiderProcess.on('error', (err) => {
      console.error("Aider process error:", err);
      this.updateState({ state: "crashed" });
    });
  }

  sendToAiderChat(message: string): void {
    if (
      this.aiderProcess &&
      this.aiderProcess.stdin &&
      !this.aiderProcess.killed
    ) {
      const formattedMessage = message.replace(/\n+/g, " ");
      this.aiderProcess.stdin.write(`${formattedMessage}\n`);
    } else {
      this.handleProcessNotRunning();
    }
  }

  private handleProcessNotRunning() {
    console.error("PearAI Creator (Powered by Aider) process is not running");
    vscode.window
      .showErrorMessage(
        "PearAI Creator (Powered by Aider) process is not running. Please view PearAI Creator troubleshooting guide.",
        "View Troubleshooting",
      )
      .then((selection) => {
        if (selection === "View Troubleshooting") {
          vscode.env.openExternal(
            vscode.Uri.parse(
              "https://trypear.ai/blog/how-to-setup-aider-in-pearai",
            ),
          );
        }
      });
  }

  private determineErrorState(error: any): AiderState["state"] {
    // Map different error types to specific states
    if (error.message.includes("Not a git repository")) {
      return "notgitrepo";
    }
    if (error.message.includes("User not logged in")) {
      return "signedOut";
    }
    return "crashed";
  }

  killAiderProcess(): void {
    if (this.aiderProcess) {
      killAiderProcess(this.aiderProcess);
      this.aiderProcess = null;
      this.updateState({ state: "stopped" });
    }
  }

  aiderCtrlC(): void {
    if (this.aiderProcess) {
      aiderCtrlC(this.aiderProcess);
    }
  }

  async resetSession(
    model: string,
    apiKey: string | undefined
  ): Promise<void> {
    console.log("Resetting Aider process...");

    // Kill current process
    this.killAiderProcess();

    // Restart the chat
    try {
      await this.startAiderChat(model, apiKey);
      console.log("Aider process reset successfully.");
    } catch (error) {
      console.error("Error resetting Aider process:", error);
      throw error;
    }
  }

  // Getter for the current process state
  getAiderProcess(): cp.ChildProcess | null {
    return this.aiderProcess;
  }
}
