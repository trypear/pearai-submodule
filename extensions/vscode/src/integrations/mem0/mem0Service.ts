/* eslint-disable @typescript-eslint/naming-convention */
import { SERVER_URL } from "core/util/parameters";
import { getHeaders } from "core/pearaiServer/stubs/headers";
import * as vscode from 'vscode';

export async function getMem0Memories(memory_id: string) {
    try {
      const baseHeaders = await getHeaders();
      const auth: any = await vscode.commands.executeCommand("pearai.getPearAuth");
      const response = await fetch(`${SERVER_URL}/integrations/memory/${memory_id}`, {
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
      console.dir(data);
      return data;
    } catch (error) {
      // Show error message in VSCode
      vscode.window.showErrorMessage(`Error fetching memories: ${(error as any).message}`);
    }
  }

// export async function saveMem0Memory(changes: MemoryChange[]) {
//   const baseHeaders = await getHeaders();
//   const response = await fetch(`${SERVER_URL}/mem0/saveMemories`, {
//     method: "POST",
//     headers: {
//       ...baseHeaders,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       changes: changes,
//     }),
//   });
//   return await response.json();
// }