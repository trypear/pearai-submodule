import * as vscode from "vscode";
import * as cp from "child_process";
import * as os from "os";
import { Core } from "core/core";
import { ContinueGUIWebviewViewProvider, PEAR_OVERLAY_VIEW_ID } from "../../ContinueGUIWebviewViewProvider";
import { getIntegrationTab } from "../../util/integrationUtils";
import Aider from "core/llm/llms/AiderLLM";
import { execSync } from "child_process";
import { VsCodeWebviewProtocol } from "../../webviewProtocol";

export const PLATFORM = process.platform;
export const IS_WINDOWS = PLATFORM === "win32";
export const IS_MAC = PLATFORM === "darwin";
export const IS_LINUX = PLATFORM === "linux";

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

