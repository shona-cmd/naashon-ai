import * as vscode from 'vscode';
import { AICodingAssistant } from './assistant';
import { EnhancedAICodingAssistant } from './enhancedAssistant';

let assistant: AICodingAssistant;
let enhancedAssistant: EnhancedAICodingAssistant;

export async function activate(context: vscode.ExtensionContext) {
	console.log('🤖 AI Coding Assistant activated!');

	// Initialize the enhanced AI assistant
	enhancedAssistant = new EnhancedAICodingAssistant(context);
	enhancedAssistant.initialize();

	// Initialize the original assistant
	assistant = new AICodingAssistant(context);

	// Register original commands
	const generateCodeCommand = vscode.commands.registerCommand(
		'ai-coding-assistant.generateCode',
		() => assistant.generateCode()
	);

	const explainCodeCommand = vscode.commands.registerCommand(
		'ai-coding-assistant.explainCode',
		() => assistant.explainCode()
	);

	const refactorCodeCommand = vscode.commands.registerCommand(
		'ai-coding-assistant.refactorCode',
		() => assistant.refactorCode()
	);

	const optimizeCommand = vscode.commands.registerCommand(
		'ai-coding-assistant.optimizePerformance',
		() => assistant.optimizePerformance()
	);

	const addCommentsCommand = vscode.commands.registerCommand(
		'ai-coding-assistant.addComments',
		() => assistant.addComments()
	);

	// Register new enhanced commands
	const selectModelCommand = vscode.commands.registerCommand(
		'ai-coding-assistant.selectModel',
		() => enhancedAssistant.selectModel()
	);

	const chatCommand = vscode.commands.registerCommand(
		'ai-coding-assistant.chat',
		() => enhancedAssistant.openChat()
	);

	const generateTestsCommand = vscode.commands.registerCommand(
		'ai-coding-assistant.generateTests',
		() => enhancedAssistant.generateTests()
	);

	const fixBugsCommand = vscode.commands.registerCommand(
		'ai-coding-assistant.fixBugs',
		() => enhancedAssistant.fixBugs()
	);

	const analyzeCodeCommand = vscode.commands.registerCommand(
		'ai-coding-assistant.analyzeCode',
		() => enhancedAssistant.analyzeCode()
	);

	const showModelsCommand = vscode.commands.registerCommand(
		'ai-coding-assistant.showModels',
		() => enhancedAssistant.showModelInfo()
	);

	context.subscriptions.push(
		generateCodeCommand,
		explainCodeCommand,
		refactorCodeCommand,
		optimizeCommand,
		addCommentsCommand,
		selectModelCommand,
		chatCommand,
		generateTestsCommand,
		fixBugsCommand,
		analyzeCodeCommand,
		showModelsCommand,
		enhancedAssistant
	);

	// Show welcome message
	vscode.window.showInformationMessage(
		'✨ AI Coding Assistant is ready! Use Ctrl+Shift+G to generate code, or try the new chat feature with Ctrl+Shift+P → AI: Chat',
		'Select Model'
	).then((selection) => {
		if (selection === 'Select Model') {
			vscode.commands.executeCommand('ai-coding-assistant.selectModel');
		}
	});
}

export function deactivate() {
	console.log('AI Coding Assistant is now deactivated!');
}
