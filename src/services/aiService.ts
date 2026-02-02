import * as vscode from 'vscode';
import axios, { AxiosInstance } from 'axios';

/**
 * Server Health Status
 */
export interface ServerHealth {
	status: 'healthy' | 'degraded' | 'unhealthy';
	latency: number;
	error?: string;
	lastChecked: Date;
}

export class AIService {
	private apiKey: string = '';
	private model: string = 'gpt-3.5-turbo';
	private temperature: number = 0.7;
	private client: AxiosInstance;
	private retryAttempts: number = 3;
	private baseTimeout: number = 30000;
	private lastHealthCheck: ServerHealth | null = null;

	constructor() {
		this.loadConfiguration();
		this.client = axios.create({
			timeout: this.baseTimeout,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}

	private loadConfiguration(): void {
		const config = vscode.workspace.getConfiguration('ai-coding-assistant');
		this.apiKey = config.get('apiKey', '') || config.get('openaiApiKey', '');
		this.model = config.get('model', 'gpt-3.5-turbo');
		this.temperature = config.get('temperature', 0.7);
		this.retryAttempts = config.get('retryAttempts', 3);

		if (!this.apiKey) {
			vscode.window.showWarningMessage(
				'AI Coding Assistant: API key not configured. Please set your API key in settings.'
			);
		}
	}

	/**
	 * Sleep utility for retry delays
	 */
	private sleep(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	/**
	 * Calculate exponential backoff delay
	 */
	private getRetryDelay(attempt: number): number {
		return Math.min(1000 * Math.pow(2, attempt), 30000);
	}

	/**
	 * Check server health
	 */
	async checkServerHealth(): Promise<ServerHealth> {
		const startTime = Date.now();
		let status: ServerHealth['status'] = 'healthy';
		let error: string | undefined;

		try {
			await this.client.get('https://api.openai.com/v1/models', {
				headers: { Authorization: `Bearer ${this.apiKey}` },
				timeout: 10000
			});
		} catch (e) {
			status = 'unhealthy';
			error = e instanceof Error ? e.message : String(e);
		}

		this.lastHealthCheck = {
			status,
			latency: Date.now() - startTime,
			error,
			lastChecked: new Date()
		};

		return this.lastHealthCheck;
	}

	/**
	 * Get cached health status
	 */
	getCachedHealth(): ServerHealth | null {
		return this.lastHealthCheck;
	}

	async generateCode(description: string, language: string): Promise<string> {
		const prompt = `You are an expert ${language} programmer. Generate clean, production-ready, well-documented ${language} code based on this requirement:

"${description}"

Requirements:
- Write clear, maintainable code
- Include helpful comments for complex logic
- Follow best practices and conventions for ${language}
- Use meaningful variable names
- Include error handling where appropriate
- Keep the solution concise but comprehensive

Return ONLY the code, no markdown formatting, no explanation, no backticks.`;

		return this.callAIAPI(prompt);
	}

	async explainCode(code: string): Promise<string> {
		const prompt = `You are an expert code explainer. Provide a detailed, beginner-friendly explanation of this code:

\`\`\`
${code}
\`\`\`

Explanation should include:
1. **Overall Purpose**: What does this code do?
2. **Key Components**: Break down major parts
3. **Logic Flow**: How does it work step by step?
4. **Important Concepts**: Any patterns or techniques used?
5. **Common Use Cases**: When would you use this?

Be thorough but clear. Use simple language with examples when helpful.`;

		return this.callAIAPI(prompt);
	}

	async refactorCode(code: string, language: string): Promise<string> {
		const prompt = `You are a senior ${language} developer. Refactor this ${language} code to improve it:

\`\`\`
${code}
\`\`\`

Improvements should focus on:
1. **Readability**: Clear variable names and structure
2. **Performance**: Efficient algorithms and operations
3. **Best Practices**: Following ${language} conventions
4. **Maintainability**: Easier to understand and modify
5. **Modern Patterns**: Use current best practices

Return ONLY the refactored code, no markdown formatting, no explanation, no backticks.`;

		return this.callAIAPI(prompt);
	}

	async optimizePerformance(code: string, language: string): Promise<string> {
		const prompt = `You are a performance optimization expert. Analyze and optimize this ${language} code for better performance:

\`\`\`
${code}
\`\`\`

Focus on:
- Time complexity improvements
- Memory efficiency
- Unnecessary computations
- Algorithm optimization
- Built-in optimized methods

Return ONLY the optimized code, no explanation or markdown.`;

		return this.callAIAPI(prompt);
	}

	async addComments(code: string): Promise<string> {
		const prompt = `Add comprehensive, helpful comments to this code to explain what it does:

\`\`\`
${code}
\`\`\`

Guidelines:
- Explain the "why" not just the "what"
- Use clear, concise language
- Comment complex logic thoroughly
- Add function/method documentation
- Explain any non-obvious decisions

Return ONLY the commented code, no markdown or explanation.`;

		return this.callAIAPI(prompt);
	}

	private async callAIAPI(prompt: string): Promise<string> {
		if (!this.apiKey) {
			throw new Error('API key not configured. Please set your API key in settings.');
		}

		let lastError: Error | undefined;

		for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
			try {
				const response = await this.client.post(
					'https://api.openai.com/v1/chat/completions',
					{
						model: this.model,
						messages: [
							{
								role: 'user',
								content: prompt
							}
						],
						temperature: this.temperature,
						max_tokens: 2000
					},
					{
						headers: {
							'Authorization': `Bearer ${this.apiKey}`
						}
					}
				);

				const content = response.data.choices?.[0]?.message?.content;
				if (!content) {
					throw new Error('No response from AI service');
				}

				return content.trim();
			} catch (error) {
				lastError = error instanceof Error ? error : new Error(String(error));
				
				// Don't retry on authentication errors
				if (lastError.message.includes('API key') || lastError.message.includes('401')) {
					throw lastError;
				}
				
				// Don't retry on no response errors
				if (lastError.message.includes('No response')) {
					throw lastError;
				}
				
				// Check if we should retry
				if (attempt < this.retryAttempts) {
					const delay = this.getRetryDelay(attempt);
					await this.sleep(delay);
				}
			}
		}

		throw lastError || new Error('Request failed after retries');
	}
}
