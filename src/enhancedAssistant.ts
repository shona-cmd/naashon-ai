import * as vscode from 'vscode';
import { MultiModelService, AIModel, AIResponse } from './services/multiModelService';
import { AIChatViewProvider } from './views/chatViewProvider';

/**
 * Enhanced AI Coding Assistant
 * Supports multiple AI models, project context, and advanced features
 */
export class EnhancedAICodingAssistant {
	private multiModelService: MultiModelService;
	private context: vscode.ExtensionContext;
	private statusBarItem: vscode.StatusBarItem;
	private outputChannel: vscode.OutputChannel;
	private chatViewProvider: AIChatViewProvider;
	private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

	constructor(context: vscode.ExtensionContext, chatViewProvider?: AIChatViewProvider) {
		this.context = context;
		this.multiModelService = new MultiModelService();
		this.chatViewProvider = chatViewProvider || new AIChatViewProvider(context);
		
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
	 * Generate smart code based on context
	 */
	async generateSmartCode(): Promise<void> {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor');
			return;
		}

		const description = await vscode.window.showInputBox({
			placeHolder: 'Describe what you want to generate...'
		});

		if (!description) return;

		await vscode.window.withProgress(
			{ location: vscode.ProgressLocation.Window, title: 'Generating smart code...' },
			async () => {
				try {
					const prompt = `Generate smart, production-ready ${editor.document.languageId} code for: ${description}. Return ONLY code.`;
					const response = await this.multiModelService.chat([{ role: 'user', content: prompt }]);
					editor.edit((e) => e.insert(editor.selection.active, response.content));
					vscode.window.showInformationMessage('✨ Smart code generated!');
				} catch (error) {
					this.handleError(error);
				}
			}
		);
	}

	/**
	 * Generate code from comments
	 */
	async generateFromComments(): Promise<void> {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor');
			return;
		}

		const selection = editor.selection;
		const comments = editor.document.getText(selection);

		if (!comments) {
			vscode.window.showErrorMessage('No comments selected');
			return;
		}

