import * as vscode from 'vscode';
import { ContinueGUIWebviewViewProvider } from './ContinueGUIWebviewViewProvider';
import { ConfigHandler } from 'core/config/ConfigHandler';
import { VsCodeWebviewProtocol } from './webviewProtocol';

export class PearAIWebviewManager {
    private webviews: Map<string, ContinueGUIWebviewViewProvider> = new Map();
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

        this.webviews.set(title, provider);
        this.resolveWebviewProtocol(provider.webviewProtocol);
        return provider;
    }

    getWebview(title: string): ContinueGUIWebviewViewProvider {
        const webview = this.webviews.get(title);
        if (!webview) {
            throw new Error(`Webview with title "${title}" does not exist.`);
        }
        return webview;
    }

    getAllWebviews(): ContinueGUIWebviewViewProvider[] {
        return Array.from(this.webviews.values());
    }

    // on(event: string, listener: (...args: any[]) => void): void {
    //     this.webviews.forEach(webview => {
    //         webview.webviewProtocol.on(event, listener);
    //     });
    // }

    // request(event: string, ...args: any[]): void {
    //     this.webviews.forEach(webviewProtocol => {
    //         if (webviewProtocol.webview) {
    //             webviewProtocol.webview.request(event, ...args);
    //         }
    //     });
    // }
}
