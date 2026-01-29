import * as vscode from 'vscode';
import { MultiModelService, AIModel, AIResponse } from './services/multiModelService';

/**
 * Enhanced AI Coding Assistant
 * Supports multiple AI models, project context, and advanced features
 */
export class EnhancedAICodingAssistant {
	private multiModelService: MultiModelService;
	private context: vscode.ExtensionContext;
	private statusBarItem: vscode.StatusBarItem;
	private outputChannel: vscode.OutputChannel;

	constructor(context: vscode.ExtensionContext) {
		this.context = context;
		this.multiModelService = new MultiModelService();
		
		// Create status bar item
		this.statusBarItem = vscode.window.createStatusBarItem(
			vscode.StatusBarAlignment.Right,
			100
		);
		this.statusBarItem.text = '$(robot) AI Assistant';
		this.statusBarItem.tooltip = 'Click to select AI model';
		this.statusBarItem.command = 'ai-coding-assistant.selectModel';
		this.statusBarItem.show();

		// Create output channel
		this.outputChannel = vscode.window.createOutputChannel('AI Coding Assistant');
	}

	/**
	 * Initialize the enhanced assistant
	 */
	initialize(): void {
		this.checkConfiguration();
		this.registerCommands();
		this.setupConfigurationWatcher();
	}

	/**
	 * Check if required configuration is set
	 */
	private checkConfiguration(): void {
		const missingKeys = this.multiModelService.getMissingApiKeys();
		
		if (missingKeys.length > 0) {
			const message = `AI Coding Assistant: Some AI providers require configuration. Missing: ${missingKeys.join(', ')}`;
			vscode.window.showWarningMessage(message, 'Configure').then((selection) => {
				if (selection === 'Configure') {
					vscode.commands.executeCommand('workbench.action.openSettings', 'ai-coding-assistant');
				}
			});
		}
	}

	/**
	 * Register all commands
	 */
	private registerCommands(): void {
		const commands = [
			{ name: 'ai-coding-assistant.generateCode', handler: () => this.generateCode() },
			{ name: 'ai-coding-assistant.explainCode', handler: () => this.explainCode() },
			{ name: 'ai-coding-assistant.refactorCode', handler: () => this.refactorCode() },
			{ name: 'ai-coding-assistant.optimizePerformance', handler: () => this.optimizePerformance() },
			{ name: 'ai-coding-assistant.addComments', handler: () => this.addComments() },
			{ name: 'ai-coding-assistant.selectModel', handler: () => this.selectModel() },
			{ name: 'ai-coding-assistant.chat', handler: () => this.openChat() },
			{ name: 'ai-coding-assistant.generateTests', handler: () => this.generateTests() },
			{ name: 'ai-coding-assistant.fixBugs', handler: () => this.fixBugs() },
			{ name: 'ai-coding-assistant.analyzeCode', handler: () => this.analyzeCode() },
			{ name: 'ai-coding-assistant.showModels', handler: () => this.showModelInfo() }
		];

		commands.forEach(({ name, handler }) => {
			const disposable = vscode.commands.registerCommand(name, handler);
			this.context.subscriptions.push(disposable);
		});
	}

