import * as vscode from 'vscode';
import { AICodingAssistant } from './assistant';
import { EnhancedAICodingAssistant } from './enhancedAssistant';
import { AIChatViewProvider } from './views/chatViewProvider';
import { AIMultiLineCompletionProvider } from './ui/completionProvider';
import { MultiModelService, ModelProvider } from './services/multiModelService';

let assistant: AICodingAssistant;
let enhancedAssistant: EnhancedAICodingAssistant;
let chatViewProvider: AIChatViewProvider;
let multiModelService: MultiModelService;

export async function activate(context: vscode.ExtensionContext) {
	console.log('🚀 AI Coding Assistant activated! Version 0.3.0 - World Class Edition');

	// Initialize the multi-model service
	multiModelService = new MultiModelService();

	// Initialize providers
	chatViewProvider = new AIChatViewProvider(context);

	// Register webview view for chat
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			'aiChatView',
			chatViewProvider
		)
	);

	// Initialize the enhanced AI assistant with all features
	enhancedAssistant = new EnhancedAICodingAssistant(context, chatViewProvider);
	enhancedAssistant.initialize();

	// Initialize the original assistant
	assistant = new AICodingAssistant(context);

	// Register all commands with enhanced functionality
	const commands = [
		// Core generation commands
		{ name: 'ai-coding-assistant.generateCode', handler: () => assistant.generateCode() },
		{ name: 'ai-coding-assistant.generateSmart', handler: () => enhancedAssistant.generateSmartCode() },
		{ name: 'ai-coding-assistant.generateFromComments', handler: () => enhancedAssistant.generateFromComments() },
		
		// Code understanding
		{ name: 'ai-coding-assistant.explainCode', handler: () => assistant.explainCode() },
		{ name: 'ai-coding-assistant.analyzeCode', handler: () => enhancedAssistant.analyzeCodeDeeply() },
		{ name: 'ai-coding-assistant.documentCode', handler: () => enhancedAssistant.generateDocumentation() },
		
		// Code improvement
		{ name: 'ai-coding-assistant.refactorCode', handler: () => assistant.refactorCode() },
		{ name: 'ai-coding-assistant.optimizePerformance', handler: () => assistant.optimizePerformance() },
		{ name: 'ai-coding-assistant.addComments', handler: () => assistant.addComments() },
		{ name: 'ai-coding-assistant.simplifyCode', handler: () => enhancedAssistant.simplifyCode() },
		
		// Bug fixing & Testing
		{ name: 'ai-coding-assistant.fixBugs', handler: () => enhancedAssistant.fixBugsAdvanced() },
		{ name: 'ai-coding-assistant.generateTests', handler: () => enhancedAssistant.generateTestsAdvanced() },
		{ name: 'ai-coding-assistant.fixFormatting', handler: () => enhancedAssistant.fixFormatting() },
		
		// AI Model management
		{ name: 'ai-coding-assistant.selectModel', handler: () => enhancedAssistant.selectModel() },
		{ name: 'ai-coding-assistant.showModels', handler: () => enhancedAssistant.showModelInfo() },
		{ name: 'ai-coding-assistant.compareModels', handler: () => enhancedAssistant.compareModels() },
		
		// Chat & collaboration
		{ name: 'ai-coding-assistant.chat', handler: () => enhancedAssistant.openChat() },
		{ name: 'ai-coding-assistant.chatSelection', handler: () => enhancedAssistant.chatSelection() },
		{ name: 'ai-coding-assistant.refineResponse', handler: () => enhancedAssistant.refineLastResponse() },
		
		// Advanced features
		{ name: 'ai-coding-assistant.migrateCode', handler: () => enhancedAssistant.migrateCode() },
		{ name: 'ai-coding-assistant.generateSnippet', handler: () => enhancedAssistant.generateSnippet() },
		{ name: 'ai-coding-assistant.findSimilar', handler: () => enhancedAssistant.findSimilarPatterns() },
		{ name: 'ai-coding-assistant.securityAudit', handler: () => enhancedAssistant.securityAudit() },
		
		// Project context
		{ name: 'ai-coding-assistant.generateComponent', handler: () => enhancedAssistant.generateComponent() },
		{ name: 'ai-coding-assistant.generateAPI', handler: () => enhancedAssistant.generateAPIEndpoint() },
		{ name: 'ai-coding-assistant.generateCRUD', handler: () => enhancedAssistant.generateCRUD() },
		
		// Utility
		{ name: 'ai-coding-assistant.clearHistory', handler: () => enhancedAssistant.clearHistory() },
		{ name: 'ai-coding-assistant.showShortcuts', handler: () => enhancedAssistant.showShortcuts() },
		{ name: 'ai-coding-assistant.sendToChat', handler: () => enhancedAssistant.sendToChat() },
		
		// Server health & status commands
		{ name: 'ai-coding-assistant.checkServerHealth', handler: () => checkServerHealth() },
		{ name: 'ai-coding-assistant.showServerStatus', handler: () => showServerStatus() },
		{ name: 'ai-coding-assistant.resetCircuitBreaker', handler: () => resetCircuitBreaker() },
	];

	// Register all commands
	commands.forEach(({ name, handler }) => {
		const command = vscode.commands.registerCommand(name, handler);
		context.subscriptions.push(command);
	});

	// Register inline AI completion provider
	const multiLineProvider = new AIMultiLineCompletionProvider(context);
	context.subscriptions.push(multiLineProvider.register());

	// Add toggle command for completions
	const toggleCompletionsCmd = vscode.commands.registerCommand(
		'ai-coding-assistant.toggleCompletions',
		() => multiLineProvider.toggle()
	);
	context.subscriptions.push(toggleCompletionsCmd);

	// Setup code actions provider for quick fixes
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider(
			{ scheme: 'file' },
			new AICodeActionsProvider(),
			{
				providedCodeActionKinds: [
					vscode.CodeActionKind.QuickFix,
					vscode.CodeActionKind.Refactor,
					vscode.CodeActionKind.SourceOrganizeImports
				]
			}
		)
	);

	// Setup document symbols for AI context
	context.subscriptions.push(
		vscode.languages.registerDocumentSymbolProvider(
			{ scheme: 'file' },
			new AIDocumentSymbolProvider()
		)
	);

	// Subscribe to editor events for context awareness
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			if (editor) {
				enhancedAssistant.onEditorChange(editor);
			}
		})
	);

	// Show welcome message with shortcuts
	vscode.window.showInformationMessage(
		'🚀 AI Coding Assistant v0.3.0 is ready! Press Ctrl+Shift+P for commands.',
		'View Shortcuts',
		'Open Chat'
	).then((selection) => {
		if (selection === 'View Shortcuts') {
			vscode.commands.executeCommand('ai-coding-assistant.showShortcuts');
		} else if (selection === 'Open Chat') {
			vscode.commands.executeCommand('ai-coding-assistant.chat');
		}
	});

	console.log('✅ AI Coding Assistant fully initialized with world-class features!');
}

