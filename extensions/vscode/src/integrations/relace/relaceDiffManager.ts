import * as vscode from "vscode";

export class RelaceDiffManager {
    private static instance: RelaceDiffManager;
    
    private originalFile: vscode.TextEditor | null = null;
    private diffFile: vscode.TextDocument | null = null;
    private isDiffActive: boolean = false;

    private constructor() {}

    static getInstance(): RelaceDiffManager {
        if (!RelaceDiffManager.instance) {
            RelaceDiffManager.instance = new RelaceDiffManager();
        }
        return RelaceDiffManager.instance;
    }

    setDiffState(originalFile: vscode.TextEditor, diffFile: vscode.TextDocument) {
        this.originalFile = originalFile;
        this.diffFile = diffFile;
        this.isDiffActive = true;
    }

    clearDiffState() {
        this.originalFile = null;
        this.diffFile = null;
        this.isDiffActive = false;
    }

    getOriginalFile(): vscode.TextEditor | null {
        return this.originalFile;
    }

    getRelaceDiffFile(): vscode.TextDocument | null {
        return this.diffFile;
    }

    isDiffViewActive(): boolean {
        return this.isDiffActive;
    }
}