		await vscode.window.withProgress(
			{ location: vscode.ProgressLocation.Window, title: 'Generating code from comments...' },
			async () => {
				try {
					const prompt = `Generate ${editor.document.languageId} code that implements these requirements:\n${comments}\n\nReturn ONLY code.`;
					const response = await this.multiModelService.chat([{ role: 'user', content: prompt }]);
					editor.edit((e) => e.replace(selection, response.content));
					vscode.window.showInformationMessage('✅ Code generated from comments!');
				} catch (error) {
					this.handleError(error);
				}
			}
		);
	}

	/**
	 * Analyze code deeply
	 */
	async analyzeCodeDeeply(): Promise<void> {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor');
			return;
		}

		const selection = editor.selection;
		const code = editor.document.getText(selection);

		if (!code) {
			vscode.window.showErrorMessage('No code selected');
			return;
		}

		await vscode.window.withProgress(
			{ location: vscode.ProgressLocation.Notification, title: 'Deep analysis...' },
			async () => {
				try {
					const prompt = `Perform deep analysis of this code:\n\`\`\`\n${code}\n\`\`\`\nInclude: bugs, security issues, performance, complexity, best practices.`;
					const response = await this.multiModelService.chat([{ role: 'user', content: prompt }]);
					this.showAnalysisPanel(response.content);
					this.showResponse(response, 'Deep Analysis');
				} catch (error) {
					this.handleError(error);
				}
			}
		);
	}

	/**
	 * Generate documentation
	 */
	async generateDocumentation(): Promise<void> {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor');
			return;
		}

		const selection = editor.selection;
		const code = editor.document.getText(selection);

		if (!code) {
			vscode.window.showErrorMessage('No code selected');
			return;
		}

		await vscode.window.withProgress(
			{ location: vscode.ProgressLocation.Window, title: 'Generating documentation...' },
			async () => {
				try {
					const prompt = `Generate comprehensive JSDoc/documentation for this code:\n\`\`\`\n${code}\n\`\`\`\nInclude descriptions, parameters, return types, examples.`;
					const response = await this.multiModelService.chat([{ role: 'user', content: prompt }]);
					const docCode = response.content + '\n' + code;
					editor.edit((e) => e.replace(selection, docCode));
					vscode.window.showInformationMessage('📚 Documentation added!');
				} catch (error) {
					this.handleError(error);
				}
			}
		);
	}

	/**
	 * Simplify code
	 */
	async simplifyCode(): Promise<void> {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor');
			return;
		}

		const selection = editor.selection;
		const code = editor.document.getText(selection);

		if (!code) {
			vscode.window.showErrorMessage('No code selected');
			return;
		}

		await vscode.window.withProgress(
			{ location: vscode.ProgressLocation.Window, title: 'Simplifying...' },
			async () => {
				try {
					const response = await this.multiModelService.refactorCode(code, editor.document.languageId);
					const apply = await this.showDiff(code, response.content, 'Simplified Code');
					if (apply) {
						editor.edit((e) => e.replace(selection, response.content));
						vscode.window.showInformationMessage('✨ Code simplified!');
					}
				} catch (error) {
					this.handleError(error);
				}
			}
		);
	}

	/**
	 * Fix bugs (advanced)
	 */
	async fixBugsAdvanced(): Promise<void> {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor');
			return;
		}

		const selection = editor.selection;
		const code = editor.document.getText(selection);

		if (!code) {
			vscode.window.showErrorMessage('No code selected');
			return;
		}

		await vscode.window.withProgress(
			{ location: vscode.ProgressLocation.Window, title: 'Finding bugs...' },
			async () => {
				try {
					const prompt = `Find ALL bugs in this ${editor.document.languageId} code:\n\`\`\`\n${code}\n\`\`\`\nReturn fixed code only.`;
					const response = await this.multiModelService.chat([{ role: 'user', content: prompt }]);
					const apply = await this.showDiff(code, response.content, 'Bug Fixes');
					if (apply) {
						editor.edit((e) => e.replace(selection, response.content));
						vscode.window.showInformationMessage('🐛 Bugs fixed!');
					}
				} catch (error) {
					this.handleError(error);
				}
			}
		);
	}

	/**
	 * Generate tests (advanced)
	 */
	async generateTestsAdvanced(): Promise<void> {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor');
			return;
		}

		const selection = editor.selection;
		const code = editor.document.getText(selection);

		if (!code) {
			vscode.window.showErrorMessage('No code selected');
			return;
		}

		await vscode.window.withProgress(
			{ location: vscode.ProgressLocation.Window, title: 'Generating comprehensive tests...' },
			async () => {
				try {
					const framework = await this.selectTestFramework();
					if (!framework) return;

					const prompt = `Generate comprehensive unit tests for this ${editor.document.languageId} code using ${framework}:\n\`\`\`\n${code}\n\`\`\`\nReturn tests only.`;
					const response = await this.multiModelService.chat([{ role: 'user', content: prompt }]);
					editor.edit((e) => e.insert(editor.selection.active, '\n\n' + response.content));
					vscode.window.showInformationMessage('✅ Tests generated!');
				} catch (error) {
					this.handleError(error);
				}
			}
		);
	}

	/**
	 * Fix code formatting
	 */
	async fixFormatting(): Promise<void> {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor');
			return;
		}

		const selection = editor.selection;
		const code = editor.document.getText(selection);

		if (!code) {
			vscode.window.showErrorMessage('No code selected');
			return;
		}

		await vscode.window.withProgress(
			{ location: vscode.ProgressLocation.Window, title: 'Fixing formatting...' },
			async () => {
				try {
					const prompt = `Fix formatting and style for this ${editor.document.languageId} code:\n\`\`\`\n${code}\n\`\`\`\nReturn only formatted code.`;
					const response = await this.multiModelService.chat([{ role: 'user', content: prompt }]);
					editor.edit((e) => e.replace(selection, response.content));
					vscode.window.showInformationMessage('🎨 Formatting fixed!');
				} catch (error) {
					this.handleError(error);
				}
			}
		);
	}

	/**
	 * Compare models
	 */
	async compareModels(): Promise<void> {
		const models = this.multiModelService.getAvailableModels();
		if (models.length < 2) {
			vscode.window.showWarningMessage('Need at least 2 models configured');
			return;
		}

		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor');
			return;
		}

		const selection = editor.selection;
		const code = editor.document.getText(selection);

		if (!code) {
			vscode.window.showErrorMessage('No code selected');
			return;
		}

		vscode.window.showInformationMessage('Model comparison coming soon!');
	}

	/**
	 * Chat with selection context
	 */
	async chatSelection(): Promise<void> {
		const editor = vscode.window.activeTextEditor;
		const selectedCode = editor?.document.getText(editor.selection) || '';

		const userMessage = await vscode.window.showInputBox({
			placeHolder: 'Ask about the selected code...'
		});

		if (!userMessage) return;

		await vscode.window.withProgress(
			{ location: vscode.ProgressLocation.Notification, title: 'Thinking...' },
			async () => {
				try {
					const context = selectedCode ? `Here's the code:\n\`\`\`\n${selectedCode}\n\`\`\`` : '';
					const fullMessage = context ? `${context}\n\n${userMessage}` : userMessage;
					const response = await this.multiModelService.chat([{ role: 'user', content: fullMessage }]);
					vscode.window.showInformationMessage(response.content);
				} catch (error) {
					this.handleError(error);
				}
			}
		);
	}

	/**
	 * Refine last response
	 */
	async refineLastResponse(): Promise<void> {
		if (this.conversationHistory.length === 0) {
			vscode.window.showWarningMessage('No previous response to refine');
			return;
		}

		const refinement = await vscode.window.showInputBox({
			placeHolder: 'How would you like to refine the response?'
		});

		if (!refinement) return;

		await vscode.window.withProgress(
			{ location: vscode.ProgressLocation.Notification, title: 'Refining...' },
			async () => {
				try {
					this.conversationHistory.push({ role: 'user', content: refinement });
					const response = await this.multiModelService.chat(this.conversationHistory as any);
					this.conversationHistory.push({ role: 'assistant', content: response.content });
					vscode.window.showInformationMessage(response.content);
				} catch (error) {
					this.handleError(error);
				}
			}
		);
	}

	/**
	 * Migrate code to another language
	 */
	async migrateCode(): Promise<void> {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor');
			return;
		}

		const code = editor.document.getText(editor.selection);
		if (!code) {
			vscode.window.showErrorMessage('No code selected');
			return;
		}

		const targetLang = await vscode.window.showInputBox({
			placeHolder: 'Target language (e.g., Python, Java, Go)...'
		});

		if (!targetLang) return;

		await vscode.window.withProgress(
			{ location: vscode.ProgressLocation.Window, title: 'Migrating code...' },
			async () => {
				try {
					const prompt = `Convert this ${editor.document.languageId} code to ${targetLang}:\n\`\`\`\n${code}\n\`\`\`\nReturn only the converted code.`;
					const response = await this.multiModelService.chat([{ role: 'user', content: prompt }]);
					editor.edit((e) => e.replace(editor.selection, response.content));
					vscode.window.showInformationMessage(`✅ Code migrated to ${targetLang}!`);
				} catch (error) {
					this.handleError(error);
				}
			}
		);
	}

	/**
	 * Generate code snippet
	 */
	async generateSnippet(): Promise<void> {
		const description = await vscode.window.showInputBox({
			placeHolder: 'Describe the snippet you need...'
		});

		if (!description) return;

		await vscode.window.withProgress(
			{ location: vscode.ProgressLocation.Window, title: 'Generating snippet...' },
			async () => {
				try {
					const editor = vscode.window.activeTextEditor;
					const lang = editor?.document.languageId || 'javascript';
					const prompt = `Generate a reusable ${lang} code snippet for: ${description}\nReturn ONLY code.`;
					const response = await this.multiModelService.chat([{ role: 'user', content: prompt }]);
					
					if (editor) {
						editor.edit((e) => e.insert(editor.selection.active, response.content));
					}
					vscode.window.showInformationMessage('✨ Snippet generated!');
				} catch (error) {
					this.handleError(error);
				}
			}
		);
	}

	/**
	 * Find similar patterns
	 */
	async findSimilarPatterns(): Promise<void> {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor');
			return;
		}

		const code = editor.document.getText(editor.selection);
		if (!code) {
			vscode.window.showErrorMessage('No code selected');
			return;
		}

		await vscode.window.withProgress(
			{ location: vscode.ProgressLocation.Notification, title: 'Searching for patterns...' },
			async () => {
				try {
					const prompt = `Find similar code patterns and refactoring opportunities in:\n\`\`\`\n${code}\n\`\`\``;
					const response = await this.multiModelService.chat([{ role: 'user', content: prompt }]);
					this.showAnalysisPanel(response.content);
				} catch (error) {
					this.handleError(error);
				}
			}
		);
	}

	/**
	 * Security audit
	 */
	async securityAudit(): Promise<void> {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor');
			return;
		}

		const code = editor.document.getText(editor.selection);
		if (!code) {
			vscode.window.showErrorMessage('No code selected');
			return;
		}

		await vscode.window.withProgress(
			{ location: vscode.ProgressLocation.Window, title: 'Running security audit...' },
			async () => {
				try {
					const prompt = `Perform comprehensive security audit of this code:\n\`\`\`\n${code}\n\`\`\`\nCheck for: SQL injection, XSS, auth issues, data exposure, crypto weaknesses.`;
					const response = await this.multiModelService.chat([{ role: 'user', content: prompt }]);
					this.showAnalysisPanel(response.content);
					vscode.window.showInformationMessage('🔒 Security audit complete!');
				} catch (error) {
					this.handleError(error);
				}
			}
		);
	}

	/**
	 * Generate component
	 */
	async generateComponent(): Promise<void> {
		const name = await vscode.window.showInputBox({
			placeHolder: 'Component name (e.g., UserCard, LoginForm)...'
		});

		if (!name) return;

		const description = await vscode.window.showInputBox({
			placeHolder: 'Component description and requirements...'
		});

		if (!description) return;

		await vscode.window.withProgress(
			{ location: vscode.ProgressLocation.Window, title: 'Generating component...' },
			async () => {
				try {
					const editor = vscode.window.activeTextEditor;
					const lang = editor?.document.languageId || 'typescript';
					const prompt = `Generate a production-ready ${name} component in ${lang}:\n${description}\nInclude types, error handling, accessibility.`;
					const response = await this.multiModelService.chat([{ role: 'user', content: prompt }]);
					vscode.window.showInformationMessage(response.content);
				} catch (error) {
					this.handleError(error);
				}
			}
		);
	}

	/**
	 * Generate API endpoint
	 */
	async generateAPIEndpoint(): Promise<void> {
		const method = await vscode.window.showQuickPick(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);
		if (!method) return;

		const path = await vscode.window.showInputBox({
			placeHolder: 'API path (e.g., /users/:id)...'
		});

		if (!path) return;

		await vscode.window.withProgress(
			{ location: vscode.ProgressLocation.Window, title: 'Generating API endpoint...' },
			async () => {
				try {
					const editor = vscode.window.activeTextEditor;
					const lang = editor?.document.languageId || 'typescript';
					const prompt = `Generate a ${method} endpoint for path ${path} in ${lang}. Include validation, error handling, and documentation.`;
					const response = await this.multiModelService.chat([{ role: 'user', content: prompt }]);
					editor?.edit((e) => e.insert(editor.selection.active, response.content));
					vscode.window.showInformationMessage('✅ API endpoint generated!');
				} catch (error) {
					this.handleError(error);
				}
			}
		);
	}

	/**
	 * Generate CRUD operations
	 */
	async generateCRUD(): Promise<void> {
		const model = await vscode.window.showInputBox({
			placeHolder: 'Model/Entity name (e.g., User, Product)...'
		});

		if (!model) return;

		await vscode.window.withProgress(
			{ location: vscode.ProgressLocation.Window, title: 'Generating CRUD...' },
			async () => {
				try {
					const editor = vscode.window.activeTextEditor;
					const lang = editor?.document.languageId || 'typescript';
					const prompt = `Generate complete CRUD operations for ${model} entity in ${lang}. Include database queries, validation, error handling.`;
					const response = await this.multiModelService.chat([{ role: 'user', content: prompt }]);
					editor?.edit((e) => e.insert(editor.selection.active, response.content));
					vscode.window.showInformationMessage('✅ CRUD operations generated!');
				} catch (error) {
					this.handleError(error);
				}
			}
		);
	}

	/**
	 * Clear conversation history
	 */
	async clearHistory(): Promise<void> {
		this.conversationHistory = [];
		vscode.window.showInformationMessage('✅ Conversation history cleared!');
	}

	/**
	 * Show keyboard shortcuts
	 */
	async showShortcuts(): Promise<void> {
		const panel = vscode.window.createWebviewPanel(
			'aiShortcuts',
			'⌨️ AI Assistant Shortcuts',
			vscode.ViewColumn.One,
			{ enableScripts: true }
		);

		const shortcuts = [
			{ cmd: 'ai-coding-assistant.generateCode', desc: 'Generate code from description' },
			{ cmd: 'ai-coding-assistant.explainCode', desc: 'Explain selected code' },
			{ cmd: 'ai-coding-assistant.refactorCode', desc: 'Refactor code' },
			{ cmd: 'ai-coding-assistant.chat', desc: 'Open AI chat' },
			{ cmd: 'ai-coding-assistant.fixBugs', desc: 'Find and fix bugs' },
			{ cmd: 'ai-coding-assistant.generateTests', desc: 'Generate tests' },
			{ cmd: 'ai-coding-assistant.securityAudit', desc: 'Run security audit' }
		];

		const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
		body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#1e1e1e;color:#e0e0e0;padding:20px}
		h1{color:#667eea}
		.shortcut{background:#2d2d2d;padding:12px;margin:8px 0;border-radius:6px;border-left:3px solid #667eea}
		.cmd{color:#4caf50;font-weight:bold;font-family:monospace}
		</style></head><body><h1>⌨️ Keyboard Shortcuts</h1>
		${shortcuts.map(s => `<div class="shortcut"><div class="cmd">${s.cmd}</div><div>${s.desc}</div></div>`).join('')}
		</body></html>`;

		panel.webview.html = html;
	}

	/**
	 * Send to chat
	 */
	async sendToChat(): Promise<void> {
		const editor = vscode.window.activeTextEditor;
		const selectedCode = editor?.document.getText(editor.selection) || '';

		if (selectedCode) {
			this.chatViewProvider.postMessage({ type: 'codeContext', code: selectedCode });
		}
		
		vscode.commands.executeCommand('ai-coding-assistant.chat');
	}

	/**
	 * Handle editor change
	 */
	onEditorChange(editor: vscode.TextEditor): void {
		// Update context awareness - could be used for intelligent suggestions
		const fileName = editor.document.fileName;
		const lineCount = editor.document.lineCount;
		this.log(`Editor changed: ${fileName} (${lineCount} lines)`);
	}

	/**
	 * Dispose resources
	 */
	dispose(): void {
		this.statusBarItem.dispose();
		this.outputChannel.dispose();
	}
}

