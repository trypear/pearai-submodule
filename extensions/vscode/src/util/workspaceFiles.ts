import * as vscode from "vscode"
import * as path from "path"

/**
 * Represents messages returned from extension file operations
 * @typedef {Object} FileResult
 */
export type FileResult = 
  | { 
      /** Message type for successful file content operations */
      type: "fileContent"; 
      /** The content of the file as a string */
      content: string; 
    }
  | { 
      /** Message type for error conditions */
      type: "error"; 
      /** Error message description */
      error: string; 
    };

/**
 * Options for reading workspace files
 * @interface ReadWorkspaceFileOptions
 */
interface ReadWorkspaceFileOptions {
  /** Whether to create the file if it doesn't exist */
  create?: boolean;
  /** Whether to ensure the directory exists before writing */
  ensureDirectory?: boolean;
  /** Initial content to write if creating the file */
  content?: string;
}

/**
 * Options for writing workspace files
 * @interface WriteWorkspaceFileOptions
 */
interface WriteWorkspaceFileOptions {
  /** Whether to create the file if it doesn't exist */
  create?: boolean;
  /** Whether to ensure the directory exists before writing */
  ensureDirectory?: boolean;
  /** Content to write to the file */
  content: string;
}

/**
 * Reads a file from the workspace
 * 
 * @param relativePath - Path to the file, relative to workspace root
 * @param options - Options for reading the file
 * @param options.create - If true, creates the file when it doesn't exist
 * @param options.ensureDirectory - If true, ensures parent directory exists
 * @param options.content - Initial content if the file is created
 * @returns Promise resolving to an FileResult with file content or error
 */
export const readWorkspaceFile = async (
  relativePath: string,
  options: ReadWorkspaceFileOptions = {},
): Promise<FileResult> => {
  try {
    // Get workspace root
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
    console.log("Workspace root:", workspaceRoot)

    // If no workspace root, try to use the current working directory
    const effectiveRoot = workspaceRoot || process.cwd()
    console.log("Effective root:", effectiveRoot)

    // Resolve the full path
    const fullPath = path.join(effectiveRoot, relativePath)
    console.log("Full path:", fullPath)
    const uri = vscode.Uri.file(fullPath)
    console.log("URI:", uri.toString())

    // Check if file exists
    try {
      const fileContent = await vscode.workspace.fs.readFile(uri)
      return {
        type: "fileContent",
        content: Buffer.from(fileContent).toString("utf8"),
      }
    } catch {
      // File doesn't exist
      if (!options.create) {
        throw new Error("File does not exist")
      }

      // If we should create directories
      if (options.ensureDirectory) {
        const dirPath = path.dirname(fullPath)
        try {
          await vscode.workspace.fs.createDirectory(vscode.Uri.file(dirPath))
        } catch (err) {
          // Directory might already exist, that's fine
        }
      }

      // Create with provided content or empty string
      const content = options.content || ""
      await vscode.workspace.fs.writeFile(uri, Buffer.from(content, "utf8"))
      return {
        type: "fileContent",
        content,
      }
    }
  } catch (error) {
    return {
      type: "error",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

/**
 * Writes content to a file in the workspace
 * 
 * @param relativePath - Path to the file, relative to workspace root
 * @param options - Options for writing the file
 * @param options.create - If true, creates the file when it doesn't exist
 * @param options.ensureDirectory - If true, ensures parent directory exists
 * @param options.content - Content to write to the file (required)
 * @returns Promise resolving to an FileResult with file content or error
 */
export const writeWorkspaceFile = async (
  relativePath: string,
  options: WriteWorkspaceFileOptions,
): Promise<FileResult> => {
  try {
    // Get workspace root
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
    console.log("Workspace root (write):", workspaceRoot)

    // If no workspace root, try to use the current working directory
    const effectiveRoot = workspaceRoot || process.cwd()
    console.log("Effective root (write):", effectiveRoot)

    // Resolve the full path
    const fullPath = path.join(effectiveRoot, relativePath)
    console.log("Full path (write):", fullPath)
    const uri = vscode.Uri.file(fullPath)
    console.log("URI (write):", uri.toString())

    // If we should create directories
    if (options.ensureDirectory) {
      const dirPath = path.dirname(fullPath)
      try {
        await vscode.workspace.fs.createDirectory(vscode.Uri.file(dirPath))
      } catch (err) {
        // Directory might already exist, that's fine
      }
    }

    // Write the file
    await vscode.workspace.fs.writeFile(uri, Buffer.from(options.content, "utf8"))

    return {
      type: "fileContent",
      content: options.content,
    }
  } catch (error) {
    return {
      type: "error",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}