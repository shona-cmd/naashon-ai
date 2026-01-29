import * as vscode from 'vscode';
import { AIService } from './services/aiService';

export class AICodingAssistant {
	private aiService: AIService;

	constructor(private context: vscode.ExtensionContext) {
		this.aiService = new AIService();
	}

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
					const generatedCode = await this.aiService.generateCode(
						description,
						editor.document.languageId
					);

					// Insert at cursor position
					editor.edit((editBuilder) => {
						editBuilder.insert(editor.selection.active, generatedCode);
					});

					vscode.window.showInformationMessage('Code generated successfully!');
				} catch (error) {
					vscode.window.showErrorMessage(
						`Failed to generate code: ${error instanceof Error ? error.message : 'Unknown error'}`
					);
				}
			}
		);
	}

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
					const explanation = await this.aiService.explainCode(selectedText);
					this.showExplanationPanel(explanation, selectedText);
				} catch (error) {
					vscode.window.showErrorMessage(
						`Failed to explain code: ${error instanceof Error ? error.message : 'Unknown error'}`
					);
				}
			}
		);
	}

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
					const refactoredCode = await this.aiService.refactorCode(
						selectedText,
						editor.document.languageId
					);

					editor.edit((editBuilder) => {
						editBuilder.replace(selection, refactoredCode);
					});

					vscode.window.showInformationMessage('✨ Code refactored successfully!');
				} catch (error) {
					vscode.window.showErrorMessage(
						`Failed to refactor code: ${error instanceof Error ? error.message : 'Unknown error'}`
					);
				}
			}
		);
	}

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
					const optimizedCode = await this.aiService.optimizePerformance(
						selectedText,
						editor.document.languageId
					);

					editor.edit((editBuilder) => {
						editBuilder.replace(selection, optimizedCode);
					});

					vscode.window.showInformationMessage('⚡ Code optimized for better performance!');
				} catch (error) {
					vscode.window.showErrorMessage(
						`Failed to optimize code: ${error instanceof Error ? error.message : 'Unknown error'}`
					);
				}
			}
		);
	}

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
					const commentedCode = await this.aiService.addComments(selectedText);

					editor.edit((editBuilder) => {
						editBuilder.replace(selection, commentedCode);
					});

					vscode.window.showInformationMessage('📝 Comments added successfully!');
				} catch (error) {
					vscode.window.showErrorMessage(
						`Failed to add comments: ${error instanceof Error ? error.message : 'Unknown error'}`
					);
				}
			}
		);
	}

	private showExplanationPanel(explanation: string, code: string): void {
		const panel = vscode.window.createWebviewPanel(
			'codeExplanation',
			'✨ AI Code Explanation',
			vscode.ViewColumn.Two,
			{ enableScripts: true }
		);

		const htmlContent = `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Code Explanation</title>
				<style>
					* {
						margin: 0;
						padding: 0;
						box-sizing: border-box;
					}
					
					body {
						font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
						background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
						color: #e0e0e0;
						line-height: 1.7;
						min-height: 100vh;
					}
					
					.container {
						padding: 24px;
						max-width: 900px;
						margin: 0 auto;
					}
					
					.header {
						display: flex;
						align-items: center;
						gap: 12px;
						margin-bottom: 24px;
						padding-bottom: 16px;
						border-bottom: 2px solid rgba(102, 126, 234, 0.3);
					}
					
					.icon {
						font-size: 28px;
						animation: pulse 2s ease-in-out infinite;
					}
					
					@keyframes pulse {
						0%, 100% { opacity: 1; }
						50% { opacity: 0.7; }
					}
					
					h1 {
						font-size: 24px;
						background: linear-gradient(135deg, #667eea, #764ba2);
						-webkit-background-clip: text;
						-webkit-text-fill-color: transparent;
						background-clip: text;
					}
					
					.section {
						margin-bottom: 28px;
					}
					
					.section-title {
						font-size: 16px;
						font-weight: 600;
						color: #667eea;
						margin-bottom: 12px;
						display: flex;
						align-items: center;
						gap: 8px;
					}
					
					.code-block {
						background: rgba(0, 0, 0, 0.4);
						border-left: 4px solid #667eea;
						border-radius: 6px;
						padding: 16px;
						overflow-x: auto;
						margin: 12px 0;
						font-family: 'Courier New', 'Monaco', monospace;
						font-size: 12px;
						line-height: 1.5;
						border: 1px solid rgba(102, 126, 234, 0.2);
						box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
					}
					
					code {
						color: #a9d8ff;
						font-size: 12px;
					}
					
					.explanation {
						background: rgba(102, 126, 234, 0.05);
						padding: 16px;
						border-radius: 6px;
						border: 1px solid rgba(102, 126, 234, 0.2);
						color: #d0d0d0;
					}
					
					.explanation p {
						margin-bottom: 12px;
					}
					
					.explanation p:last-child {
						margin-bottom: 0;
					}
					
					.keyword {
						color: #f093fb;
						font-weight: 600;
					}
					
					.feature-list {
						list-style: none;
						padding-left: 0;
					}
					
					.feature-list li {
						padding: 8px 0;
						padding-left: 24px;
						position: relative;
						color: #d0d0d0;
					}
					
					.feature-list li:before {
						content: "→";
						position: absolute;
						left: 0;
						color: #667eea;
						font-weight: bold;
					}
					
					.copy-btn {
						background: linear-gradient(135deg, #667eea, #764ba2);
						color: white;
						border: none;
						padding: 8px 16px;
						border-radius: 4px;
						cursor: pointer;
						font-size: 12px;
						font-weight: 600;
						margin-top: 8px;
						transition: all 0.3s ease;
					}
					
					.copy-btn:hover {
						transform: translateY(-2px);
						box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
					}
					
					.copy-btn:active {
						transform: translateY(0);
					}
					
					.summary {
						background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
						border-radius: 6px;
						padding: 12px;
						margin-bottom: 16px;
						border: 1px solid rgba(102, 126, 234, 0.3);
					}
					
					::-webkit-scrollbar {
						width: 8px;
						height: 8px;
					}
					
					::-webkit-scrollbar-track {
						background: transparent;
					}
					
					::-webkit-scrollbar-thumb {
						background: rgba(102, 126, 234, 0.3);
						border-radius: 4px;
					}
					
					::-webkit-scrollbar-thumb:hover {
						background: rgba(102, 126, 234, 0.5);
					}
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<div class="icon">✨</div>
						<h1>AI Code Explanation</h1>
					</div>
					
					<div class="section">
						<div class="section-title">📝 Your Code</div>
						<div class="code-block"><code>${this.escapeHtml(code)}</code></div>
					</div>
					
					<div class="section">
						<div class="section-title">🔍 Detailed Explanation</div>
						<div class="explanation">
							${this.escapeHtml(explanation).replace(/\n/g, '</p><p>').replace(/\*\*(.*?)\*\*/g, '<strong class="keyword">$1</strong>')}
						</div>
					</div>
					
					<button class="copy-btn" onclick="copyCode()">📋 Copy Code</button>
				</div>
				
				<script>
					function copyCode() {
						const code = \`${this.escapeHtml(code)}\`;
						navigator.clipboard.writeText(code).then(() => {
							const btn = event.target;
							btn.textContent = '✓ Copied!';
							setTimeout(() => {
								btn.textContent = '📋 Copy Code';
							}, 2000);
						});
					}
				</script>
			</body>
			</html>
		`;

		panel.webview.html = htmlContent;
	}

	private escapeHtml(text: string): string {
		const map: { [key: string]: string } = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;'
		};
		return text.replace(/[&<>"']/g, (m) => map[m]);
	}
}
