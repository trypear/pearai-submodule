/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import { ContinueGUIWebviewViewProvider } from "../ContinueGUIWebviewViewProvider";
import { ToWebviewProtocol } from "core/protocol";

export enum InstallableTool {
  AIDER = "aider",
  SUPERMAVEN = "supermaven"
}

export interface ToolCommand {
  command: string;
  args?: any;
}

export interface Memory {
  id: string;
  memory: string;
  created_at: string;
  updated_at: string;
  total_memories: number;
  owner: string;
  organization: string;
  metadata: any;
  type: string;
}

export interface MemoryChange {
  type: 'edit' | 'delete' | 'new';
  id: string;
  content?: string;
}

export type ToolType = typeof InstallableTool[keyof typeof InstallableTool];

export const TOOL_COMMANDS: Record<ToolType, ToolCommand> = {
  [InstallableTool.AIDER]: {
    command: "pearai.installAider"
  },
  [InstallableTool.SUPERMAVEN]: {
    command: "workbench.extensions.installExtension",
    args: "supermaven.supermaven"
  }
};


export function getIntegrationTab(webviewName: string) {
    const tabs = vscode.window.tabGroups.all.flatMap((tabGroup) => tabGroup.tabs);
    return tabs.find((tab) => {
      const viewType = (tab.input as any)?.viewType;
      return viewType?.endsWith(webviewName);
    });
}

export async function handleIntegrationShortcutKey(protocol: keyof ToWebviewProtocol, integrationName: string, sidebar: ContinueGUIWebviewViewProvider, webviews: string[]) {
  const isOverlayVisible = await vscode.commands.executeCommand('pearai.isOverlayVisible');
  const currentTab = await sidebar.webviewProtocol.request("getCurrentTab", undefined, webviews);

  if (isOverlayVisible && currentTab === integrationName) {
    // close overlay
    await vscode.commands.executeCommand("pearai.hideOverlay");
    await vscode.commands.executeCommand("workbench.action.focusActiveEditorGroup");
    return;
  }
  
  await sidebar.webviewProtocol?.request(protocol, undefined, webviews);

  if (!isOverlayVisible) {
    // If overlay isn't open, open it first
    // Navigate to creator tab via webview protocol
    await vscode.commands.executeCommand("pearai.showOverlay");
  }
}

export function extractCodeFromMarkdown(text: string): string {
  // Match code blocks with optional language specification
  const codeBlockRegex = /```[\w-]*\n([\s\S]*?)\n```/m;
  let match = text.match(codeBlockRegex);

  if (!match) {
    const lines = text.split('\n');
    if (lines[0].trim().startsWith('```') && lines[lines.length - 1].trim().startsWith('```')) {
      // remove first and last line
      const codeLines = lines.slice(1, -1);
      match = ['', codeLines.join('\n')];
    }
  }

  // If it's a code block, return the code inside
  // Otherwise return the original text
  return match ? match[1] : text;
}
