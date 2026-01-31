import * as vscode from 'vscode';
import { MultiModelService } from '../services/multiModelService';

/**
 * Represents a code completion suggestion from the AI model.
 */
export interface AICompletionItem {
    /** The text to be inserted when the completion is accepted */
    insertText: string;
    /** Display label for the completion */
    label: string;
    /** Brief description of the completion */
    detail: string;
    /** Detailed documentation with examples */
    documentation: string;
    /** Range where the completion should be applied */
    range: vscode.Range;
    /** Priority for sorting suggestions (higher = more relevant) */
    priority: number;
    /** Characters that commit the completion when typed */
    commitCharacters?: string[];
}

/**
 * Context information for the current cursor position and document.
 * Used to generate contextually appropriate completions.
 */
export interface CompletionContext {
    /** Code text before the cursor position */
    prefix: string;
    /** Code text after the cursor position */
    suffix: string;
    /** Programming language identifier (e.g., 'typescript', 'python') */
    language: string;
    /** Absolute path to the current file */
    filePath: string;
    /** Line number (1-indexed) of cursor position */
    lineNumber: number;
    /** Whitespace indentation at cursor line */
    indentation: string;
}

/**
 * Configuration constants for completion provider behavior.
 */
namespace CompletionConfig {
    export const DEBOUNCE_MS = 300;
    export const MAX_PREFIX_LINES = 10;
    export const MAX_SUFFIX_LINES = 3;
    export const MIN_PREFIX_LENGTH = 2;
    export const STATUS_BAR_PRIORITY = 102;
    export const DEFAULT_MODEL = 'gpt-4o';
    export const DOCUMENTATION_MAX_LINES = 5;
}

/**
 * Provides AI-powered real-time inline code completions as the user types.
 * Implements VS Code's InlineCompletionItemProvider interface to integrate
 * with the editor's native completion system.
 *
 * Features:
 * - Debounced completion requests to reduce API calls
 * - Context-aware suggestions based on code structure
 * - Smart trigger detection to avoid unwanted completions
 * - Status bar integration for enable/disable control
 */
export class AIInlineCompletionProvider implements vscode.InlineCompletionItemProvider {
    private multiModelService: MultiModelService;
    private context: vscode.ExtensionContext;
    private lastCompletionTime: number = 0;
    private statusBarItem?: vscode.StatusBarItem;
    private isEnabled: boolean = true;

