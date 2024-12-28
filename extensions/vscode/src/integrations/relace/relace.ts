import { SERVER_URL } from "core/util/parameters";
import { getHeaders } from "core/pearaiServer/stubs/headers";
import * as vscode from "vscode";

export async function getFastApplyChangesWithRelace(
    existingContent: string, // The existing content to which the changes will be applied
    changesToApply: string, // The changes to apply to the existing content
): Promise<string> {
    try {
        const baseHeaders = await getHeaders();
        const auth: any = await vscode.commands.executeCommand("pearai.getPearAuth");
        const response = await fetch(`${SERVER_URL}/integrations/relace/apply`, {
            method: "POST",
            headers: {
                ...baseHeaders,
                "Content-Type": "application/json",
                "Authorization": `Bearer ${auth.accessToken}`
            },
            body: JSON.stringify({
                existingContent,
                changesToApply,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to apply changes: ${response.statusText}`);
        }

        const result = await response.json();
        return result.modifiedContent;
    } catch (error) {
        vscode.window.showErrorMessage(`Relace: Failed to get fast apply changes: ${error}`);
        return existingContent;
    }
}