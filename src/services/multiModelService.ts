import * as vscode from 'vscode';
import axios, { AxiosInstance } from 'axios';

/**
 * Supported AI Models
 */
export type AIModel = 
	| 'gpt-4'
	| 'gpt-4-turbo'
	| 'gpt-4o'
	| 'gpt-3.5-turbo'
	| 'claude-3-opus'
	| 'claude-3-sonnet'
	| 'claude-3-haiku'
	| 'gemini-pro'
	| 'ollama-llama2'
	| 'ollama-codellama'
	| 'ollama-mistral'
	| 'ollama-codegeex';

/**
 * Model Provider
 */
export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'ollama';

/**
 * Model Configuration
 */
export interface ModelConfig {
	id: AIModel;
	name: string;
	provider: ModelProvider;
	contextWindow: number;
	maxTokens: number;
	description: string;
	supportsStreaming: boolean;
	costPer1kTokens: number;
}

/**
 * Message for AI API
 */
export interface ChatMessage {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

/**
 * API Response
 */
export interface AIResponse {
	content: string;
	usage: {
		promptTokens: number;
		completionTokens: number;
		totalTokens: number;
	};
	model: AIModel;
	provider: ModelProvider;
}

/**
 * Multi-Model AI Service
 * Supports GPT-4, Claude 3, Gemini, and local Ollama models
 */
export class MultiModelService {
	private apiKeys: Map<ModelProvider, string> = new Map();
	private defaultModel: AIModel = 'gpt-4';
	private defaultProvider: ModelProvider = 'openai';
	private httpClient: AxiosInstance;
	private modelConfigs!: Map<AIModel, ModelConfig>;

