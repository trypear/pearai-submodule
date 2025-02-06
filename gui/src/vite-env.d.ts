/// <reference types="vite/client" />

declare global {
    interface Window {
      isPearOverlay?: boolean;
      viewType?: 'pearai.chatView' | 'pearai.mem0View' | 'pearai.searchView';
    }
  }

export {}