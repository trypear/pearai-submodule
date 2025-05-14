/**
 * This is the entry point for the extension.
 *
 * Note: This file has been significantly modified from its original contents. pearai-submodule is a fork of Continue (https://github.com/continuedev/continue).
 */

import { setupCa } from "core/util/ca";
import { Telemetry } from "core/util/posthog";
import * as vscode from "vscode";
import { getExtensionVersion } from "./util/util";
import { PearAIApi } from "./PearAIApi";
import { PearAIExtensionExports } from "core";

let pearAPI: PearAIApi | undefined;

async function dynamicImportAndActivate(context: vscode.ExtensionContext) {
  const { activateExtension } = await import("./activation/activate");
  try {
    return activateExtension(context);
  } catch (e) {
    console.log("Error activating extension: ", e);
    vscode.window
      .showInformationMessage(
        "Error activating the PearAI extension.",
        "View Logs",
        "Retry",
      )
      .then((selection) => {
        if (selection === "View Logs") {
          vscode.commands.executeCommand("pearai.viewLogs");
        } else if (selection === "Retry") {
          // Reload VS Code window
          vscode.commands.executeCommand("workbench.action.reloadWindow");
        }
      });
  }
}

export async function activate(context: vscode.ExtensionContext) {
  setupCa();
  const extension = await dynamicImportAndActivate(context);
  if (!extension) {
    throw new Error("dynamicImportAndActivate returned undefined :(");
  }

  if (!pearAPI) {
    pearAPI = new PearAIApi(extension.extension.core, context);
  }

  return {
    pearAPI,
    extension: context.extension,
  } satisfies PearAIExtensionExports;
}

export function deactivate() {
  Telemetry.capture(
    "deactivate",
    {
      extensionVersion: getExtensionVersion(),
    },
    true,
  );

  Telemetry.shutdownPosthogClient();
}

export const getApi = () => {
  return pearAPI;
};