    /**
     * Creates a new inline completion provider.
     * @param context - VS Code extension context for lifecycle management
     */
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.multiModelService = new MultiModelService();
        this.createStatusBarItem();
    }

    /**
     * Creates and displays the status bar item for completion control.
     * Allows users to enable/disable completions from the status bar.
     */
    private createStatusBarItem(): void {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            CompletionConfig.STATUS_BAR_PRIORITY
        );
        this.statusBarItem.text = '$(lightbulb) AI Complete';
        this.statusBarItem.tooltip = 'Click to toggle AI completions';
        this.statusBarItem.command = 'ai-coding-assistant.toggleCompletions';
        this.statusBarItem.show();
    }

    /**
     * Provides inline completion items for the current cursor position.
     * This is the main entry point called by VS Code when generating completions.
     *
     * @param document - The document where completions are requested
     * @param position - The cursor position in the document
     * @param context - Additional context about the completion request
     * @param token - Cancellation token to stop computation if needed
     * @returns Array of inline completion items or null if no completions available
     */
    async provideInlineCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.InlineCompletionContext,
        token: vscode.CancellationToken
    ): Promise<vscode.InlineCompletionItem[] | null> {
        // Check if completions are enabled
        if (!this.isEnabled) {
            return null;
        }

        // Debounce rapid requests to reduce API calls
        const now = Date.now();
        if (now - this.lastCompletionTime < CompletionConfig.DEBOUNCE_MS) {
            return null;
        }
        this.lastCompletionTime = now;

        // Check if request has been cancelled
        if (token.isCancellationRequested) {
            return null;
        }

        // Extract context information from document and position
        const completionContext = this.getCompletionContext(document, position);
        if (!completionContext) {
            return null;
        }

        // Determine if completion should be triggered based on context
        if (!this.shouldTriggerCompletion(completionContext)) {
            return null;
        }

        try {
            // Request AI completions
            const completions = await this.generateCompletions(completionContext, token);
            
            if (completions.length === 0) {
                return null;
            }

            // Convert AI completions to VS Code inline completion items
            return completions.map(completion => {
                const item = new vscode.InlineCompletionItem(
                    completion.insertText
                );
                item.range = new vscode.Range(
                    position,
                    position.translate(0, completion.insertText.length)
                );
                if (completion.commitCharacters) {
                    item.command = {
                        command: 'ai-coding-assistant.acceptCompletion',
                        title: 'Accept AI Completion',
                        arguments: [completion]
                    };
                }
                return item;
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Failed to generate inline completions:', errorMessage);
            return null;
        }
    }

    /**
     * Extracts the completion context from the current document and cursor position.
     * Includes surrounding code lines, language information, and indentation details.
     *
     * @param document - The text document to extract context from
     * @param position - The cursor position in the document
     * @returns CompletionContext with all relevant information, or null if invalid
     */
    private getCompletionContext(
        document: vscode.TextDocument,
        position: vscode.Position
    ): CompletionContext | null {
        try {
            const line = document.lineAt(position);
            const language = document.languageId;
            const filePath = document.uri.fsPath;

        // Collect preceding lines to provide context for completion
            const prefixStart = Math.max(0, position.line - CompletionConfig.MAX_PREFIX_LINES);
        const prefixLines: string[] = [];

        for (let i = prefixStart; i < position.line; i++) {
            prefixLines.push(document.lineAt(i).text);
        }

            // Extract text before cursor on current line
            const linePrefix = line.text.substring(0, position.character);

            // Extract text after cursor on current line
            const lineSuffix = line.text.substring(position.character);

            // Extract leading whitespace for indentation
            const indentation = line.text.match(/^\s*/) ?.[0] || '';

            return {
                prefix: [...prefixLines, linePrefix].join('\n'),
                suffix: lineSuffix,
                language,
                filePath,
                lineNumber: position.line + 1,
                indentation
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Failed to extract completion context:', errorMessage);
            return null;
        }
    }

    /**
     * Determines whether completions should be triggered at the current context.
     * Uses pattern matching to avoid suggesting completions in unsuitable locations.
     *
     * @param context - The completion context to evaluate
     * @returns True if completions should be generated, false otherwise
     */
    private shouldTriggerCompletion(context: CompletionContext): boolean {
        const trimmedPrefix = context.prefix.trim();

        // Don't trigger if prefix is too short
        if (trimmedPrefix.length < CompletionConfig.MIN_PREFIX_LENGTH) {
            return false;
        }

        // Patterns that should NOT trigger completions
        const noTriggerPatterns = [
            /^\s*$/,        // Empty or whitespace only
            /[\s;}]$/,      // Ends with whitespace or statement terminator
            /^\s*\/\//,    // Line comment
            /^\s*#/,        // Python comment
            /^\s*\*\//,    // Block comment end
        ];

        for (const pattern of noTriggerPatterns) {
            if (pattern.test(trimmedPrefix)) {
                return false;
            }
        }

        // Patterns that SHOULD trigger completions
        const triggerPatterns = [
            /function\s+\w+$/,      // Function declaration
            /class\s+\w+$/,         // Class declaration
            /const\s+\w+\s*=\s*$/,  // Variable assignment
            /let\s+\w+\s*=\s*$/,    // Variable assignment
            /:\s*$/,                // Type annotation
            /extends\s+\w+$/,       // Class inheritance
            /implements\s+[\w,\s]+$/, // Interface implementation
            /return\s+$/,           // Return statement
            /new\s+\w+$/,           // Constructor call
            /\.then\s*\($/,         // Promise chain
            /async\s+$/,            // Async function
            /await\s+$/,            // Await expression
            /if\s*\($/,             // If condition
            /else\s*$/,             // Else clause
            /for\s*\($/,            // For loop
            /while\s*\($/,          // While loop
            /try\s*$/,              // Try block
            /catch\s*\($/,          // Catch block
            /import\s+.*from\s+$/,  // Import statement
            /export\s+(default\s+)?$/, // Export statement
        ];

        for (const pattern of triggerPatterns) {
            if (pattern.test(trimmedPrefix)) {
                return true;
            }
        }

        // Also trigger after typing a few characters of a word
        const wordPattern = /\b\w{2,}$/;
        if (wordPattern.test(trimmedPrefix)) {
            // Check if word looks like a programming construct
            const word = trimmedPrefix.match(wordPattern)?.[0] || '';
            const constructs = [
                'function', 'class', 'interface', 'type', 'const', 'let', 'var',
                'if', 'else', 'for', 'while', 'switch', 'case', 'return',
                'import', 'export', 'from', 'async', 'await', 'new', 'this',
                'public', 'private', 'protected', 'static', 'readonly'
            ];
            
            if (constructs.some(c => word.startsWith(c) || c.startsWith(word))) {
                return true;
            }
        }

        return false;
    }

    /**
     * Generates AI-powered code completions based on the context.
     * Sends the context to the AI model and parses the response into completion items.
     *
     * @param context - The completion context for generating suggestions
     * @param token - Cancellation token for early termination
     * @returns Array of generated completion items
     */
    private async generateCompletions(
        context: CompletionContext,
        token: vscode.CancellationToken
    ): Promise<AICompletionItem[]> {
        const prompt = this.buildCompletionPrompt(context);

        try {
            const response = await this.multiModelService.chat([
                {
                    role: 'user',
                    content: prompt
                }
            ], CompletionConfig.DEFAULT_MODEL);

            if (token.isCancellationRequested) {
                return [];
            }

            return this.parseCompletions(response.content, context);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Failed to generate AI completions:', errorMessage);
            return [];
        }
    }

    /**
     * Constructs the prompt for the AI model to generate appropriate completions.
     * Includes context, instructions, and formatting requirements.
     *
     * @param context - The completion context with code information
     * @returns Formatted prompt string for the AI model
     */
    private buildCompletionPrompt(context: CompletionContext): string {
        const language = context.language.toUpperCase();
        const indentationSpaces = context.indentation.length;

        return `You are a professional code completion AI assistant. Complete the following ${language} code.

CONTEXT:
\`\`\`${language}
${context.prefix}
\`\`\`

SUFFIX (code that comes after cursor):
${context.suffix ? `\`\`\`${language}
${context.suffix}
\`\`\`` : '(empty - end of file)'}

INSTRUCTIONS:
1. Analyze the provided prefix to understand the code context and patterns
2. Generate natural, idiomatic completions that follow the existing code style
3. Return ONLY the completion text with no explanations or code block markers
4. If the suffix is empty, include closing braces/brackets/parentheses as needed
5. Maintain consistent indentation (${indentationSpaces} spaces)
6. Ensure the completion flows naturally from the prefix to any suffix
7. Provide concise, focused completions that are immediately useful

Return ONLY the completion text, beginning exactly where the prefix ends.`;
    }

    /**
     * Parses the AI response and converts it into properly formatted completion items.
     * Handles cleanup of code block markers and creates suggestions with metadata.
     *
     * @param response - Raw response from the AI model
     * @param context - The completion context for metadata
     * @returns Array of formatted completion items ready for VS Code
     */
    private parseCompletions(response: string, context: CompletionContext): AICompletionItem[] {
        let completion = response.trim();

        // Clean up markdown code block markers if present
        completion = completion
            .replace(/^```[\w]*\n?/g, '')
            .replace(/```$/g, '')
            .trim();

        // Return empty array if no valid completion
        if (!completion) {
            return [];
        }

        // Extract keyboard commit characters for this completion
        const commitCharacters = this.getCommitCharacters(completion);

        // Split completion into multiple suggestions if applicable
        const suggestions = this.splitCompletion(completion);

        // Convert suggestions to completion items with metadata
        return suggestions.map((suggestion, index) => ({
            insertText: suggestion,
            label: `AI Suggestion ${index + 1}`,
            detail: `AI-generated ${context.language} completion`,
            documentation: this.generateDocumentation(suggestion, context.language),
            commitCharacters,
            range: new vscode.Range(0, 0, 0, 0), // Adjusted by VS Code
            priority: 10 - index // Higher priority for earlier suggestions
        }));
    }

    /**
     * Determines keyboard characters that will commit (accept) the completion.
     * Allows users to accept completions naturally while continuing to type.
     *
     * @param completion - The completion text to analyze
     * @returns Array of commit characters or undefined if none applicable
     */
    private getCommitCharacters(completion: string): string[] | undefined {
        const chars: string[] = [];

        // Add newline as commit character for multi-line completions
        if (completion.includes('\n')) {
            chars.push('Enter');
        }

        // Add parenthesis if completion includes function calls
        if (completion.includes('(')) {
            chars.push('(');
        }

        // Add comma if completion includes comma-separated items
        if (completion.includes(',')) {
            chars.push(',');
        }

        return chars.length > 0 ? chars : undefined;
    }

    /**
     * Split completion into multiple suggestions if applicable
     */
    private splitCompletion(completion: string): string[] {
        // Split on double newlines to separate logically distinct code blocks
        const blocks = completion.split(/\n\n+/);
        
        // Return multiple blocks only if there are genuinely separate suggestions
        if (blocks.length > 1) {
            return blocks;
        }

        return [completion];
    }

    /**
     * Generates markdown documentation for a completion suggestion.
     * Formats the completion for display in the hover tooltip.
     *
     * @param completion - The completion text to document
     * @param language - The programming language for syntax highlighting
     * @returns Markdown-formatted documentation string
     */
    private generateDocumentation(completion: string, language: string): string {
        const lines = completion.split('\n');
        const summary = lines[0] || '';
        const additionalLines = lines.slice(1).filter(l => l.trim());

        // Build documentation with proper formatting
        const docParts: string[] = [
            `**AI-generated ${language} completion**`,
            ''
        ];

        // Include first line in code block
        if (summary) {
            docParts.push(`\`\`\`${language}\n${summary}\n\`\`\``);
        }

        // Add additional lines (limited to prevent excessive hover size)
        docParts.push(...additionalLines.slice(0, CompletionConfig.DOCUMENTATION_MAX_LINES));

        return docParts.filter(Boolean).join('\n');
    }

    /**
     * Toggles the completion provider on and off.
     * Updates the status bar UI and notifies the user of the change.
     */
    toggle(): void {
        this.isEnabled = !this.isEnabled;

        // Update status bar display and tooltip
        if (this.statusBarItem) {
            this.statusBarItem.text = this.isEnabled 
                ? '$(lightbulb) AI Complete'
                : '$(lightbulb-off) AI Complete';
            this.statusBarItem.tooltip = this.isEnabled
                ? 'Click to toggle AI completions (enabled)'
                : 'Click to toggle AI completions (disabled)';
        }
        
        // Notify user of status change
        vscode.window.showInformationMessage(
            `AI Code Completions ${this.isEnabled ? 'enabled' : 'disabled'}`
        );
    }

    /**
     * Retrieves the current status of the completion provider.
     * @returns Object containing enabled state and AI model information
     */
    getStatus(): { enabled: boolean; provider: string } {
        return {
            enabled: this.isEnabled,
            provider: CompletionConfig.DEFAULT_MODEL
        };
    }

    /**
     * Cleans up resources used by the provider.
     * Should be called when the extension is deactivated.
     */
    dispose(): void {
        this.statusBarItem?.dispose();
    }
}

/**
 * Manages registration and lifecycle of the AI inline completion provider.
 * Acts as a facade for integrating the completion provider with VS Code.
 *
 * This class handles:
 * - Provider registration with VS Code's language extension API
 * - Delegation of completion requests to the inline provider
 * - Lifecycle management and resource cleanup
 */
export class AIMultiLineCompletionProvider {
    private inlineProvider: AIInlineCompletionProvider;

    /**
     * Creates a new multi-line completion provider wrapper.
     * @param context - VS Code extension context for lifecycle management
     */
    constructor(context: vscode.ExtensionContext) {
        this.inlineProvider = new AIInlineCompletionProvider(context);
    }

    /**
     * Registers the completion provider with VS Code.
     * Must be called during extension activation to enable completions.
     *
     * @returns Disposable for unregistering the provider
     */
    register(): vscode.Disposable {
        return vscode.languages.registerInlineCompletionItemProvider(
            { pattern: '**' }, // Support all file types
            this.inlineProvider
        );
    }

    /**
     * Retrieves the current status of the completion provider.
     * @returns Status object with enabled state and model information
     */
    getStatus() {
        return this.inlineProvider.getStatus();
    }

    /**
     * Toggles the completion provider on and off.
     * Delegates to the underlying inline provider.
     */
    toggle() {
        this.inlineProvider.toggle();
    }

    /**
     * Cleans up resources used by the provider.
     * Should be called when the extension is deactivated.
     */
    dispose() {
        this.inlineProvider.dispose();
    }
}