class AICodeActionsProvider implements vscode.CodeActionProvider {
	provideCodeActions(
		document: vscode.TextDocument,
		range: vscode.Range,
		context: vscode.CodeActionContext,
		token: vscode.CancellationToken
	): vscode.CodeAction[] {
		const actions: vscode.CodeAction[] = [];

		const refactorAction = new vscode.CodeAction(
			'✨ AI Refactor',
			vscode.CodeActionKind.Refactor
		);
		refactorAction.command = {
			command: 'ai-coding-assistant.refactorCode',
			title: 'AI Refactor',
			tooltip: 'Refactor with AI assistance'
		};
		actions.push(refactorAction);

		const fixAction = new vscode.CodeAction(
			'🐛 AI Fix Bugs',
			vscode.CodeActionKind.QuickFix
		);
		fixAction.command = {
			command: 'ai-coding-assistant.fixBugs',
			title: 'AI Fix Bugs',
			tooltip: 'Find and fix bugs with AI'
		};
		actions.push(fixAction);

		return actions;
	}
}

class AIDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
	provideDocumentSymbols(
		document: vscode.TextDocument,
		token: vscode.CancellationToken
	): vscode.DocumentSymbol[] {
		const symbols: vscode.DocumentSymbol[] = [];
		
		const text = document.getText();
		const lines = text.split('\n');
		
		lines.forEach((line, index) => {
			const trimmedLine = line.trim();
			
			const funcMatch = trimmedLine.match(/^(?:async\s+)?function\s+(\w+)/);
			if (funcMatch) {
				const range = new vscode.Range(
					new vscode.Position(index, 0),
					new vscode.Position(index, line.length)
				);
				symbols.push(new vscode.DocumentSymbol(
					funcMatch[1],
					'Function',
					vscode.SymbolKind.Function,
					range,
					range
				));
			}
			
			const classMatch = trimmedLine.match(/^class\s+(\w+)/);
			if (classMatch) {
				const range = new vscode.Range(
					new vscode.Position(index, 0),
					new vscode.Position(index, line.length)
				);
				symbols.push(new vscode.DocumentSymbol(
					classMatch[1],
					'Class',
					vscode.SymbolKind.Class,
					range,
					range
				));
			}
		});
		
		return symbols;
	}
}

export function deactivate() {
	console.log('👋 AI Coding Assistant deactivated!');
}

// ============================================
// Server Health Check Functions
// ============================================

/**
 * Check server health for all configured providers
 */
async function checkServerHealth(): Promise<void> {
	await vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			title: 'Checking server health...'
		},
		async () => {
			const providers: ModelProvider[] = ['openai', 'anthropic', 'google', 'ollama'];
			const results: string[] = [];

			for (const provider of providers) {
				try {
					const health = await multiModelService.checkServerHealth(provider);
					const statusIcon = health.status === 'healthy' ? '✅' : health.status === 'degraded' ? '⚠️' : '❌';
					const latencyMs = health.latency > 0 ? `${health.latency}ms` : 'N/A';
					results.push(`${statusIcon} ${multiModelService.getProviderName(provider)}: ${health.status} (${latencyMs})`);
				} catch (error) {
					results.push(`❌ ${multiModelService.getProviderName(provider)}: Error - ${error instanceof Error ? error.message : 'Unknown'}`);
				}
			}

			const panel = vscode.window.createWebviewPanel(
				'serverHealth',
				'🔍 Server Health Status',
				vscode.ViewColumn.One,
				{ enableScripts: true }
			);

			panel.webview.html = generateHealthReportHtml(results, multiModelService);
		}
	);
}