	/**
	 * Setup configuration change watcher
	 */
	private setupConfigurationWatcher(): void {
		vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
			if (e.affectsConfiguration('ai-coding-assistant')) {
				this.multiModelService.refreshConfiguration();
				this.checkConfiguration();
			}
		});
	}

	/**
	 * Generate code from natural language
	 */
	async generateCode(): Promise<void> {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor');
			return;
		}

		// Get user input via input box
		const description = await vscode.window.showInputBox({
			placeHolder: 'Describe the code you want to generate...',
			prompt: 'Enter a description of the code you want to generate'
		});

		if (!description) {
			return;
		}

		// Show progress
		await vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Window,
				title: 'Generating code...'
			},
			async () => {
				try {
					const language = editor.document.languageId;
					this.log(`Generating code for: ${description} (${language})`);
					
					const response = await this.multiModelService.generateCode(
						description,
						language
					);

					// Insert at cursor position
					editor.edit((editBuilder) => {
						editBuilder.insert(editor.selection.active, response.content);
					});

					this.showResponse(response, 'Code Generated');
					vscode.window.showInformationMessage('✨ Code generated successfully!');
				} catch (error) {
					this.handleError(error);
				}
			}
		);
	}

	/**
	 * Explain selected code
	 */
	async explainCode(): Promise<void> {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor');
			return;
		}

		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);

		if (!selectedText) {
			vscode.window.showErrorMessage('No code selected');
			return;
		}

		await vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: 'Analyzing code...'
			},
			async () => {
				try {
					this.log(`Explaining code (${selectedText.length} characters)`);
					
					const response = await this.multiModelService.explainCode(selectedText);
					this.showExplanationPanel(response.content, selectedText);
					
					this.showResponse(response, 'Code Explained');
				} catch (error) {
					this.handleError(error);
				}
			}
		);
	}

	/**
	 * Refactor selected code
	 */
	async refactorCode(): Promise<void> {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor');
			return;
		}

		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);

		if (!selectedText) {
			vscode.window.showErrorMessage('No code selected');
			return;
		}

		await vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Window,
				title: 'Refactoring code...'
			},
			async () => {
				try {
					const language = editor.document.languageId;
					this.log(`Refactoring code (${language})`);
					
					const response = await this.multiModelService.refactorCode(
						selectedText,
						language
					);

					// Show diff before applying
					const apply = await this.showDiff(selectedText, response.content, 'Refactored Code');
					if (apply) {
						editor.edit((editBuilder) => {
							editBuilder.replace(selection, response.content);
						});
						vscode.window.showInformationMessage('✨ Code refactored successfully!');
					}
					
					this.showResponse(response, 'Code Refactored');
				} catch (error) {
					this.handleError(error);
				}
			}
		);
	}

	/**
	 * Optimize code performance
	 */
	async optimizePerformance(): Promise<void> {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor');
			return;
		}

		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);

		if (!selectedText) {
			vscode.window.showErrorMessage('No code selected');
			return;
		}

		await vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Window,
				title: 'Optimizing performance...'
			},
			async () => {
				try {
					const language = editor.document.languageId;
					this.log(`Optimizing code (${language})`);
					
					const response = await this.multiModelService.optimizePerformance(
						selectedText,
						language
					);

					// Show diff before applying
					const apply = await this.showDiff(selectedText, response.content, 'Optimized Code');
					if (apply) {
						editor.edit((editBuilder) => {
							editBuilder.replace(selection, response.content);
						});
						vscode.window.showInformationMessage('⚡ Code optimized for better performance!');
					}
					
					this.showResponse(response, 'Code Optimized');
				} catch (error) {
					this.handleError(error);
				}
			}
		);
	}

	/**
	 * Add comments to code
	 */
	async addComments(): Promise<void> {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor');
			return;
		}

		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);

		if (!selectedText) {
			vscode.window.showErrorMessage('No code selected');
			return;
		}

		await vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Window,
				title: 'Adding comments...'
			},
			async () => {
				try {
					this.log(`Adding comments (${selectedText.length} characters)`);
					
					const response = await this.multiModelService.addComments(selectedText);

					editor.edit((editBuilder) => {
						editBuilder.replace(selection, response.content);
					});

					vscode.window.showInformationMessage('📝 Comments added successfully!');
					this.showResponse(response, 'Comments Added');
				} catch (error) {
					this.handleError(error);
				}
			}
		);
	}

	/**
	 * Generate tests for selected code
	 */
	async generateTests(): Promise<void> {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor');
			return;
		}

		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);

		if (!selectedText) {
			vscode.window.showErrorMessage('No code selected');
			return;
		}

		await vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Window,
				title: 'Generating tests...'
			},
			async () => {
				try {
					const language = editor.document.languageId;
					const testFramework = await this.selectTestFramework();
					
					if (!testFramework) return;

					this.log(`Generating tests (${language}, ${testFramework})`);
					
					const prompt = `You are an expert test developer. Generate comprehensive unit tests for this ${language} code using ${testFramework}:

\`\`\`
${selectedText}
\`\`\`

Requirements:
1. Cover edge cases and corner cases
2. Include both positive and negative test scenarios
3. Use proper assertions
4. Follow ${testFramework} best practices
5. Make tests readable and maintainable

Return ONLY the test code, no markdown formatting, no explanation.`;

					const response = await this.multiModelService.chat(
						[{ role: 'user', content: prompt }]
					);

					// Create new test file
					const testFileName = this.suggestTestFileName(editor.document.fileName, language);
					const newUri = vscode.Uri.file(testFileName);
					
					await vscode.workspace.fs.writeFile(
						newUri,
						Buffer.from(response.content)
					);

					// Open the test file
					const doc = await vscode.window.showTextDocument(newUri);
					await vscode.window.showInformationMessage(
						`Tests generated at ${testFileName}`,
						'Open File'
					);

					this.showResponse(response, 'Tests Generated');
				} catch (error) {
					this.handleError(error);
				}
			}
		);
	}

	/**
	 * Fix bugs in selected code
	 */
	async fixBugs(): Promise<void> {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor');
			return;
		}

		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);

		if (!selectedText) {
			vscode.window.showErrorMessage('No code selected');
			return;
		}

		await vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Window,
				title: 'Finding and fixing bugs...'
			},
			async () => {
				try {
					const language = editor.document.languageId;
					
					this.log(`Analyzing for bugs (${language})`);
					
					const prompt = `You are a senior software engineer and bug hunter. Analyze this ${language} code for bugs, security vulnerabilities, and potential issues:

\`\`\`
${selectedText}
\`\`\`

Provide:
1. List of bugs found (if any)
2. Security vulnerabilities
3. Edge cases that could fail
4. Fixed code that addresses all issues

Return ONLY the fixed code, no markdown, no explanation.`;

					const response = await this.multiModelService.chat(
						[{ role: 'user', content: prompt }]
					);

					// Show diff before applying
					const apply = await this.showDiff(selectedText, response.content, 'Bug Fix');
					if (apply) {
						editor.edit((editBuilder) => {
							editBuilder.replace(selection, response.content);
						});
						vscode.window.showInformationMessage('🐛 Bugs fixed successfully!');
					}

					this.showResponse(response, 'Bugs Fixed');
				} catch (error) {
					this.handleError(error);
				}
			}
		);
	}

	/**
	 * Analyze code for issues
	 */
	async analyzeCode(): Promise<void> {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor');
			return;
		}

		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);

		if (!selectedText) {
			vscode.window.showErrorMessage('No code selected');
			return;
		}

		await vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: 'Analyzing code...'
			},
			async () => {
				try {
					this.log(`Analyzing code (${selectedText.length} characters)`);
					
					const prompt = `You are a senior code reviewer. Provide a comprehensive analysis of this code:

\`\`\`
${selectedText}
\`\`\`

Analysis should include:
1. **Code Quality Score** (1-10)
2. **Issues Found** (bugs, security, performance)
3. **Best Practices Checklist**
4. **Suggestions for Improvement**
5. **Complexity Assessment**

Be thorough and specific.`;

					const response = await this.multiModelService.chat(
						[{ role: 'user', content: prompt }]
					);

					this.showAnalysisPanel(response.content);
					this.showResponse(response, 'Code Analyzed');
				} catch (error) {
					this.handleError(error);
				}
			}
		);
	}

	/**
	 * Select AI model
	 */
	async selectModel(): Promise<void> {
		const model = await this.multiModelService.showModelPicker();
		if (model) {
			vscode.window.showInformationMessage(`Selected model: ${model}`);
			this.updateStatusBar(model);
		}
	}

	/**
	 * Show model information
	 */
	async showModelInfo(): Promise<void> {
		const models = this.multiModelService.getAvailableModels();
		
		const modelList = models.map((m) => {
			const configured = this.multiModelService.isModelConfigured(m.id);
			return `${m.name} (${this.multiModelService.getProviderName(m.provider)}) - ${configured ? '✓' : '⚠'}`;
		}).join('\n');

		const message = `Available Models:\n\n${modelList}`;
		
		const panel = vscode.window.createWebviewPanel(
			'modelInfo',
			'AI Models',
			vscode.ViewColumn.One,
			{ enableScripts: true }
		);

		panel.webview.html = this.generateModelInfoHtml(models);
	}

	/**
	 * Open chat interface
	 */
	async openChat(): Promise<void> {
		const panel = vscode.window.createWebviewPanel(
			'aiChat',
			'💬 AI Chat',
			vscode.ViewColumn.Two,
			{ enableScripts: true }
		);

		panel.webview.html = this.generateChatHtml();
		
		// Handle messages from webview
		panel.webview.onDidReceiveMessage(async (message) => {
			if (message.type === 'sendMessage') {
				await vscode.window.withProgress(
					{ location: vscode.ProgressLocation.Notification, title: 'AI is thinking...' },
					async () => {
						try {
							const response = await this.multiModelService.chat(
								[{ role: 'user', content: message.text }]
							);
							panel.webview.postMessage({ type: 'response', text: response.content });
						} catch (error) {
							panel.webview.postMessage({ type: 'error', text: String(error) });
						}
					}
				);
			}
		});
	}

	/**
	 * Show diff between old and new code
	 */
	private async showDiff(
		oldCode: string,
		newCode: string,
		title: string
	): Promise<boolean> {
		const panel = vscode.window.createWebviewPanel(
			'codeDiff',
			title,
			vscode.ViewColumn.Two,
			{ enableScripts: true }
		);

		panel.webview.html = this.generateDiffHtml(oldCode, newCode);
		
		return new Promise((resolve) => {
			panel.webview.onDidReceiveMessage((message) => {
				resolve(message.apply === true);
				panel.dispose();
			});
		});
	}

	/**
	 * Show explanation panel
	 */
	private showExplanationPanel(explanation: string, code: string): void {
		const panel = vscode.window.createWebviewPanel(
			'codeExplanation',
			'✨ AI Code Explanation',
			vscode.ViewColumn.Two,
			{ enableScripts: true }
		);

		panel.webview.html = this.generateExplanationHtml(explanation, code);
	}

	/**
	 * Show analysis panel
	 */
	private showAnalysisPanel(analysis: string): void {
		const panel = vscode.window.createWebviewPanel(
			'codeAnalysis',
			'📊 Code Analysis',
			vscode.ViewColumn.Two,
			{ enableScripts: true }
		);

		panel.webview.html = this.generateAnalysisHtml(analysis);
	}

	/**
	 * Show response details
	 */
	private showResponse(response: AIResponse, title: string): void {
		this.log(`${title}: ${response.model} (${response.usage.totalTokens} tokens)`);
	}

	/**
	 * Handle errors
	 */
	private handleError(error: unknown): void {
		const message = error instanceof Error ? error.message : 'Unknown error';
		this.log(`Error: ${message}`);
		vscode.window.showErrorMessage(`AI Error: ${message}`);
	}

	/**
	 * Log to output channel
	 */
	private log(message: string): void {
		const timestamp = new Date().toLocaleTimeString();
		this.outputChannel.appendLine(`[${timestamp}] ${message}`);
	}

	/**
	 * Update status bar with current model
	 */
	private updateStatusBar(model: AIModel): void {
		const config = this.multiModelService.getModelConfig(model);
		if (config) {
			this.statusBarItem.text = `$(robot) ${config.name}`;
		}
	}

	/**
	 * Select test framework
	 */
	private async selectTestFramework(): Promise<string | undefined> {
		const frameworks = ['Jest', 'Mocha', 'pytest', 'JUnit', 'Vitest', 'unittest', 'Go test'];
		const selected = await vscode.window.showQuickPick(frameworks, {
			placeHolder: 'Select test framework...'
		});
		return selected;
	}

	/**
	 * Suggest test file name
	 */
	private suggestTestFileName(fileName: string, language: string): string {
		const ext = language === 'python' ? '.py' : 
					language === 'java' ? '.java' : 
					language === 'typescript' || language === 'javascript' ? '.test.ts' : '.test';
		
		const baseName = fileName.replace(/\.[^/.]+$/, '');
		return `${baseName}.test${ext}`;
	}

	/**
	 * Generate model info HTML
	 */
	private generateModelInfoHtml(models: any[]): string {
		return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Models</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #1e1e1e; color: #e0e0e0; padding: 20px; }
        h1 { color: #667eea; }
        .model { background: #2d2d2d; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea; }
        .model-name { font-size: 18px; font-weight: bold; }
        .model-provider { color: #888; margin-bottom: 8px; }
        .model-desc { color: #aaa; }
        .configured { color: #4caf50; }
        .not-configured { color: #ff9800; }
    </style>
</head>
<body>
    <h1>🤖 Available AI Models</h1>
    ${models.map(m => `
    <div class="model">
        <div class="model-name">${m.name}</div>
        <div class="model-provider">${this.multiModelService.getProviderName(m.provider)}</div>
        <div class="model-desc">${m.description}</div>
        <div class="${this.multiModelService.isModelConfigured(m.id) ? 'configured' : 'not-configured'}">
            ${this.multiModelService.isModelConfigured(m.id) ? '✓ Configured' : '⚠ Not Configured'}
        </div>
    </div>
    `).join('')}
</body>
</html>`;
	}

	/**
	 * Generate chat HTML
	 */
	private generateChatHtml(): string {
		return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Chat</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #1e1e1e; color: #e0e0e0; margin: 0; display: flex; flex-direction: column; height: 100vh; }
        #chat { flex: 1; overflow-y: auto; padding: 20px; }
        .message { margin: 10px 0; padding: 10px 15px; border-radius: 10px; max-width: 80%; }
        .user { background: #667eea; align-self: flex-end; margin-left: auto; }
        .assistant { background: #2d2d2d; }
        #input { padding: 15px; display: flex; gap: 10px; background: #2d2d2d; }
        input { flex: 1; padding: 10px; border-radius: 5px; border: none; background: #1e1e1e; color: #fff; }
        button { padding: 10px 20px; background: #667eea; border: none; border-radius: 5px; color: #fff; cursor: pointer; }
        button:hover { background: #5a6fd6; }
    </style>
</head>
<body>
    <div id="chat"></div>
    <div id="input">
        <input type="text" id="message" placeholder="Ask AI anything..." />
        <button onclick="send()">Send</button>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        function send() {
            const input = document.getElementById('message');
            if (input.value.trim()) {
                addMessage('user', input.value);
                vscode.postMessage({ type: 'sendMessage', text: input.value });
                input.value = '';
            }
        }
        function addMessage(role, text) {
            const chat = document.getElementById('chat');
            const div = document.createElement('div');
            div.className = 'message ' + role;
            div.textContent = text;
            chat.appendChild(div);
            chat.scrollTop = chat.scrollHeight;
        }
        window.addEventListener('message', (e) => {
            if (e.data.type === 'response') {
                addMessage('assistant', e.data.text);
            } else if (e.data.type === 'error') {
                addMessage('assistant', 'Error: ' + e.data.text);
            }
        });
    </script>
</body>
</html>`;
	}

	/**
	 * Generate diff HTML
	 */
	private generateDiffHtml(oldCode: string, newCode: string): string {
		return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Code Diff</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #1e1e1e; color: #e0e0e0; padding: 20px; }
        .diff { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .code { background: #2d2d2d; padding: 15px; border-radius: 8px; overflow-x: auto; }
        h2 { color: #667eea; }
        pre { white-space: pre-wrap; }
        .btn { padding: 10px 20px; background: #4caf50; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px; }
        .btn-reject { background: #f44336; }
    </style>
</head>
<body>
    <h2>Code Changes</h2>
    <div class="diff">
        <div class="code">
            <h3>Original</h3>
            <pre>${this.escapeHtml(oldCode)}</pre>
        </div>
        <div class="code">
            <h3>New</h3>
            <pre>${this.escapeHtml(newCode)}</pre>
        </div>
    </div>
    <button class="btn" onclick="apply(true)">Apply Changes</button>
    <button class="btn btn-reject" onclick="apply(false)">Reject</button>
    <script>
        function apply(apply) {
            vscode.postMessage({ apply });
        }
    </script>
</body>
</html>`;
	}

	/**
	 * Generate explanation HTML
	 */
	private generateExplanationHtml(explanation: string, code: string): string {
		return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Code Explanation</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%); color: #e0e0e0; padding: 24px; }
        .section { margin-bottom: 24px; }
        h1 { background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .code { background: rgba(0,0,0,0.4); border-left: 4px solid #667eea; padding: 16px; border-radius: 6px; }
        .explanation { background: rgba(102,126,234,0.05); padding: 16px; border-radius: 6px; border: 1px solid rgba(102,126,234,0.2); }
    </style>
</head>
<body>
    <h1>✨ AI Code Explanation</h1>
    <div class="section">
        <h3>Your Code</h3>
        <div class="code"><pre>${this.escapeHtml(code)}</pre></div>
    </div>
    <div class="section">
        <h3>Explanation</h3>
        <div class="explanation">${this.escapeHtml(explanation).replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>
    </div>
</body>
</html>`;
	}

	/**
	 * Generate analysis HTML
	 */
	private generateAnalysisHtml(analysis: string): string {
		return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Code Analysis</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #1e1e1e; color: #e0e0e0; padding: 24px; }
        h1 { color: #667eea; }
        .analysis { background: #2d2d2d; padding: 20px; border-radius: 8px; line-height: 1.8; }
    </style>
</head>
<body>
    <h1>📊 Code Analysis</h1>
    <div class="analysis">${this.escapeHtml(analysis).replace(/\n/g, '<br>')}</div>
</body>
</html>`;
	}

	/**
	 * Escape HTML special characters
	 */
	private escapeHtml(text: string): string {
		const map: { [key: string]: string } = {
			'&': '&amp;',
			'<': '<',
			'>': '>',
			'"': '"',
			"'": '&#039;'
		};
		return text.replace(/[&<>"']/g, (m) => map[m]);
	}

	/**
	 * Dispose resources
	 */
	dispose(): void {
		this.statusBarItem.dispose();
		this.outputChannel.dispose();
	}
}

