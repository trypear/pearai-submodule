import * as vscode from 'vscode';
import { ContinueGUIWebviewViewProvider } from './ContinueGUIWebviewViewProvider';
import { ConfigHandler } from 'core/config/ConfigHandler';
import { VsCodeWebviewProtocol } from './webviewProtocol';

export class PearAIWebviewManager {
    private sidebars: Map<string, ContinueGUIWebviewViewProvider> = new Map();
    resolveWebviewProtocol: any;

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly configHandlerPromise: Promise<ConfigHandler>,
        private readonly windowId: string,
        webviewProtocolPromise: Promise<VsCodeWebviewProtocol>,
    ) {
        this.resolveWebviewProtocol = undefined;
        webviewProtocolPromise = new Promise<VsCodeWebviewProtocol>(
            (resolve) => {
                this.resolveWebviewProtocol = resolve;
            },
        );
    }

    registerWebview(title: string): ContinueGUIWebviewViewProvider {
        const provider = new ContinueGUIWebviewViewProvider(
            this.configHandlerPromise,
            this.windowId,
            this.context
        );

        this.context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(
                `pearai.${title}`,
                provider,
                {
                    webviewOptions: { retainContextWhenHidden: true },
                }
            )
        );

        this.sidebars.set(title, provider);
        this.resolveWebviewProtocol(provider.webviewProtocol);
        return provider;
    }

    getWebview(title: string): ContinueGUIWebviewViewProvider {
        const provider = this.sidebars.get(title);
        if (!provider) {
            throw new Error(`Webview with title "${title}" does not exist.`);
        }
        return provider;
    }

    getAllWebviews(): ContinueGUIWebviewViewProvider[] {
        return Array.from(this.sidebars.values());
    }
}