/**
 * Show detailed server status including circuit breaker state
 */
async function showServerStatus(): Promise<void> {
	await vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			title: 'Gathering server status...'
		},
		async () => {
			const providers: ModelProvider[] = ['openai', 'anthropic', 'google', 'ollama'];
			const healthResults: string[] = [];
			const circuitStatus = multiModelService.getCircuitBreakerStatus();

			for (const provider of providers) {
				try {
					const health = await multiModelService.checkServerHealth(provider);
					const circuit = circuitStatus[provider];
					const statusIcon = health.status === 'healthy' ? '✅' : health.status === 'degraded' ? '⚠️' : '❌';
					healthResults.push(`
						<tr>
							<td>${multiModelService.getProviderName(provider)}</td>
							<td>${statusIcon} ${health.status}</td>
							<td>${health.latency}ms</td>
							<td><span class="circuit-${circuit.state}">${circuit.state.toUpperCase()}</span></td>
							<td>${circuit.failures}</td>
						</tr>
					`);
				} catch (error) {
					healthResults.push(`
						<tr>
							<td>${multiModelService.getProviderName(provider)}</td>
							<td>❌ Unhealthy</td>
							<td>N/A</td>
							<td><span class="circuit-${circuitStatus[provider].state}">${circuitStatus[provider].state.toUpperCase()}</span></td>
							<td>${circuitStatus[provider].failures}</td>
						</tr>
					`);
				}
			}

			const panel = vscode.window.createWebviewPanel(
				'serverStatus',
				'📊 Server Status',
				vscode.ViewColumn.One,
				{ enableScripts: true }
			);

			panel.webview.html = generateStatusReportHtml(healthResults);
		}
	);
}

/**
 * Reset circuit breaker for a provider
 */
async function resetCircuitBreaker(): Promise<void> {
	interface ProviderOption {
		label: string;
		id: ModelProvider;
	}

	const providers: ProviderOption[] = [
		{ id: 'openai', label: 'OpenAI' },
		{ id: 'anthropic', label: 'Anthropic' },
		{ id: 'google', label: 'Google' },
		{ id: 'ollama', label: 'Ollama' }
	];

	const selected = await vscode.window.showQuickPick(providers, {
		placeHolder: 'Select provider to reset circuit breaker...'
	});

	if (selected) {
		multiModelService.resetCircuitBreaker(selected.id);
		vscode.window.showInformationMessage(`✅ Circuit breaker reset for ${selected.label}`);
	}
}

/**
 * Generate HTML for health report
 */
function generateHealthReportHtml(results: string[], service: MultiModelService): string {
	return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Server Health</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #1e1e1e; color: #e0e0e0; padding: 24px; }
        h1 { color: #667eea; margin-bottom: 20px; }
        .result { background: #2d2d2d; padding: 12px 16px; margin: 8px 0; border-radius: 6px; border-left: 4px solid #667eea; }
        .healthy { border-left-color: #4caf50; }
        .degraded { border-left-color: #ff9800; }
        .unhealthy { border-left-color: #f44336; }
        .btn { background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 20px; }
        .btn:hover { background: #5a6fd6; }
    </style>
</head>
<body>
    <h1>🔍 Server Health Status</h1>
    ${results.map(r => `<div class="result">${r}</div>`).join('')}
    <button class="btn" onclick="vscode.postMessage({command: 'refresh'})">🔄 Refresh</button>
    <script>
        const vscode = acquireVsCodeApi();
        document.querySelector('.btn').addEventListener('click', () => {
            vscode.postMessage({command: 'refresh'});
        });
        window.addEventListener('message', (e) => {
            if (e.data.command === 'refresh') {
                vscode.commands.executeCommand('ai-coding-assistant.checkServerHealth');
            }
        });
    </script>
</body>
</html>`;
}

/**
 * Generate HTML for detailed status report
 */
function generateStatusReportHtml(healthResults: string[]): string {
	return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Server Status</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #1e1e1e; color: #e0e0e0; padding: 24px; }
        h1 { color: #667eea; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #3d3d3d; }
        th { background: #2d2d2d; color: #667eea; }
        .circuit-closed { color: #4caf50; }
        .circuit-open { color: #f44336; }
        .circuit-half-open { color: #ff9800; }
    </style>
</head>
<body>
    <h1>📊 Server Status & Circuit Breakers</h1>
    <table>
        <thead>
            <tr>
                <th>Provider</th>
                <th>Status</th>
                <th>Latency</th>
                <th>Circuit</th>
                <th>Failures</th>
            </tr>
        </thead>
        <tbody>
            ${healthResults.join('')}
        </tbody>
    </table>
</body>
</html>`;
}

