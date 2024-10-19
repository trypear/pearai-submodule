import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class PerplexityWebviewViewProvider implements vscode.WebviewViewProvider {

    public static readonly viewType = "pearai.PerplexityView"
    private _webview?: vscode.Webview;
    private _webviewView?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public handleWebviewMessage(message: any) {
        if (message.command === "log" || message.type === "alert") {
            console.log(message)
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const reactAppPath = path.join(this._extensionUri.fsPath, 'perplexity-ui', 'build');
        let indexHtml = fs.readFileSync(path.join(reactAppPath, 'index.html'), 'utf8');

        // // Inject necessary scripts to activate vscode within react app
        // const injectedScript = `
        //     <script>
        //         const vscode = acquireVsCodeApi();
        //         window.onload = function() {
        //                     vscode.postMessage({ command: 'log' });
        //                     console.log('Ready to accept data.');
        //                 };
        //     </script>
        // `;

        // // Insert the injected script right after the <head> tag
        // indexHtml = indexHtml.replace('</head>', `${injectedScript}</head>`);

        // // Convert all links to vscode-resource URIs
         const convertedHtml = indexHtml.replace(
            /(href|src)="([^"]*)"/g,
            (match, $1, $2) => {
                if ($2.startsWith('http') || $2.startsWith('#')) {
                    return match;
                }
                return `${$1}="${webview.asWebviewUri(vscode.Uri.file(path.join(reactAppPath, $2)))}"`;
            }
        );

        return convertedHtml;
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext<unknown>,
        token: vscode.CancellationToken
    ): void | Thenable<void> {
        this._webview = webviewView.webview;
        console.log(this._extensionUri)
        this._webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(this._extensionUri.fsPath, 'perplexity-ui', 'build'))]
        };
        this._webview.onDidReceiveMessage((message) => this.handleWebviewMessage(message));
        this._webview.html = this._getHtmlForWebview(this._webview);
    }
}