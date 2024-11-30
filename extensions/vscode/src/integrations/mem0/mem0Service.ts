/* eslint-disable @typescript-eslint/naming-convention */
import { SERVER_URL } from "core/util/parameters";
import { getHeaders } from "core/pearaiServer/stubs/headers";
import { MemoryChange } from "../../util/integrationUtils";
import * as vscode from 'vscode';

export async function getMem0Memories(repo_id: string) {
    try {
      const baseHeaders = await getHeaders();
      const auth: any = await vscode.commands.executeCommand("pearai.getPearAuth");
      const response = await fetch(`${SERVER_URL}/integrations/memory/${repo_id}`, {
        method: "GET",
        headers: {
          ...baseHeaders,
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.accessToken}`,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `${response.statusText}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      // Show error message in VSCode
      vscode.window.showErrorMessage(`Error fetching memories: ${(error as any).message}`);
    }
  }

export async function updateMem0Memories(repo_id: string, changes: MemoryChange[]) {
  const baseHeaders = await getHeaders();
  const auth: any = await vscode.commands.executeCommand("pearai.getPearAuth");

  const response = await fetch(`${SERVER_URL}/integrations/memory/update`, {
    method: "POST",
    headers: {
      ...baseHeaders,
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.accessToken}`,
    },
    body: JSON.stringify({
      id: repo_id,
      updatedMemories: changes,
    }),
  });
  return await response.json();
}