	constructor() {
		this.loadConfiguration();
		this.initializeModelConfigs();
		
		this.httpClient = axios.create({
			timeout: 60000,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}

	/**
	 * Initialize model configurations
	 */
	private initializeModelConfigs(): void {
		this.modelConfigs = new Map([
			// OpenAI Models
			['gpt-4', {
				id: 'gpt-4',
				name: 'GPT-4',
				provider: 'openai',
				contextWindow: 8192,
				maxTokens: 4096,
				description: 'Most capable OpenAI model',
				supportsStreaming: true,
				costPer1kTokens: 0.03
			}],
			['gpt-4-turbo', {
				id: 'gpt-4-turbo',
				name: 'GPT-4 Turbo',
				provider: 'openai',
				contextWindow: 128000,
				maxTokens: 4096,
				description: 'Faster, cheaper GPT-4 with large context',
				supportsStreaming: true,
				costPer1kTokens: 0.01
			}],
			['gpt-4o', {
				id: 'gpt-4o',
				name: 'GPT-4o',
				provider: 'openai',
				contextWindow: 128000,
				maxTokens: 4096,
				description: 'Omni model - text, vision, and audio',
				supportsStreaming: true,
				costPer1kTokens: 0.005
			}],
			['gpt-3.5-turbo', {
				id: 'gpt-3.5-turbo',
				name: 'GPT-3.5 Turbo',
				provider: 'openai',
				contextWindow: 16385,
				maxTokens: 4096,
				description: 'Fast and cost-effective',
				supportsStreaming: true,
				costPer1kTokens: 0.0005
			}],
			// Anthropic Claude 3 Models
			['claude-3-opus', {
				id: 'claude-3-opus',
				name: 'Claude 3 Opus',
				provider: 'anthropic',
				contextWindow: 200000,
				maxTokens: 4096,
				description: 'Most capable Claude model',
				supportsStreaming: true,
				costPer1kTokens: 0.015
			}],
			['claude-3-sonnet', {
				id: 'claude-3-sonnet',
				name: 'Claude 3 Sonnet',
				provider: 'anthropic',
				contextWindow: 200000,
				maxTokens: 4096,
				description: 'Balanced performance and speed',
				supportsStreaming: true,
				costPer1kTokens: 0.003
			}],
			['claude-3-haiku', {
				id: 'claude-3-haiku',
				name: 'Claude 3 Haiku',
				provider: 'anthropic',
				contextWindow: 200000,
				maxTokens: 4096,
				description: 'Fastest Claude model',
				supportsStreaming: true,
				costPer1kTokens: 0.00025
			}],
			// Google Gemini Models
			['gemini-pro', {
				id: 'gemini-pro',
				name: 'Gemini Pro',
				provider: 'google',
				contextWindow: 1000000,
				maxTokens: 2048,
				description: 'Google\'s most capable model',
				supportsStreaming: true,
				costPer1kTokens: 0.000125
			}],
			// Ollama Local Models
			['ollama-llama2', {
				id: 'ollama-llama2',
				name: 'Llama 2 (Local)',
				provider: 'ollama',
				contextWindow: 4096,
				maxTokens: 2048,
				description: 'Meta Llama 2 running locally',
				supportsStreaming: true,
				costPer1kTokens: 0
			}],
			['ollama-codellama', {
				id: 'ollama-codellama',
				name: 'CodeLlama (Local)',
				provider: 'ollama',
				contextWindow: 16384,
				maxTokens: 8192,
				description: 'Meta CodeLlama - optimized for code',
				supportsStreaming: true,
				costPer1kTokens: 0
			}],
			['ollama-mistral', {
				id: 'ollama-mistral',
				name: 'Mistral (Local)',
				provider: 'ollama',
				contextWindow: 32768,
				maxTokens: 8192,
				description: 'Mistral 7B running locally',
				supportsStreaming: true,
				costPer1kTokens: 0
			}],
			['ollama-codegeex', {
				id: 'ollama-codegeex',
				name: 'CodeGeeX (Local)',
				provider: 'ollama',
				contextWindow: 8192,
				maxTokens: 4096,
				description: 'CodeGeeX - Chinese code model',
				supportsStreaming: true,
				costPer1kTokens: 0
			}]
		]);
	}

	/**
	 * Load configuration from VS Code settings
	 */
	private loadConfiguration(): void {
		const config = vscode.workspace.getConfiguration('ai-coding-assistant');
		
		// Load API keys
		this.apiKeys.set('openai', config.get('openaiApiKey', ''));
		this.apiKeys.set('anthropic', config.get('anthropicApiKey', ''));
		this.apiKeys.set('google', config.get('googleApiKey', ''));
		this.apiKeys.set('ollama', config.get('ollamaBaseUrl', 'http://localhost:11434'));
		
		// Load defaults
		const defaultModel = config.get<string>('defaultModel', 'gpt-4');
		if (this.modelConfigs.has(defaultModel as AIModel)) {
			this.defaultModel = defaultModel as AIModel;
			const modelConfig = this.modelConfigs.get(this.defaultModel);
			if (modelConfig) {
				this.defaultProvider = modelConfig.provider;
			}
		}
	}

	/**
	 * Refresh configuration
	 */
	refreshConfiguration(): void {
		this.loadConfiguration();
	}

	/**
	 * Get all available models
	 */
	getAvailableModels(): ModelConfig[] {
		return Array.from(this.modelConfigs.values());
	}

	/**
	 * Get models by provider
	 */
	getModelsByProvider(provider: ModelProvider): ModelConfig[] {
		return Array.from(this.modelConfigs.values()).filter(
			(model) => model.provider === provider
		);
	}

	/**
	 * Get model configuration
	 */
	getModelConfig(model: AIModel): ModelConfig | undefined {
		return this.modelConfigs.get(model);
	}

	/**
	 * Check if API key is configured
	 */
	isModelConfigured(model: AIModel): boolean {
		const config = this.modelConfigs.get(model);
		if (!config) {return false;}
		
		if (config.provider === 'ollama') {
			// Ollama just needs the base URL
			return true;
		}
		
		return !!this.apiKeys.get(config.provider);
	}

	/**
	 * Get missing API keys
	 */
	getMissingApiKeys(): ModelProvider[] {
		const missing: ModelProvider[] = [];
		
		if (!this.apiKeys.get('openai')) {
			missing.push('openai');
		}
		if (!this.apiKeys.get('anthropic')) {
			missing.push('anthropic');
		}
		if (!this.apiKeys.get('google')) {
			missing.push('google');
		}
		
		return missing;
	}

	/**
	 * Generate code with specified model
	 */
	async generateCode(
		description: string,
		language: string,
		model?: AIModel
	): Promise<AIResponse> {
		const targetModel = model || this.defaultModel;
		const config = this.modelConfigs.get(targetModel);
		
		if (!config) {
			throw new Error(`Unknown model: ${targetModel}`);
		}

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

		return this.callAPI(config.provider, targetModel, prompt, []);
	}

	/**
	 * Explain code with specified model
	 */
	async explainCode(code: string, model?: AIModel): Promise<AIResponse> {
		const targetModel = model || this.defaultModel;
		const config = this.modelConfigs.get(targetModel);
		
		if (!config) {
			throw new Error(`Unknown model: ${targetModel}`);
		}

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

		return this.callAPI(config.provider, targetModel, prompt, []);
	}

	/**
	 * Refactor code with specified model
	 */
	async refactorCode(
		code: string,
		language: string,
		model?: AIModel
	): Promise<AIResponse> {
		const targetModel = model || this.defaultModel;
		const config = this.modelConfigs.get(targetModel);
		
		if (!config) {
			throw new Error(`Unknown model: ${targetModel}`);
		}

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

		return this.callAPI(config.provider, targetModel, prompt, []);
	}

	/**
	 * Optimize code with specified model
	 */
	async optimizePerformance(
		code: string,
		language: string,
		model?: AIModel
	): Promise<AIResponse> {
		const targetModel = model || this.defaultModel;
		const config = this.modelConfigs.get(targetModel);
		
		if (!config) {
			throw new Error(`Unknown model: ${targetModel}`);
		}

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

		return this.callAPI(config.provider, targetModel, prompt, []);
	}

	/**
	 * Add comments with specified model
	 */
	async addComments(code: string, model?: AIModel): Promise<AIResponse> {
		const targetModel = model || this.defaultModel;
		const config = this.modelConfigs.get(targetModel);
		
		if (!config) {
			throw new Error(`Unknown model: ${targetModel}`);
		}

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

		return this.callAPI(config.provider, targetModel, prompt, []);
	}

	/**
	 * Chat completion with context
	 */
	async chat(
		messages: ChatMessage[],
		model?: AIModel
	): Promise<AIResponse> {
		const targetModel = model || this.defaultModel;
		const config = this.modelConfigs.get(targetModel);
		
		if (!config) {
			throw new Error(`Unknown model: ${targetModel}`);
		}

		const lastMessage = messages[messages.length - 1];
		const prompt = lastMessage?.content || '';
		const contextMessages = messages.slice(0, -1);

		return this.callAPI(config.provider, targetModel, prompt, contextMessages);
	}

	/**
	 * Call the appropriate API based on provider
	 */
	private async callAPI(
		provider: ModelProvider,
		model: AIModel,
		prompt: string,
		contextMessages: ChatMessage[]
	): Promise<AIResponse> {
		switch (provider) {
			case 'openai':
				return this.callOpenAI(model, prompt, contextMessages);
			case 'anthropic':
				return this.callAnthropic(model, prompt, contextMessages);
			case 'google':
				return this.callGoogle(model, prompt, contextMessages);
			case 'ollama':
				return this.callOllama(model, prompt, contextMessages);
			default:
				throw new Error(`Unsupported provider: ${provider}`);
		}
	}

	/**
	 * Call OpenAI API
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private async callOpenAI(
		model: AIModel,
		prompt: string,
		_contextMessages: ChatMessage[]
	): Promise<AIResponse> {
		const apiKey = this.apiKeys.get('openai');
		if (!apiKey) {
			throw new Error('OpenAI API key not configured. Please set it in settings.');
		}

		const config = this.modelConfigs.get(model)!;
		
		const messages = [
			{
				role: 'user',
				content: prompt
			}
		];

		try {
			const response = await this.httpClient.post(
				'https://api.openai.com/v1/chat/completions',
				{
					model: model === 'gpt-4-turbo' ? 'gpt-4-turbo-preview' : 
						   model === 'gpt-4o' ? 'gpt-4o' : model,
					messages,
					temperature: 0.7,
					max_tokens: config.maxTokens
				},
				{
					headers: {
						Authorization: `Bearer ${apiKey}`
					}
				}
			);

			const content = response.data.choices?.[0]?.message?.content;
			if (!content) {
				throw new Error('No response from OpenAI');
			}

			return {
				content: content.trim(),
				usage: {
					promptTokens: response.data.usage?.prompt_tokens || 0,
					completionTokens: response.data.usage?.completion_tokens || 0,
					totalTokens: response.data.usage?.total_tokens || 0
				},
				model,
				provider: 'openai'
			};
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error('Invalid OpenAI API key. Please check your settings.');
				}
				throw new Error(`OpenAI API error: ${error.message}`);
			}
			throw error;
		}
	}

	/**
	 * Call Anthropic Claude API
	 */
	private async callAnthropic(
		model: AIModel,
		prompt: string,
		contextMessages: ChatMessage[]
	): Promise<AIResponse> {
		const apiKey = this.apiKeys.get('anthropic');
		if (!apiKey) {
			throw new Error('Anthropic API key not configured. Please set it in settings.');
		}

		const config = this.modelConfigs.get(model)!;
		
		// Convert messages to Claude format
		const messages = [
			...(contextMessages.map(m => ({
				role: m.role === 'assistant' ? 'assistant' : 'user',
				content: m.content
			}))),
			{ role: 'user', content: prompt }
		];

		try {
			const response = await this.httpClient.post(
				'https://api.anthropic.com/v1/messages',
				{
					model: model === 'claude-3-opus' ? 'claude-3-opus-20240229' :
						   model === 'claude-3-sonnet' ? 'claude-3-sonnet-20240229' :
						   'claude-3-haiku-20240307',
					messages,
					max_tokens: config.maxTokens,
					temperature: 0.7
				},
				{
					headers: {
						'x-api-key': apiKey,
						'anthropic-version': '2023-06-01',
						'Content-Type': 'application/json'
					}
				}
			);

			const content = response.data.content?.[0]?.text;
			if (!content) {
				throw new Error('No response from Anthropic');
			}

			return {
				content: content.trim(),
				usage: {
					promptTokens: response.data.usage?.input_tokens || 0,
					completionTokens: response.data.usage?.output_tokens || 0,
					totalTokens: (response.data.usage?.input_tokens || 0) + (response.data.usage?.output_tokens || 0)
				},
				model,
				provider: 'anthropic'
			};
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error('Invalid Anthropic API key. Please check your settings.');
				}
				throw new Error(`Anthropic API error: ${error.message}`);
			}
			throw error;
		}
	}

