/// <reference types="vite/client" />
import type { WebviewApi } from "vscode-webview"

declare global {
    interface Window {
      isPearOverlay?: boolean;
      vscode: WebviewApi;
      initialRoute?: string;
      isFirstLaunch?: boolean;
      isPearOverlay?: boolean;
      viewType?: 'pearai.chatView' | 'pearai.mem0View' | 'pearai.searchView' | 'pearai.creatorView';
      __creatorOverlayAnimation?: {
        targetHeightOffset: undefined | string;
        timestamp: number;
      };
    }
  }

export {}