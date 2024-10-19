import * as vscode from 'vscode';

export class PerplexityWebviewViewProvider implements vscode.WebviewViewProvider {

    public static readonly viewType = "pearai.PerplexityView"
    private _webview?: vscode.Webview;
    private _webviewView?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public handleWebviewMessage(message: any) {
        if (message.messageType === "log") {
            console.log(message)
        }
    }

    // private getUri(webview: vscode.Webview, extensionUri: vscode.Uri, pathList: string[]) {
    //     return webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, ...pathList));
    //   }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const reactAppPath = path.join(this._extensionUri.fsPath, 'perplexity-ui', 'build');
        const indexHtml = fs.readFileSync(path.join(reactAppPath, 'index.html'), 'utf8');

        // Convert all links to vscode-resource URIs
        const convertedHtml = indexHtml.replace(
            /(href|src)="([^"]*)"/g,
            (match, $1, $2) => {
                if ($2.startsWith('http')) {
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
        this._webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(this._extensionUri.fsPath, 'webview-ui', 'build'))]
        };
        this._webview.onDidReceiveMessage((message) => this.handleWebviewMessage(message));
        this._webview.html = this._getHtmlForWebview(this._webview);
    }

    // getSidebarContent(
    //     webview: vscode.Webview, extensionUri: Uri
    // ): string {
    //     const styleUri = this.getUri(webview, extensionUri, [
    //         "perplexity-ui",
	// 		"build",
	// 		"assets",
	// 		"index.js",
    //     ])
    //     const scriptUri = this.getUri(webview, extensionUri, [
	// 		"perplexity-ui",
	// 		"build",
	// 		"assets",
	// 		"index.js",
	// 	]);

    //     return `
    //     <!DOCTYPE html>
    //     <html lang="en">
    //       <head>
    //         <meta charset="UTF-8" />
    //         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    //         <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src;">
    //         <link rel="stylesheet" type="text/css" href="${stylesUri}">
    //         <title>Perplexity Chat</title>
    //       </head>
    //       <body>
    //         <div id="root"></div>
    //         <script type="module" src="${scriptUri}"></script>
    //       </body>
    //     </html>
    //   `;
    // }

    // private _getHtmlForWebview(webview: vscode.Webview) {
    //     return `
    //       <!DOCTYPE html>
    //       <html lang="en">
    //       <head>
    //         <meta charset="UTF-8">
    //         <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //         <title>Perplexity AI</title>
    //         <style>
    //           body, html, iframe {
    //             margin: 0;
    //             padding: 0;
    //             height: 100%;
    //             width: 100%;
    //             overflow: hidden;
    //           }
    //         </style>
    //       </head>
    //       <body>
    //         <iframe src="https://www.wikipedia.org/" width="100%" height="100%" frameborder="0"></iframe>
    //       </body>
    //       </html>
    //     `;
    // }

    // public resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<unknown>, token: vscode.CancellationToken): void | Thenable<void> {
    //     this._webview = webviewView.webview
    //     this._webview.onDidReceiveMessage((message) => this.handleWebviewMessage(message));
    //     this._webview.html = this._getHtmlForWebview(this._webview)

    //     this._webview.options = {
    //         enableScripts: true,
    //         localResourceRoots: [vscode.Uri.file(path.join(this._extensionUri.fsPath, 'webview-ui', 'build'))]
    //     };

	// 	webviewView.webview.html = this._getWebviewContent(
	// 		webviewView.webview,
	// 		this._extensionUri,
	// 	);

	// 	this._setWebviewMessageListener(webviewView.webview);
	// 	console.log("success in resolveWebviewView!");
    // }
}