import * as vscode from 'vscode';
import { AICodingAssistant } from './assistant';
import { EnhancedAICodingAssistant } from './enhancedAssistant';
import { AIChatViewProvider } from './views/chatViewProvider';
import { AIMultiLineCompletionProvider } from './ui/completionProvider';

let assistant: AICodingAssistant;
let enhancedAssistant: EnhancedAICodingAssistant;
let chatViewProvider: AIChatViewProvider;

export async function activate(context: vscode.ExtensionContext) {
	console.log('🚀 AI Coding Assistant activated! Version 0.3.0 - World Class Edition');

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

