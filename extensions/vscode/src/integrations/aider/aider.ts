import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as os from 'node:os';
import { Core } from 'core/core';
import { ContinueGUIWebviewViewProvider } from '../../ContinueGUIWebviewViewProvider';

let aiderPanel: vscode.WebviewPanel | undefined;

export function getAiderTab() {
  const tabs = vscode.window.tabGroups.all.flatMap((tabGroup) => tabGroup.tabs);
  console.log("All tabs:", tabs);
  return tabs.find((tab) => {
    const viewType = (tab.input as any)?.viewType;
    console.log("Tab view type:", viewType);
    return viewType?.endsWith("pearai.aiderGUIView");
  });
}

export async function handleAiderMode(
  core: Core,
  sidebar: ContinueGUIWebviewViewProvider,
  extensionContext: vscode.ExtensionContext
) {
  await installPythonAider();
  // Check if aider is already open by checking open tabs
  const aiderTab = getAiderTab();
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

  vscode.commands.executeCommand("pearai.focusContinueInput");

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
  try {
    await executeCommand("aider --version");
    return true;
  } catch (error) {
    console.warn(`Aider is not installed: ${error}`);
    return false;
  }
}

async function installPythonAider() {
  const isPythonInstalled = await checkPythonInstallation();
  console.log("PYTHON IS INSTALLED");
  console.dir(isPythonInstalled);
  const isAiderInstalled = await checkAiderInstallation();
  console.log("AIDER IS INSTALLED");
  console.dir(isAiderInstalled);

  if (isPythonInstalled && isAiderInstalled) {
    return;
  }

  const terminal = vscode.window.createTerminal('Aider Installer');
  terminal.show();

  let command = '';

  if (!isPythonInstalled) {
    vscode.window.showInformationMessage('Installing Python 3');
    command += `${getPythonInstallCommand()}; `;
  }

  if (!isAiderInstalled) {
    vscode.window.showInformationMessage('Installing Aider');
    command += 'pip3 install aider; ';
  }

  if (command) {
    command += 'echo "Installation complete."';
    await terminal.sendText(command);
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
  switch (os.platform()) {
    case 'win32':
      return 'winget install Python.Python.3.9';
    case 'darwin':
      return 'brew install python@3';
    default: // Linux
      return 'sudo apt-get install -y python3';
  }
}

