import * as vscode from 'vscode';

export class AIChatViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(private context: vscode.ExtensionContext) {}

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = this.getHtml();
    }

    public postMessage(message: any) {
        this._view?.webview.postMessage(message);
    }

    private getHtml(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial; padding:12px}</style>
</head>
<body>
  <h3>AI Chat</h3>
  <div id="messages" style="white-space:pre-wrap;font-family:monospace;">No messages yet.</div>
  <script>
    const vscode = acquireVsCodeApi();
    window.addEventListener('message', event => {
      const m = document.getElementById('messages');
      if (!m) return;
      m.textContent = JSON.stringify(event.data, null, 2) + '\n' + m.textContent;
    });
  </script>
</body>
</html>`;
    }
}
