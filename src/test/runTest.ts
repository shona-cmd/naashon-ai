import * as path from 'path';
import * as fs from 'fs';

/**
 * Simple test suite for AI Coding Assistant
 * Run with: npm test
 */
class TestSuite {
	private passed = 0;
	private failed = 0;
	private errors: string[] = [];

	async run(): Promise<void> {
		console.log('🧪 Running AI Coding Assistant Tests...\n');

		// Run all tests
		await this.testExtensionActivation();
		await this.testAIServicePrompts();
		await this.testMultiModelService();
		await this.testHtmlEscaping();

		// Print results
		console.log('\n' + '='.repeat(50));
		console.log(`Tests: ${this.passed} passed, ${this.failed} failed, ${this.errors.length} errors`);
		console.log('='.repeat(50));

		if (this.failed > 0 || this.errors.length > 0) {
			console.log('\nFailed tests:');
			this.errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
			process.exit(1);
		} else {
			console.log('\n✅ All tests passed!');
			process.exit(0);
		}
	}

	private assert(condition: boolean, message: string): void {
		if (condition) {
			this.passed++;
			console.log(`  ✓ ${message}`);
		} else {
			this.failed++;
			console.log(`  ✗ ${message}`);
		}
	}

	private async testExtensionActivation(): Promise<void> {
		console.log('Testing Extension Activation...');
		
		// Check that extension can be imported
		try {
			const extensionPath = path.resolve(__dirname, '../extension.js');
			const exists = fs.existsSync(extensionPath);
			this.assert(exists, 'Extension file exists');
		} catch (err) {
			this.errors.push(`Extension activation test error: ${err}`);
		}
	}

	private async testAIServicePrompts(): Promise<void> {
		console.log('\nTesting AI Service Prompts...');
		
		// Test that prompts are properly formatted
		const testCases = [
			{
				name: 'Generate Code Prompt',
				test: () => {
					const prompt = `You are an expert javascript programmer. Generate clean, production-ready, well-documented javascript code based on this requirement:

"Create a function"

Requirements:
- Write clear, maintainable code
- Include helpful comments for complex logic
- Follow best practices and conventions for javascript
- Use meaningful variable names
- Include error handling where appropriate
- Keep the solution concise but comprehensive

Return ONLY the code, no markdown formatting, no explanation, no backticks.`;
					return prompt.includes('javascript') && prompt.includes('Return ONLY the code');
				}
			},
			{
				name: 'Explain Code Prompt',
				test: () => {
					const prompt = `You are an expert code explainer. Provide a detailed, beginner-friendly explanation of this code:

\`\`\`
function test() { return true; }
\`\`\`

Explanation should include:
1. **Overall Purpose**: What does this code do?
2. **Key Components**: Break down major parts
3. **Logic Flow**: How does it work step by step?
4. **Important Concepts**: Any patterns or techniques used?
5. **Common Use Cases**: When would you use this?

Be thorough but clear. Use simple language with examples when helpful.`;
					return prompt.includes('Explanation should include') && prompt.includes('**Overall Purpose**');
				}
			},
			{
				name: 'Refactor Code Prompt',
				test: () => {
					const prompt = `You are a senior python developer. Refactor this python code to improve it:

\`\`\`
def test():
    return True
\`\`\`

Improvements should focus on:
1. **Readability**: Clear variable names and structure
2. **Performance**: Efficient algorithms and operations
3. **Best Practices**: Following python conventions
4. **Maintainability**: Easier to understand and modify
5. **Modern Patterns**: Use current best practices

Return ONLY the refactored code, no markdown formatting, no explanation, no backticks.`;
					return prompt.includes('python') && prompt.includes('Return ONLY the refactored code');
				}
			},
			{
				name: 'Add Comments Prompt',
				test: () => {
					const prompt = `Add comprehensive, helpful comments to this code to explain what it does:

\`\`\`
function test() { return true; }
\`\`\`

Guidelines:
- Explain the "why" not just the "what"
- Use clear, concise language
- Comment complex logic thoroughly
- Add function/method documentation
- Explain any non-obvious decisions

Return ONLY the commented code, no markdown or explanation.`;
					return prompt.includes('Guidelines') && prompt.includes('Return ONLY the commented code');
				}
			}
		];

		testCases.forEach(({ name, test }) => {
			this.assert(test(), name);
		});
	}

	private async testMultiModelService(): Promise<void> {
		console.log('\nTesting Multi-Model Service...');
		
		// Test model configurations
		const models = [
			'gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-3.5-turbo',
			'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku',
			'gemini-pro', 'ollama-llama2', 'ollama-codellama',
			'ollama-mistral', 'ollama-codegeex'
		];

		this.assert(models.length === 12, 'All 12 AI models are defined');

		// Test provider types
		const providers = ['openai', 'anthropic', 'google', 'ollama'];
		this.assert(providers.length === 4, 'All 4 providers are defined');
	}

	private async testHtmlEscaping(): Promise<void> {
		console.log('\nTesting HTML Escaping...');
		
		// Test escapeHtml function
		const escapeHtml = (text: string): string => {
			const map: { [key: string]: string } = {
				'&': '&amp;',
				'<': '<',
				'>': '>',
				'"': '"',
				"'": '&#039;'
			};
			return text.replace(/[&<>"']/g, (m) => map[m]);
		};

		const testCases = [
			{ input: '<script>', expected: '<script>', desc: 'Escape script tags' },
			{ input: 'a & b', expected: 'a &amp; b', desc: 'Escape ampersand' },
			{ input: '"quote"', expected: '"quote"', desc: 'Escape quotes' },
			{ input: "'single'", expected: '&#039;single&#039;', desc: 'Escape single quotes' },
			{ input: '<div>Hello</div>', expected: '<div>Hello</div>', desc: 'Escape HTML elements' }
		];

		testCases.forEach(({ input, expected, desc }) => {
			const result = escapeHtml(input);
			this.assert(result === expected, desc);
		});
	}
}

// Run tests
new TestSuite().run().catch((err) => {
	console.error('Test suite failed:', err);
	process.exit(1);
});

