import * as vscode from 'vscode';
import { MultiModelService } from './multiModelService';

/**
 * Inline Completion Item
 */
export interface AICompletionItem {
    insertText: string;
    label: string;
    detail: string;
    documentation: string;
    range: vscode.Range;
    priority: number;
    commitCharacters?: string[];
}

/**
 * Completion Context
 */
export interface CompletionContext {
    prefix: string;
    suffix: string;
    language: string;
    filePath: string;
    lineNumber: number;
    indentation: string;
}

/**
 * Inline Completion Provider
 * Provides AI-powered real-time code completions
 */
export class AIInlineCompletionProvider implements vscode.InlineCompletionItemProvider {
    private multiModelService: MultiModelService;
    private context: vscode.ExtensionContext;
    private lastCompletionTime: number = 0;
    private readonly debounceMs: number = 300;
    private readonly maxPrefixLines: number = 10;
    private readonly maxSuffixLines: number = 3;
    private statusBarItem?: vscode.StatusBarItem;
    private isEnabled: boolean = true;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.multiModelService = new MultiModelService();
        this.createStatusBarItem();
    }

    /**
     * Create status bar item
     */
    private createStatusBarItem(): void {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            102
        );
        this.statusBarItem.text = '$(lightbulb) AI Complete';
        this.statusBarItem.tooltip = 'Click to toggle AI completions';
        this.statusBarItem.command = 'ai-coding-assistant.toggleCompletions';
        this.statusBarItem.show();
    }

    /**
     * Provide inline completions
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

        // Debounce rapid requests
        const now = Date.now();
        if (now - this.lastCompletionTime < this.debounceMs) {
            return null;
        }
        this.lastCompletionTime = now;

        // Check cancellation
        if (token.isCancellationRequested) {
            return null;
        }

        // Get completion context
        const completionContext = this.getCompletionContext(document, position);
        if (!completionContext) {
            return null;
        }

        // Check if we should trigger completion
        if (!this.shouldTriggerCompletion(completionContext)) {
            return null;
        }

        try {
            // Generate completions
            const completions = await this.generateCompletions(completionContext, token);
            
            if (completions.length === 0) {
                return null;
            }

            // Convert to VS Code inline completion items
            return completions.map(completion => new vscode.InlineCompletionItem(
                completion.insertText,
                new vscode.Range(
                    position,
                    position.translate(0, completion.insertText.length)
                ),
                {
                    title: completion.label,
                    command: completion.commitCharacters ? {
                        command: 'ai-coding-assistant.acceptCompletion',
                        title: 'Accept AI Completion',
                        arguments: [completion]
                    } : undefined,
                    detail: completion.detail,
                    documentation: new vscode.MarkdownString(completion.documentation)
                }
            ));
        } catch (error) {
            console.error('Error generating completions:', error);
            return null;
        }
    }

    /**
     * Get completion context from document
     */
    private getCompletionContext(
        document: vscode.TextDocument,
        position: vscode.Position
    ): CompletionContext | null {
        const line = document.lineAt(position);
        const language = document.languageId;
        const filePath = document.uri.fsPath;

        // Get prefix (lines before current position)
        const prefixStart = Math.max(0, position.line - this.maxPrefixLines);
        const prefixLines: string[] = [];

        for (let i = prefixStart; i < position.line; i++) {
            prefixLines.push(document.lineAt(i).text);
        }

        // Get current line prefix (text before cursor)
        const linePrefix = line.text.substring(0, position.character);

        // Get suffix (text after cursor on current line)
        const lineSuffix = line.text.substring(position.character);

        // Get indentation
        const indentation = line.text.match(/^\s*/)?.[0] || '';

        return {
            prefix: [...prefixLines, linePrefix].join('\n'),
            suffix: lineSuffix,
            language,
            filePath,
            lineNumber: position.line + 1,
            indentation
        };
    }

    /**
     * Determine if we should trigger completion
     */
    private shouldTriggerCompletion(context: CompletionContext): boolean {
        const trimmedPrefix = context.prefix.trim();

        // Don't trigger after single character (too eager)
        if (trimmedPrefix.length < 2) {
            return false;
        }

        // Don't trigger after common triggers
        const noTriggerPatterns = [
            /^\s*$/,  // Empty
            /[\s;}]$/,  // End of statement
            /^\s*\/\//,  // Comment
            /^\s*#/,  // Python comment
            /^\s*\*\//,  // End of block comment
        ];

        for (const pattern of noTriggerPatterns) {
            if (pattern.test(trimmedPrefix)) {
                return false;
            }
        }

        // Trigger after common completion points
        const triggerPatterns = [
            /function\s+\w+$/,  // Function declaration
            /class\s+\w+$/,  // Class declaration
            /const\s+\w+\s*=\s*$/,  // Variable assignment
            /let\s+\w+\s*=\s*$/,  // Variable assignment
            /:\s*$/,  // Type annotation
            /extends\s+\w+$/,  // Class inheritance
            /implements\s+[\w,\s]+$/,  // Class implements
            /return\s+$/,  // Return statement
            /new\s+\w+$/,  // Constructor call
            /\.then\s*\($/,  // Promise chain
            /async\s+$/,  // Async function
            /await\s+$/,  // Await expression
            /if\s*\($/,  // If condition
            /else\s*$/,  // Else clause
            /for\s*\($/,  // For loop
            /while\s*\($/,  // While loop
            /try\s*$/,  // Try block
            /catch\s*\($/,  // Catch block
            /import\s+.*from\s+$/,  // Import statement
            /export\s+(default\s+)?$/,  // Export statement
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
     * Generate AI completions
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
            ], 'gpt-4o'); // Use fastest model for completions

            if (token.isCancellationRequested) {
                return [];
            }

            return this.parseCompletions(response.content, context);
        } catch (error) {
            console.error('Error in completion generation:', error);
            return [];
        }
    }

    /**
     * Build completion prompt
     */
    private buildCompletionPrompt(context: CompletionContext): string {
        const language = context.language.toUpperCase();

        return `You are a code completion AI. Complete the following ${language} code.

CONTEXT:
\`\`\`${language}
${context.prefix}
\`\`\`

SUFFIX (what comes after):
${context.suffix ? `\`\`\`${language}
${context.suffix}
\`\`\`` : '(empty - end of file)'}

INSTRUCTIONS:
1. Complete the code based on the context
2. The prefix shows what you've written so far
3. Return ONLY the completion text (no code blocks, no explanations)
4. Make the completion natural and useful
5. If the suffix is empty, include closing braces/brackets/parens if needed
6. Use consistent indentation (${context.indentation.length} spaces)

Return ONLY the completion text, starting exactly where the prefix ends.`;
    }

    /**
     * Parse completions from AI response
     */
    private parseCompletions(response: string, context: CompletionContext): AICompletionItem[] {
        let completion = response.trim();

        // Remove code block markers if present
        completion = completion
            .replace(/^```[\w]*\n?/g, '')
            .replace(/```$/g, '')
            .trim();

        if (!completion) {
            return [];
        }

        // Determine commit characters based on what we're completing
        const commitCharacters = this.getCommitCharacters(completion);

        // Split by likely completion boundaries for multiple suggestions
        const suggestions = this.splitCompletion(completion);

        return suggestions.map((suggestion, index) => ({
            insertText: suggestion,
            label: `AI Suggestion ${index + 1}`,
            detail: `AI-generated ${context.language} completion`,
            documentation: this.generateDocumentation(suggestion, context.language),
            range: new vscode.Range(0, 0, 0, 0), // Will be adjusted by VS Code
            priority: 10 - index // Higher priority for first suggestions
        }));
    }

    /**
     * Get appropriate commit characters
     */
    private getCommitCharacters(completion: string): string[] | undefined {
        const chars: string[] = [];

        if (completion.includes('\n')) {
            chars.push('Enter');
        }
        if (completion.includes('(')) {
            chars.push('(');
        }
        if (completion.includes(',')) {
            chars.push(',');
        }

        return chars.length > 0 ? chars : undefined;
    }

    /**
     * Split completion into multiple suggestions if applicable
     */
    private splitCompletion(completion: string): string[] {
        // If completion contains multiple distinct blocks, split them
        const blocks = completion.split(/\n\n+/);
        
        if (blocks.length > 1) {
            return blocks;
        }

        return [completion];
    }

    /**
     * Generate documentation for completion
     */
    private generateDocumentation(completion: string, language: string): string {
        const lines = completion.split('\n');
        const summary = lines[0] || '';
        const docLines = lines.slice(1).filter(l => l.trim());

        return [
            `**AI-generated ${language} completion**`,
            '',
            summary ? `\`\`\`${language}\n${summary}\n\`\`\`` : '',
            ...docLines.slice(0, 5)
        ].filter(Boolean).join('\n');
    }

    /**
     * Toggle completions on/off
     */
    toggle(): void {
        this.isEnabled = !this.isEnabled;
        this.statusBarItem!.text = this.isEnabled 
            ? '$(lightbulb) AI Complete'
            : '$(lightbulb-off) AI Complete';
        this.statusBarItem!.tooltip = this.isEnabled
            ? 'Click to toggle AI completions'
            : 'AI completions disabled';
        
        vscode.window.showInformationMessage(
            `AI Code Completions ${this.isEnabled ? 'enabled' : 'disabled'}`
        );
    }

    /**
     * Get status
     */
    getStatus(): { enabled: boolean; provider: string } {
        return {
            enabled: this.isEnabled,
            provider: 'GPT-4o'
        };
    }

    /**
     * Dispose
     */
    dispose(): void {
        this.statusBarItem?.dispose();
    }
}

/**
 * Multi-line Completion Provider
 * Provides multi-line code completions
 */
export class AIMultiLineCompletionProvider {
    private inlineProvider: AIInlineCompletionProvider;

    constructor(context: vscode.ExtensionContext) {
        this.inlineProvider = new AIInlineCompletionProvider(context);
    }

    /**
     * Register the completion provider
     */
    register(): vscode.Disposable {
        return vscode.languages.registerInlineCompletionItemProvider(
            { pattern: '**' }, // All file types
            this.inlineProvider
        );
    }

    /**
     * Get provider status
     */
    getStatus() {
        return this.inlineProvider.getStatus();
    }

    /**
     * Toggle completions
     */
    toggle() {
        this.inlineProvider.toggle();
    }

    /**
     * Dispose
     */
    dispose() {
        this.inlineProvider.dispose();
    }
}