	/**
	 * Call Google Gemini API
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private async callGoogle(
		model: AIModel,
		prompt: string,
		_contextMessages: ChatMessage[]
	): Promise<AIResponse> {
		const apiKey = this.apiKeys.get('google');
		if (!apiKey) {
			throw new Error('Google API key not configured. Please set it in settings.');
		}

		try {
			const response = await this.httpClient.post(
				`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
				{
					contents: [
						{
							parts: [
								{
									text: prompt
								}
							]
						}
					],
					generationConfig: {
						temperature: 0.7,
						maxOutputTokens: 2048
					}
				},
				{
					headers: {
						'x-goog-api-key': apiKey
					},
					params: {
						key: apiKey
					}
				}
			);

			const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
			if (!content) {
				throw new Error('No response from Google');
			}

			return {
				content: content.trim(),
				usage: {
					promptTokens: 0,
					completionTokens: 0,
					totalTokens: 0
				},
				model,
				provider: 'google'
			};
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					throw new Error('Invalid Google API key. Please check your settings.');
				}
				throw new Error(`Google API error: ${error.message}`);
			}
			throw error;
		}
	}

	/**
	 * Call Ollama local API
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private async callOllama(
		model: AIModel,
		prompt: string,
		_contextMessages: ChatMessage[]
	): Promise<AIResponse> {
		const baseUrl = this.apiKeys.get('ollama') || 'http://localhost:11434';
		const ollamaModel = model.replace('ollama-', '');

		try {
			const response = await this.httpClient.post(
				`${baseUrl}/api/generate`,
				{
					model: ollamaModel,
					prompt,
					stream: false,
					options: {
						temperature: 0.7,
						num_predict: 4096
					}
				}
			);

			const content = response.data.response;
			if (!content) {
				throw new Error('No response from Ollama');
			}

			return {
				content: content.trim(),
				usage: {
					promptTokens: 0,
					completionTokens: 0,
					totalTokens: 0
				},
				model,
				provider: 'ollama'
			};
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				if (error.code === 'ECONNREFUSED') {
					throw new Error(`Ollama is not running. Please start Ollama and try again.`);
				}
				throw new Error(`Ollama error: ${error.message}`);
			}
			throw error;
		}
	}

	/**
	 * Calculate cost for response
	 */
	calculateCost(model: AIModel, tokens: number): number {
		const config = this.modelConfigs.get(model);
		if (!config) {return 0;}
		
		return (tokens / 1000) * config.costPer1kTokens;
	}

