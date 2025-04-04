import { ControlPlaneSessionInfo } from "../control-plane/client.js";
import type {
  ContinueRcJson,
  DiffLine,
  FileType,
  IdeInfo,
  IdeSettings,
  IndexTag,
  Location,
  PearAuth,
  Problem,
  Range,
  RangeInFile,
  Thread,
} from "../index.js";

export type ToIdeFromWebviewOrCoreProtocol = {
  // Methods from IDE type
  getIdeInfo: [undefined, IdeInfo];
  getWorkspaceDirs: [undefined, string[]];
  listFolders: [undefined, string[]];
  writeFile: [{ path: string; contents: string }, void];
  showVirtualFile: [{ name: string; content: string }, void];
  getContinueDir: [undefined, string];
  openFile: [{ path: string }, void];
  runCommand: [{ command: string }, void];
  getSearchResults: [{ query: string }, string];
  subprocess: [{ command: string }, [string, string]];
  saveFile: [{ filepath: string }, void];
  fileExists: [{ filepath: string }, boolean];
  readFile: [{ filepath: string }, string];
  showDiff: [
    { filepath: string; newContents: string; stepIndex: number },
    void,
  ];
  diffLine: [
    {
      diffLine: DiffLine;
      filepath: string;
      startLine: number;
      endLine: number;
    },
    void,
  ];
  getProblems: [{ filepath: string }, Problem[]];
  getOpenFiles: [undefined, string[]];
  getCurrentFile: [undefined, string | undefined];
  getPinnedFiles: [undefined, string[]];
  showLines: [{ filepath: string; startLine: number; endLine: number }, void];
  readRangeInFile: [{ filepath: string; range: Range }, string];
  getDiff: [undefined, string];
  getWorkspaceConfigs: [undefined, ContinueRcJson[]];
  getTerminalContents: [undefined, string];
  getDebugLocals: [{ threadIndex: number }, string];
  getTopLevelCallStackSources: [
    { threadIndex: number; stackDepth: number },
    string[],
  ];
  getAvailableThreads: [undefined, Thread[]];
  isTelemetryEnabled: [undefined, boolean];
  getUniqueId: [undefined, string];
  getTags: [string, IndexTag[]];
  // end methods from IDE type

  getIdeSettings: [undefined, IdeSettings];

  // Git
  getBranch: [{ dir: string }, string];
  getRepoName: [{ dir: string }, string | undefined];

  errorPopup: [{ message: string }, void];
  infoPopup: [{ message: string }, void];
  getGitRootPath: [{ dir: string }, string | undefined];
  listDir: [{ dir: string }, [string, FileType][]];
  getLastModified: [{ files: string[] }, { [path: string]: number }];

  gotoDefinition: [{ location: Location }, RangeInFile[]];

  getGitHubAuthToken: [undefined, string | undefined];
  getControlPlaneSessionInfo: [
    { silent: boolean },
    ControlPlaneSessionInfo | undefined,
  ];
  logoutOfControlPlane: [undefined, void];
  pathSep: [undefined, string];
  getPearAuth: [undefined, PearAuth];
  updatePearAICredentials: [PearAuth, void];

  authenticatePear: [undefined, void];
  getCurrentDirectory: [undefined, string];

  // new welcome page
  markNewOnboardingComplete: [undefined, void];
  importUserSettingsFromVSCode: [undefined, boolean];
  pearWelcomeOpenFolder: [undefined, void];
  pearInstallCommandLine: [undefined, void];
  changeColorScheme: [{ isDark: boolean }, void];
  installVscodeExtension: [{ extensionId: string }, void];
  is_vscode_extension_installed: [{ extensionId: string }, boolean];

  // overlay
  closeOverlay: [undefined, void];
  lockOverlay: [undefined, void];
  unlockOverlay: [undefined, void];
  hideOverlayLoadingMessage: [undefined, void];

  /* dont overuse invokeVSCodeCommandById, use it only for devving,
  and if you find yourself writing redundant code just to invoke a
  command not related to pearai. (workbench, other extension)
  */
  invokeVSCodeCommandById: [
    { commandId: string; args?: any[] },
    any | undefined,
  ];
};

export type ToWebviewOrCoreFromIdeProtocol = {
  didChangeActiveTextEditor: [{ filepath: string }, void];
  didChangeControlPlaneSessionInfo: [
    { sessionInfo: ControlPlaneSessionInfo | undefined },
    void,
  ];
};
