import * as vscode from 'vscode';
import axios, { AxiosInstance } from 'axios';

export class AIService {
	private apiKey: string = '';
	private model: string = 'gpt-3.5-turbo';
	private temperature: number = 0.7;
	private client: AxiosInstance;

	constructor() {
		this.loadConfiguration();
		this.client = axios.create({
			timeout: 30000,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}

	private loadConfiguration(): void {
		const config = vscode.workspace.getConfiguration('ai-coding-assistant');
		this.apiKey = config.get('apiKey', '');
		this.model = config.get('model', 'gpt-3.5-turbo');
		this.temperature = config.get('temperature', 0.7);

		if (!this.apiKey) {
			vscode.window.showWarningMessage(
				'AI Coding Assistant: API key not configured. Please set your API key in settings.'
			);
		}
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

		try {
			// This example uses OpenAI API. Adapt to your chosen AI service
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
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error('Invalid API key. Please check your settings.');
				}
				throw new Error(`AI service error: ${error.message}`);
			}
			throw error;
		}
	}
}