	/**
	 * Get provider display name
	 */
	getProviderName(provider: ModelProvider): string {
		const names: Record<ModelProvider, string> = {
			openai: 'OpenAI',
			anthropic: 'Anthropic',
			google: 'Google',
			ollama: 'Ollama (Local)'
		};
		return names[provider];
	}

	/**
	 * Show model picker
	 */
	async showModelPicker(): Promise<AIModel | undefined> {
		const models = this.getAvailableModels();
		
		const quickPick = vscode.window.createQuickPick<vscode.QuickPickItem & { modelId?: AIModel }>();
		quickPick.title = 'Select AI Model';
		quickPick.placeholder = 'Choose a model...';
		quickPick.items = models.map((model) => ({
			label: model.name,
			description: `${this.getProviderName(model.provider)} - ${model.description}`,
			detail: this.isModelConfigured(model.id) ? '✓ Configured' : '⚠ Not configured',
			modelId: model.id
		}));
		
		return new Promise((resolve) => {
			quickPick.onDidChangeSelection((selection) => {
				if (selection[0] && selection[0].modelId) {
					resolve(selection[0].modelId);
					quickPick.dispose();
				}
			});
			
			quickPick.onDidHide(() => {
				resolve(undefined);
				quickPick.dispose();
			});
			
			quickPick.show();
		});
	}
}

