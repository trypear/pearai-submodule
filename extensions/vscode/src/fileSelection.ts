import * as vscode from 'vscode';

export async function selectFolder(openLabel?: string): Promise<string | undefined> {
  const result = await vscode.window.showOpenDialog({
    canSelectFolders: true,
    canSelectFiles: false,
    canSelectMany: false,
    openLabel: openLabel || 'Select Folder'
  });

  if (result && result.length > 0) {
    return result[0].fsPath;
  }
  return undefined;
}

export async function selectFile(openLabel?: string): Promise<string | undefined> {
  const result = await vscode.window.showOpenDialog({
    canSelectFolders: false,
    canSelectFiles: true,
    canSelectMany: false,
    openLabel: openLabel || 'Select File'
  });

  if (result && result.length > 0) {
    return result[0].fsPath;
  }
  return undefined;
}