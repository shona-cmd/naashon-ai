const vscode = require('vscode');
const { AIService } = require('./src/services/aiService');

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
	console.log('AI Coding Assistant extension is now active!');

	// Initialize AI Service
	const aiService = new AIService();

	// Create output channel for logging
	const outputChannel = vscode.window.createOutputChannel('AI Coding Assistant');
	context.subscriptions.push(outputChannel);

	/**
	 * Show progress notification while processing
	 */
	async function withProgress(task, title) {
		return vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: title,
				cancellable: false
			},
			async (progress) => {
				return task();
			}
		);
	}

	/**
	 * Show result in a webview panel
	 */
	function showResultWebview(title, content, isCode = false) {
		const panel = vscode.window.createWebviewPanel(
			'aiCodingAssistant',
			title,
			vscode.ViewColumn.Beside,
			{
				enableScripts: true,
				retainContextWhenHidden: true
			}
		);

		const html = getWebviewHtml(title, content, isCode);
		panel.webview.html = html;

		// Add copy button command
		const copyCommand = vscode.commands.registerCommand('naashon-ai.copyResult', async () => {
			await vscode.env.clipboard.writeText(content);
			vscode.window.showInformationMessage('Copied to clipboard!');
		});
		context.subscriptions.push(copyCommand);
	}

	/**
	 * Get HTML for webview panel
	 */
	function getWebviewHtml(title, content, isCode) {
		const escapedContent = content
			.replace(/&/g, '&amp;')
			.replace(/</g, '<')
			.replace(/>/g, '>')
			.replace(/"/g, '"')
			.replace(/'/g, '&#039;');

		return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      color: #e4e4e7;
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid rgba(99, 102, 241, 0.3);
    }
    .header h1 {
      font-size: 1.5rem;
      background: linear-gradient(90deg, #a78bfa, #f472b6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .copy-btn {
      background: linear-gradient(90deg, #6366f1, #8b5cf6);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s;
    }
    .copy-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }
    .content {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      ${isCode ? `
      font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
      font-size: 14px;
      line-height: 1.6;
      white-space: pre-wrap;
      overflow-x: auto;
      ` : `
      font-size: 15px;
      line-height: 1.8;
      `}
    }
    .content code {
      background: rgba(99, 102, 241, 0.2);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Fira Code', monospace;
    }
    .content pre {
      background: rgba(0, 0, 0, 0.3);
      padding: 15px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 10px 0;
    }
    .content pre code {
      background: none;
      padding: 0;
    }
    .footer {
      margin-top: 20px;
      padding-top: 15px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      text-align: center;
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.8rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
      <button class="copy-btn" onclick="copyToClipboard()">📋 Copy</button>
    </div>
    <div class="content">${isCode ? escapedContent : content}</div>
    <div class="footer">
      Powered by AI Coding Assistant • Generated at ${new Date().toLocaleString()}
    </div>
  </div>
  <script>
    function copyToClipboard() {
      const content = document.querySelector('.content').textContent;
      navigator.clipboard.writeText(content).then(() => {
        const btn = document.querySelector('.copy-btn');
        btn.textContent = '✓ Copied!';
        setTimeout(() => btn.textContent = '📋 Copy', 2000);
      });
    }
  </script>
</body>
</html>`;
	}

	/**
	 * Get document language
	 */
	function getDocumentLanguage() {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const languageId = editor.document.languageId;
			return mapLanguage(languageId);
		}
		return 'javascript';
	}

	/**
	 * Map VS Code language IDs to common names
	 */
	function mapLanguage(languageId) {
		const languageMap = {
			'javascript': 'JavaScript',
			'typescript': 'TypeScript',
			'python': 'Python',
			'java': 'Java',
			'cpp': 'C++',
			'c': 'C',
			'csharp': 'C#',
			'go': 'Go',
			'rust': 'Rust',
			'ruby': 'Ruby',
			'php': 'PHP',
			'swift': 'Swift',
			'kotlin': 'Kotlin',
			'scala': 'Scala',
			'html': 'HTML',
			'css': 'CSS',
			'sql': 'SQL',
			'yaml': 'YAML',
			'json': 'JSON',
			'xml': 'XML',
			'markdown': 'Markdown',
			'shell': 'Shell',
			'dockerfile': 'Dockerfile'
		};
		return languageMap[languageId] || languageId.charAt(0).toUpperCase() + languageId.slice(1);
	}

	/**
	 * Get selected code or full document content
	 */
	function getSelectedCode() {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const selection = editor.selection;
			if (!selection.isEmpty) {
				return { text: editor.document.getText(selection), hasSelection: true };
			}
		}
		return { text: '', hasSelection: false };
	}

	// Register Generate Code command
	let generateCodeCmd = vscode.commands.registerCommand('naashon-ai.generateCode', async () => {
		try {
			const description = await vscode.window.showInputBox({
				prompt: 'Describe the code you want to generate',
				placeHolder: 'e.g., Create a function that validates email addresses',
				ignoreFocusOut: true
			});

			if (!description) {
				vscode.window.showWarningMessage('Please provide a description for the code.');
				return;
			}

			outputChannel.appendLine(`Generating code for: ${description}`);

			const result = await withProgress(async () => {
				return aiService.generateCode(description, getDocumentLanguage());
			}, 'Generating code with AI...');

			showResultWebview('AI: Generated Code', result, true);
			outputChannel.appendLine('Code generated successfully!');

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			outputChannel.appendLine(`Error: ${errorMessage}`);
			vscode.window.showErrorMessage(`Failed to generate code: ${errorMessage}`);
		}
	});

	// Register Explain Code command
	let explainCodeCmd = vscode.commands.registerCommand('naashon-ai.explainCode', async () => {
		try {
			const { text: selectedCode, hasSelection } = getSelectedCode();

			if (!hasSelection) {
				vscode.window.showWarningMessage('Please select code to explain.');
				return;
			}

			outputChannel.appendLine('Explaining selected code...');

			const explanation = await withProgress(async () => {
				return aiService.explainCode(selectedCode);
			}, 'Analyzing code with AI...');

			showResultWebview('AI: Code Explanation', explanation, false);
			outputChannel.appendLine('Code explanation generated!');

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			outputChannel.appendLine(`Error: ${errorMessage}`);
			vscode.window.showErrorMessage(`Failed to explain code: ${errorMessage}`);
		}
	});

	// Register Refactor Code command
	let refactorCodeCmd = vscode.commands.registerCommand('naashon-ai.refactorCode', async () => {
		try {
			const { text: selectedCode, hasSelection } = getSelectedCode();

			if (!hasSelection) {
				vscode.window.showWarningMessage('Please select code to refactor.');
				return;
			}

			outputChannel.appendLine('Refactoring selected code...');

			const refactoredCode = await withProgress(async () => {
				return aiService.refactorCode(selectedCode, getDocumentLanguage());
			}, 'Refactoring code with AI...');

			showResultWebview('AI: Refactored Code', refactoredCode, true);
			outputChannel.appendLine('Code refactored successfully!');

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			outputChannel.appendLine(`Error: ${errorMessage}`);
			vscode.window.showErrorMessage(`Failed to refactor code: ${errorMessage}`);
		}
	});

	// Register Optimize Performance command
	let optimizeCodeCmd = vscode.commands.registerCommand('naashon-ai.optimizeCode', async () => {
		try {
			const { text: selectedCode, hasSelection } = getSelectedCode();

			if (!hasSelection) {
				vscode.window.showWarningMessage('Please select code to optimize.');
				return;
			}

			outputChannel.appendLine('Optimizing selected code...');

			const optimizedCode = await withProgress(async () => {
				return aiService.optimizePerformance(selectedCode, getDocumentLanguage());
			}, 'Optimizing code with AI...');

			showResultWebview('AI: Optimized Code', optimizedCode, true);
			outputChannel.appendLine('Code optimized successfully!');

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			outputChannel.appendLine(`Error: ${errorMessage}`);
			vscode.window.showErrorMessage(`Failed to optimize code: ${errorMessage}`);
		}
	});

	// Register Add Comments command
	let addCommentsCmd = vscode.commands.registerCommand('naashon-ai.addComments', async () => {
		try {
			const { text: selectedCode, hasSelection } = getSelectedCode();

			if (!hasSelection) {
				vscode.window.showWarningMessage('Please select code to add comments.');
				return;
			}

			outputChannel.appendLine('Adding comments to selected code...');

			const commentedCode = await withProgress(async () => {
				return aiService.addComments(selectedCode);
			}, 'Adding comments with AI...');

			showResultWebview('AI: Commented Code', commentedCode, true);
			outputChannel.appendLine('Comments added successfully!');

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			outputChannel.appendLine(`Error: ${errorMessage}`);
			vscode.window.showErrorMessage(`Failed to add comments: ${errorMessage}`);
		}
	});

	// Subscribe to disposables
	context.subscriptions.push(
		generateCodeCmd,
		explainCodeCmd,
		refactorCodeCmd,
		optimizeCodeCmd,
		addCommentsCmd,
		outputChannel
	);
}

function deactivate() {
	console.log('AI Coding Assistant extension is now deactivated.');
}

module.exports = {
	activate,
	deactivate
};

