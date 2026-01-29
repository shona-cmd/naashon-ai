import * as vscode from 'vscode';
import { MultiModelService, AIModel } from './multiModelService';

/**
 * Test Framework Support
 */
export type TestFramework = 
    | 'jest'
    | 'mocha'
    | 'pytest'
    | 'unittest'
    | 'junit'
    | 'vitest'
    | 'go-test'
    | 'ruby-minitest'
    | 'phpunit';

/**
 * Test Configuration
 */
export interface TestConfig {
    framework: TestFramework;
    fileName: string;
    testPattern: string;
    mockFramework?: string;
}

/**
 * Generated Test
 */
export interface GeneratedTest {
    fileName: string;
    content: string;
    framework: TestFramework;
    testCount: number;
    coverageAreas: string[];
}

/**
 * Test Case
 */
export interface TestCase {
    name: string;
    description: string;
    input: string;
    expectedOutput: string;
    edgeCases: string[];
}

/**
 * Test Generator Service
 * Auto-generates unit tests from code using AI
 */
export class TestGeneratorService {
    private multiModelService: MultiModelService;
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.multiModelService = new MultiModelService();
    }

    /**
     * Generate tests for selected code
     */
    async generateTests(
        code: string,
        language: string,
        framework?: TestFramework
    ): Promise<GeneratedTest> {
        const selectedFramework = framework || await this.detectFramework(language);
        
        const prompt = this.buildTestGenerationPrompt(code, language, selectedFramework);
        
        const response = await this.multiModelService.chat([
            {
                role: 'user',
                content: prompt
            }
        ]);

        const testContent = this.extractTestCode(response.content);
        const testCases = this.extractTestCases(response.content);

        const fileName = this.suggestTestFileName(language, selectedFramework);
        
        return {
            fileName,
            content: testContent,
            framework: selectedFramework,
            testCount: testCases.length,
            coverageAreas: this.identifyCoverageAreas(testCases)
        };
    }

    /**
     * Generate comprehensive test suite
     */
    async generateComprehensiveTests(
        code: string,
        language: string
    ): Promise<GeneratedTest[]> {
        const framework = await this.detectFramework(language);
        
        // Generate multiple types of tests
        const testTypes: TestFramework[] = framework === 'jest' 
            ? ['jest', 'vitest']
            : framework === 'pytest'
            ? ['pytest', 'unittest']
            : [framework];

        const tests: GeneratedTest[] = [];

        for (const fw of testTypes) {
            const test = await this.generateTests(code, language, fw);
            tests.push(test);
        }

        return tests;
    }

    /**
     * Generate edge case tests
     */
    async generateEdgeCaseTests(
        code: string,
        language: string
    ): Promise<GeneratedTest> {
        const framework = await this.detectFramework(language);
        
        const prompt = `You are an expert test developer. Generate comprehensive edge case tests for this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Requirements:
1. Test all edge cases and boundary conditions
2. Include null/undefined checks
3. Test empty inputs
4. Test maximum/minimum values
5. Test error conditions
6. Test invalid inputs
7. Include performance edge cases

Generate tests using ${this.getFrameworkName(framework)} with proper assertions.

Return ONLY the test code, no markdown formatting, no explanation.`;

        const response = await this.multiModelService.chat([
            { role: 'user', content: prompt }
        ]);

        const testContent = this.extractTestCode(response.content);
        const fileName = this.suggestTestFileName(language, framework, 'edge-cases');

        return {
            fileName,
            content: testContent,
            framework,
            testCount: this.countTests(testContent, framework),
            coverageAreas: ['Edge Cases', 'Boundary Conditions', 'Error Handling']
        };
    }

    /**
     * Generate mock configuration
     */
    async generateMockConfig(
        code: string,
        language: string
    ): Promise<string> {
        const framework = await this.detectFramework(language);
        
        const prompt = `Analyze this ${language} code and suggest appropriate mock configurations:

\`\`\`${language}
${code}
\`\`\`

For ${this.getFrameworkName(framework)}, provide:
1. Mocks needed for external dependencies
2. Stub configurations
3. Spy configurations
4. Fixture setups

Return ONLY mock code, no markdown.`;

        const response = await this.multiModelService.chat([
            { role: 'user', content: prompt }
        ]);

        return this.extractTestCode(response.content);
    }

    /**
     * Analyze test coverage gaps
     */
    async analyzeCoverageGaps(
        code: string,
        existingTests: string
    ): Promise<string> {
        const prompt = `Analyze test coverage gaps for this code:

CODE:
\`\`\`
${code}
\`\`\`

EXISTING TESTS:
\`\`\`
${existingTests}
\`\`\`

Identify:
1. Missing test scenarios
2. Uncovered edge cases
3. Potential bugs not tested
4. Suggestions for additional tests

Be specific and actionable.`;

        const response = await this.multiModelService.chat([
            { role: 'user', content: prompt }
        ]);

        return response.content;
    }

    /**
     * Generate property-based tests
     */
    async generatePropertyTests(
        code: string,
        language: string
    ): Promise<GeneratedTest> {
        const framework = await this.detectFramework(language);
        
        const prompt = `Generate property-based tests for this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Property-based testing should verify:
1. Invariants (properties that should always be true)
2. Equivalence partitioning
3. Input/output relationships
4. Stateful property testing where applicable

Use ${this.getFrameworkName(framework)} property testing features.

Return ONLY test code.`;

        const response = await this.multiModelService.chat([
            { role: 'user', content: prompt }
        ]);

        const testContent = this.extractTestCode(response.content);
        const fileName = this.suggestTestFileName(language, framework, 'property');

        return {
            fileName,
            content: testContent,
            framework,
            testCount: this.countTests(testContent, framework),
            coverageAreas: ['Property-Based', 'Invariants', 'Equivalence']
        };
    }

    /**
     * Build test generation prompt
     */
    private buildTestGenerationPrompt(
        code: string,
        language: string,
        framework: TestFramework
    ): string {
        return `You are an expert ${language} test developer. Generate comprehensive unit tests for this code:

\`\`\`${language}
${code}
\`\`\`

Requirements:
1. Use ${this.getFrameworkName(framework)} framework
2. Follow best practices for ${framework} testing
3. Include both positive and negative test cases
4. Cover edge cases and boundary conditions
5. Use proper assertions and matchers
6. Make tests readable and maintainable
7. Include descriptive test names
8. Use proper setup/teardown if needed

Test categories to include:
- Happy path scenarios
- Error handling
- Edge cases
- Boundary conditions
- Type checking

Return ONLY the complete test code file, no markdown formatting, no backticks, no explanations.`;
    }

    /**
     * Detect appropriate test framework
     */
    private async detectFramework(language: string): Promise<TestFramework> {
        // Check workspace for package.json or requirements
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            const wsPath = workspaceFolders[0].uri.fsPath;
            
            // Check for package.json
            try {
                const pkgPath = require('path').join(wsPath, 'package.json');
                if (require('fs').existsSync(pkgPath)) {
                    const pkg = JSON.parse(require('fs').readFileSync(pkgPath, 'utf-8'));
                    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
                    
                    if (deps['vitest']) {return 'vitest';}
                    if (deps['jest']) {return 'jest';}
                    if (deps['mocha']) {return 'mocha';}
                }
            } catch {
                // Ignore
            }

            // Check for pytest
            try {
                const reqPath = require('path').join(wsPath, 'requirements.txt');
                if (require('fs').existsSync(reqPath)) {
                    const req = require('fs').readFileSync(reqPath, 'utf-8');
                    if (req.includes('pytest')) {return 'pytest';}
                }
            } catch {
                // Ignore
            }
        }

        // Default framework based on language
        const defaults: Record<string, TestFramework> = {
            'typescript': 'jest',
            'javascript': 'jest',
            'python': 'pytest',
            'java': 'junit',
            'go': 'go-test',
            'rust': 'junit', // Would use built-in test framework
            'ruby': 'ruby-minitest',
            'php': 'phpunit'
        };

        return defaults[language] || 'jest';
    }

    /**
     * Get framework display name
     */
    private getFrameworkName(framework: TestFramework): string {
        const names: Record<TestFramework, string> = {
            'jest': 'Jest',
            'mocha': 'Mocha',
            'pytest': 'pytest',
            'unittest': 'unittest',
            'junit': 'JUnit',
            'vitest': 'Vitest',
            'go-test': 'Go testing',
            'ruby-minitest': 'Minitest',
            'phpunit': 'PHPUnit'
        };
        return names[framework] || framework;
    }

    /**
     * Suggest test file name
     */
    private suggestTestFileName(
        language: string,
        framework: TestFramework,
        suffix?: string
    ): string {
        const patterns: Record<TestFramework, string> = {
            'jest': suffix ? `.test.${suffix}.ts` : '.test.ts',
            'mocha': suffix ? `.test.${suffix}.ts` : '.test.ts',
            'pytest': suffix ? `test_${suffix}.py` : 'test_.py',
            'unittest': suffix ? `test_${suffix}.py` : 'test_.py',
            'junit': '.java',
            'vitest': suffix ? `.test.${suffix}.ts` : '.test.ts',
            'go-test': '_test.go',
            'ruby-minitest': suffix ? `test_${suffix}_test.rb` : 'test_*.rb',
            'phpunit': suffix ? `${suffix}Test.php` : '*Test.php'
        };

        const pattern = patterns[framework] || '.test.ts';
        return pattern.replace('*', 'unit').replace('_', 'unit');
    }

    /**
     * Extract test code from response
     */
    private extractTestCode(response: string): string {
        // Remove markdown code blocks
        const code = response
            .replace(/```[\w]*\n?/g, '')
            .replace(/```/g, '')
            .trim();

        // Remove any explanatory text before/after code
        const lines = code.split('\n');
        const filteredLines: string[] = [];

        for (const line of lines) {
            const trimmed = line.trim();
            // Skip lines that look like explanations
            if (!trimmed.match(/^(Here's|Below|The|In|To|For|Use)/i)) {
                filteredLines.push(line);
            }
        }

        return filteredLines.join('\n').trim();
    }

    /**
     * Extract test cases from response
     */
    private extractTestCases(response: string): TestCase[] {
        const cases: TestCase[] = [];
        
        // Simple parsing - look for test patterns
        const testPatterns = [
            /test\s*[(:]?\s*["']([^"']+)["']/gi,
            /it\s*[(:]?\s*["']([^"']+)["']/gi,
            /def\s+(test_\w+)/gi
        ];

        for (const pattern of testPatterns) {
            let match;
            while ((match = pattern.exec(response)) !== null) {
                cases.push({
                    name: match[1],
                    description: '',
                    input: '',
                    expectedOutput: '',
                    edgeCases: []
                });
            }
        }

        return cases;
    }

    /**
     * Count number of tests in test file
     */
    private countTests(content: string, framework: TestFramework): number {
        const patterns: Record<TestFramework, RegExp> = {
            'jest': /^\s*(it|test|describe)\s*[(:]/gm,
            'mocha': /^\s*(it|test|describe)\s*[(:]/gm,
            'pytest': /^\s*def\s+(test_\w+)/gm,
            'unittest': /^\s*def\s+(test_\w+)/gm,
            'junit': /@Test/gm,
            'vitest': /^\s*(it|test|describe)\s*[(:]/gm,
            'go-test': /func\s+(Test\w+)/gm,
            'ruby-minitest': /def\s+(test_\w+)/gm,
            'phpunit': /public\s+function\s+(test\w+)/gi
        };

        const pattern = patterns[framework] || /test/gi;
        const matches = content.match(pattern);
        return matches ? matches.length : 0;
    }

    /**
     * Identify coverage areas from test cases
     */
    private identifyCoverageAreas(cases: TestCase[]): string[] {
        const areas = new Set<string>();
        
        for (const test of cases) {
            const name = test.name.toLowerCase();
            
            if (name.includes('null') || name.includes('empty') || name.includes('undefined')) {
                areas.add('Null/Empty Handling');
            }
            if (name.includes('error') || name.includes('exception') || name.includes('invalid')) {
                areas.add('Error Handling');
            }
            if (name.includes('boundary') || name.includes('edge') || name.includes('min') || name.includes('max')) {
                areas.add('Boundary Conditions');
            }
            if (name.includes('type') || name.includes('input')) {
                areas.add('Input Validation');
            }
            if (name.includes('happy') || name.includes('success') || name.includes('valid')) {
                areas.add('Happy Path');
            }
            if (name.includes('performance') || name.includes('async') || name.includes('timeout')) {
                areas.add('Performance');
            }
        }

        return Array.from(areas);
    }

    /**
     * Get supported frameworks
     */
    getSupportedFrameworks(): TestFramework[] {
        return [
            'jest',
            'mocha',
            'pytest',
            'unittest',
            'junit',
            'vitest',
            'go-test',
            'ruby-minitest',
            'phpunit'
        ];
    }

    /**
     * Dispose
     */
    dispose(): void {
        // Cleanup if needed
    }
}

