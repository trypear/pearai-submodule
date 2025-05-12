import {
  Memory,
  MemoryChange,
  ToolType,
} from "../../extensions/vscode/src/util/integrationUtils.js";
import type { RangeInFileWithContents } from "../commands/util.js";
import type { ContextSubmenuItem } from "../index.js";
import { ToIdeFromWebviewOrCoreProtocol } from "./ide.js";
import { ToWebviewFromIdeOrCoreProtocol } from "./webview.js";

export type ToIdeFromWebviewProtocol = ToIdeFromWebviewOrCoreProtocol & {
  onLoad: [
    undefined,
    {
      windowId: string;
      serverUrl: string;
      workspacePaths: string[];
      vscMachineId: string;
      vscMediaUrl: string;
    },
  ];
  openUrl: [string, void];
  applyToCurrentFile: [{ text: string }, void];
  applyWithRelaceHorizontal: [{ contentToApply: string }, void];
  acceptRelaceDiff: [{ originalFileUri: string; diffFileUri: string }, void];
  rejectRelaceDiff: [{ originalFileUri: string; diffFileUri: string }, void];
  createFile: [{ path: string }, void];
  showTutorial: [undefined, void];
  showFile: [{ filepath: string }, void];
  openConfigJson: [undefined, void];
  highlightElement: [{ elementSelectors: string[] }, void];
  unhighlightElement: [{ elementSelectors: string[] }, void];
  perplexityMode: [undefined, void];
  addPerplexityContext: [{ text: string; language: string }, void];
  addPerplexityContextinChat: [{ text: string; language: string }, void];
  toggleDevTools: [undefined, void];
  reloadWindow: [undefined, void];
  focusEditor: [undefined, void];
  toggleFullScreen: [undefined, void];
  insertAtCursor: [{ text: string }, void];
  copyText: [{ text: string }, void];
  "jetbrains/editorInsetHeight": [{ height: number }, void];
  setGitHubAuthToken: [{ token: string }, void];
  // for shortcuts bar
  bigChat: [undefined, void];
  lastChat: [undefined, void];
  closeChat: [undefined, void];
  openHistory: [undefined, void];
  openHistorySearch: [undefined, void];
  appendSelected: [undefined, void];
  pearaiLogin: [undefined, void];
  pearaiLogout: [undefined, void];
  closePearAIOverlay: [undefined, void];
  getNumberOfChanges: [undefined, number];
  isSupermavenInstalled: [undefined, boolean];
  uninstallVscodeExtension: [{ extensionId: string }, void];
  completeWelcome: [undefined, void];
  openInventoryHome: [undefined, void];
  openInventorySettings: [undefined, void];
  getUrlTitle: [string, string];
  pearAIinstallation: [{ tools: ToolType[] }, void];
  importUserSettingsFromVSCode: [undefined, boolean];
  "mem0/getMemories": [undefined, Memory[]];
  "mem0/updateMemories": [{ changes: MemoryChange[] }, boolean];
  getCreatorFeedbackMessages: [undefined, any[] | undefined];
};

export type ToWebviewFromIdeProtocol = ToWebviewFromIdeOrCoreProtocol & {
  setInactive: [undefined, void];
  setActiveFilePath: [string | undefined, void];
  restFirstLaunchInGUI: [undefined, void];
  showInteractiveContinueTutorial: [undefined, void];
  submitMessage: [{ message: any }, void]; // any -> JSONContent from TipTap
  updateSubmenuItems: [
    { provider: string; submenuItems: ContextSubmenuItem[] },
    void,
  ];
  newSessionWithPrompt: [{ prompt: string }, void];
  userInput: [{ input: string }, void];
  focusContinueInput: [undefined, void];
  focusContinueInputWithoutClear: [undefined, void];
  focusContinueInputWithNewSession: [undefined, void];
  highlightedCode: [
    {
      rangeInFileWithContents: RangeInFileWithContents;
      prompt?: string;
      shouldRun?: boolean;
    },
    void,
  ];
  addModel: [undefined, void];
  openSettings: [undefined, void];
  viewHistory: [undefined, void];
  newSession: [undefined, void];
  newSessionSearch: [undefined, void];
  quickEdit: [undefined, void];
  acceptedOrRejectedDiff: [undefined, void];
  setTheme: [{ theme: any }, void];
  setThemeType: [{ themeType: string }, void];
  setColors: [{ [key: string]: string }, void];
  "jetbrains/editorInsetRefresh": [undefined, void];
  addApiKey: [undefined, void];
  setupLocalModel: [undefined, void];
  incrementFtc: [undefined, void];
  openOnboarding: [undefined, void];
  addPerplexityContext: [{ text: string; language: string }, void];
  addPerplexityContextinChat: [{ text: string; language: string }, void];
  navigateToCreator: [undefined, void];
  navigateToSearch: [undefined, void];
  navigateToMem0: [undefined, void];
  navigateToWrapped: [undefined, void];
  toggleInventorySettings: [undefined, void];
  navigateToInventoryHome: [undefined, void];
  getCurrentTab: [undefined, string];
  setRelaceDiffState: [{ diffVisible: boolean }, void];
};
