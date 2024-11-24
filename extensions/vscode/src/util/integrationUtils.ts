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
    return;
  }

  if (!isOverlayVisible) {
    // If overlay isn't open, open it first
    await vscode.commands.executeCommand("pearai.showOverlay");
  }

  // Navigate to creator tab via webview protocol
  await sidebar.webviewProtocol?.request(protocol, undefined, webviews);
}

