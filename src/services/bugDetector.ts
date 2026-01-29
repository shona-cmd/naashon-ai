import * as vscode from 'vscode';
import { MultiModelService } from './multiModelService';

/**
 * Bug Category
 */
export type BugCategory = 
    | 'syntax'
    | 'logic'
    | 'performance'
    | 'security'
    | 'memory'
    | 'concurrency'
    | 'type'
    | 'resource'
    | 'error-handling';

/**
 * Bug Severity
 */
export type BugSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

/**
 * Detected Bug
 */
export interface DetectedBug {
    id: string;
    category: BugCategory;
    severity: BugSeverity;
    title: string;
    description: string;
    lineNumber: number;
    endLineNumber: number;
    codeSnippet: string;
    fix: string;
    fixExplanation: string;
    cwe?: string; // Common Weakness Enumeration
    references?: string[];
}

/**
 * Bug Detection Result
 */
export interface BugDetectionResult {
    bugs: DetectedBug[];
    score: number;
    summary: string;
    securityScore: number;
    performanceScore: number;
    maintainabilityScore: number;
}

/**
 * Security Vulnerability
 */
export interface SecurityVulnerability {
    type: string;
    severity: BugSeverity;
    description: string;
    lineNumber: number;
    fix: string;
    cwe: string;
    owasp?: string;
}

/**
 * Bug Detector Service
 * Detects bugs, security vulnerabilities, and code quality issues
 */
export class BugDetectorService {
    private multiModelService: MultiModelService;
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.multiModelService = new MultiModelService();
    }

    /**
     * Analyze code for bugs
     */
    async analyzeCode(code: string, language: string): Promise<BugDetectionResult> {
        const prompt = `You are a senior software engineer and bug hunter. Analyze this ${language} code for bugs, issues, and vulnerabilities:

\`\`\`${language}
${code}
\`\`\`

Perform a comprehensive analysis including:
1. **Logic Bugs** - Incorrect behavior, edge cases, off-by-one errors
2. **Performance Issues** - Inefficient algorithms, memory leaks, unnecessary computations
3. **Security Vulnerabilities** - SQL injection, XSS, auth issues, crypto weaknesses
4. **Error Handling** - Missing try-catch, unhandled exceptions, silent failures
5. **Resource Leaks** - File handles, connections, memory not released
6. **Concurrency Issues** - Race conditions, deadlocks, thread safety
7. **Type Issues** - Type coercion, null/undefined checks
8. **Code Smells** - Duplication, long methods, complex logic

Return your analysis in this EXACT format:

## SCORE: [1-10]

## SUMMARY
[Brief overview of overall code quality]

## BUGS
1. [Category:Logic] Line [X]: [Brief title]
   - Description: [What the bug is]
   - Code: \`[problematic code]\`
   - Fix: \`[fixed code]\`
   - Explanation: [Why this fixes it]

2. [Category:Security] Line [X]: [Brief title]
   - Description: [What the vulnerability is]
   - Code: \`[vulnerable code]\`
   - Fix: \`[secure code]\`
   - CWE: [CWE number if applicable]

3. [Continue for all issues...]

## SECURITY_SCORE: [1-10]
## PERFORMANCE_SCORE: [1-10]
## MAINTAINABILITY_SCORE: [1-10]

Be thorough and specific. If no bugs found, state "No bugs detected".`;

        const response = await this.multiModelService.chat([
            { role: 'user', content: prompt }
        ]);

        return this.parseBugAnalysis(response.content, code);
    }

    /**
     * Detect security vulnerabilities
     */
    async detectSecurityVulnerabilities(code: string, language: string): Promise<SecurityVulnerability[]> {
        const prompt = `You are a security expert. Perform a security audit of this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Check for:
1. **Injection Attacks** - SQL injection, Command injection, LDAP injection
2. **XSS** - Cross-site scripting vulnerabilities
3. **Authentication Issues** - Weak passwords, session management
4. **Authorization Problems** - IDOR, privilege escalation
5. **Crypto Weaknesses** - Weak algorithms, hardcoded secrets
6. **Data Exposure** - Sensitive data in logs, insecure storage
7. **Path Traversal** - File access vulnerabilities
8. **Deserialization** - Unsafe deserialization
9. **API Security** - Missing rate limiting, insecure endpoints

For each vulnerability found, return:
- Type: [vulnerability type]
- Severity: [critical/high/medium/low]
- Description: [what the issue is]
- Line: [line number]
- Fix: [secure code]
- CWE: [Common Weakness Enumeration number]
- OWASP: [OWASP category if applicable]

If no vulnerabilities, return "No security vulnerabilities detected".`;

        const response = await this.multiModelService.chat([
            { role: 'user', content: prompt }
        ]);

        return this.parseSecurityVulnerabilities(response.content, code);
    }

    /**
     * Auto-fix detected bugs
     */
    async autoFixBugs(
        code: string,
        language: string,
        bugs: DetectedBug[]
    ): Promise<string> {
        const bugDescriptions = bugs
            .map(b => `- Line ${b.lineNumber}: ${b.title} - ${b.description}`)
            .join('\n');

        const prompt = `You are an expert developer. Fix all these bugs in the ${language} code:

ORIGINAL CODE:
\`\`\`${language}
${code}
\`\`\`

BUGS TO FIX:
${bugDescriptions}

Apply all fixes to the code. Return the complete fixed code with all issues resolved.
Keep the same structure and only change what's necessary to fix the bugs.
Return ONLY the fixed code, no markdown, no explanation.`;

        const response = await this.multiModelService.chat([
            { role: 'user', content: prompt }
        ]);

        return this.extractCode(response.content);
    }

    /**
     * Fix specific line
     */
    async fixLine(
        code: string,
        language: string,
        lineNumber: number,
        issue: string
    ): Promise<string> {
        const lines = code.split('\n');
        const targetLine = lines[lineNumber - 1];

        const prompt = `Fix this ${language} code at line ${lineNumber}:

Line ${lineNumber}: \`${targetLine}\`
Issue: ${issue}

Provide the fixed line only, no markdown.`;

        const response = await this.multiModelService.chat([
            { role: 'user', content: prompt }
        ]);

        const fixedLine = response.content.trim();
        lines[lineNumber - 1] = fixedLine;
        
        return lines.join('\n');
    }

    /**
     * Check for common bug patterns
     */
    async checkBugPatterns(code: string, language: string): Promise<DetectedBug[]> {
        const patterns = this.getBugPatterns(language);
        const bugs: DetectedBug[] = [];
        const lines = code.split('\n');

        // Check for common patterns using regex
        for (const pattern of patterns) {
            const regex = new RegExp(pattern.regex, 'gi');
            let match;
            
            while ((match = regex.exec(code)) !== null) {
                const lineNumber = code.substring(0, match.index).split('\n').length;
                
                bugs.push({
                    id: this.generateBugId(),
                    category: pattern.category,
                    severity: pattern.severity,
                    title: pattern.title,
                    description: pattern.description,
                    lineNumber,
                    endLineNumber: lineNumber,
                    codeSnippet: match[0],
                    fix: pattern.fix || '',
                    fixExplanation: pattern.fixExplanation || '',
                    cwe: pattern.cwe
                });
            }
        }

        return bugs;
    }

    /**
     * Get bug patterns for language
     */
    private getBugPatterns(language: string): Array<{
        regex: string;
        category: BugCategory;
        severity: BugSeverity;
        title: string;
        description: string;
        fix?: string;
        fixExplanation?: string;
        cwe?: string;
    }> {
        const commonPatterns = [
            {
                regex: 'console\\.(log|debug|info)',
                category: 'error-handling' as BugCategory,
                severity: 'low' as BugSeverity,
                title: 'Debug code in production',
                description: 'Console statements should be removed or replaced with proper logging',
                cwe: 'CWE-489'
            },
            {
                regex: 'eval\\s*\\(',
                category: 'security' as BugCategory,
                severity: 'critical' as BugSeverity,
                title: 'Use of eval()',
                description: 'eval() is dangerous and can execute arbitrary code',
                fix: 'Use safer alternatives like JSON.parse()',
                fixExplanation: 'eval() can execute any code, making it a security risk',
                cwe: 'CWE-95'
            },
            {
                regex: '\\.innerHTML\\s*=',
                category: 'security' as BugCategory,
                severity: 'medium' as BugSeverity,
                title: 'Potential XSS via innerHTML',
                description: 'Using innerHTML with user input can lead to XSS attacks',
                fix: 'Use textContent or sanitize input',
                cwe: 'CWE-79'
            },
            {
                regex: 'Math\\.random\\(\\)',
                category: 'security' as BugCategory,
                severity: 'medium' as BugSeverity,
                title: 'Weak random number generation',
                description: 'Math.random() is not cryptographically secure',
                fix: 'Use crypto.getRandomValues() or a proper RNG',
                cwe: 'CWE-338'
            }
        ];

        const languageSpecificPatterns: Record<string, Array<{
            regex: string;
            category: BugCategory;
            severity: BugSeverity;
            title: string;
            description: string;
            fix?: string;
            fixExplanation?: string;
            cwe?: string;
        }>> = {
            'typescript': [
                {
                    regex: 'any\\s*',
                    category: 'type' as BugCategory,
                    severity: 'medium' as BugSeverity,
                    title: 'Use of any type',
                    description: 'Avoid using any type as it bypasses TypeScript checking',
                    fix: 'Use specific types or unknown'
                },
                {
                    regex: '==(?!=)',
                    category: 'logic' as BugCategory,
                    severity: 'medium' as BugSeverity,
                    title: 'Loose equality comparison',
                    description: 'Use === instead of == to avoid type coercion',
                    fix: 'Use === for strict equality'
                }
            ],
            'javascript': [
                {
                    regex: '==(?!=)',
                    category: 'logic' as BugCategory,
                    severity: 'medium' as BugSeverity,
                    title: 'Loose equality comparison',
                    description: 'Use === instead of == to avoid type coercion',
                    fix: 'Use === for strict equality'
                },
                {
                    regex: 'var\\s+',
                    category: 'performance' as BugCategory,
                    severity: 'low' as BugSeverity,
                    title: 'Use of var instead of let/const',
                    description: 'var has function scope, use let or const instead',
                    fix: 'Replace var with let or const'
                }
            ],
            'python': [
                {
                    regex: 'except:\\s*$',
                    category: 'error-handling' as BugCategory,
                    severity: 'high' as BugSeverity,
                    title: 'Bare except clause',
                    description: 'Catching all exceptions can hide bugs',
                    fix: 'Catch specific exceptions'
                },
                {
                    regex: 'print\\s*\\(',
                    category: 'error-handling' as BugCategory,
                    severity: 'low' as BugSeverity,
                    title: 'Debug print statement',
                    description: 'Remove debug print statements or use logging',
                    cwe: 'CWE-489'
                }
            ],
            'java': [
                {
                    regex: 'catch\\s*\\(\\s*Exception\\s*\\)',
                    category: 'error-handling' as BugCategory,
                    severity: 'medium' as BugSeverity,
                    title: 'Catching generic Exception',
                    description: 'Catch specific exceptions instead of Exception',
                    fix: 'Catch specific exception types'
                }
            ]
        };

        return [
            ...commonPatterns,
            ...(languageSpecificPatterns[language] || [])
        ];
    }

    /**
     * Parse bug analysis response
     */
    private parseBugAnalysis(response: string, code: string): BugDetectionResult {
        const bugs: DetectedBug[] = [];

        // Extract score
        const scoreMatch = response.match(/## SCORE:\s*(\d+)/i);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : 5;

        // Extract summary
        const summaryMatch = response.match(/## SUMMARY\s*([\s\S]*?)(?=## BUGS|$)/i);
        const summary = summaryMatch ? summaryMatch[1].trim() : 'No summary provided';

        // Extract security score
        const securityMatch = response.match(/## SECURITY_SCORE:\s*(\d+)/i);
        const securityScore = securityMatch ? parseInt(securityMatch[1]) : 5;

        // Extract performance score
        const perfMatch = response.match(/## PERFORMANCE_SCORE:\s*(\d+)/i);
        const performanceScore = perfMatch ? parseInt(perfMatch[1]) : 5;

        // Extract maintainability score
        const maintMatch = response.match(/## MAINTAINABILITY_SCORE:\s*(\d+)/i);
        const maintainabilityScore = maintMatch ? parseInt(maintMatch[1]) : 5;

        // Parse individual bugs
        const bugSection = response.match(/## BUGS\s*([\s\S]*?)(?=## SECURITY_SCORE|## PERFORMANCE_SCORE|## MAINTAINABILITY_SCORE|$)/i);
        if (bugSection) {
            const bugText = bugSection[1];
            const bugMatches = bugText.matchAll(/(\d+)\.\s*\[Category:(\w+)\]\s*Line\s*(\d+):\s*([^\n-]+)[\s-]*Description:\s*([^\n-]+)[\s-]*Code:\s*`([^`]+)`[\s-]*Fix:\s*`([^`]+)`[\s-]*Explanation:\s*([^\n]+)/g);
            
            for (const match of bugMatches) {
                bugs.push({
                    id: this.generateBugId(),
                    category: this.parseCategory(match[2]),
                    severity: this.inferSeverity(match[2], match[4]),
                    title: match[4].trim(),
                    description: match[5].trim(),
                    lineNumber: parseInt(match[3]),
                    endLineNumber: parseInt(match[3]),
                    codeSnippet: match[6].trim(),
                    fix: match[7].trim(),
                    fixExplanation: match[8].trim()
                });
            }
        }

        return {
            bugs,
            score,
            summary,
            securityScore,
            performanceScore,
            maintainabilityScore
        };
    }

    /**
     * Parse security vulnerabilities
     */
    private parseSecurityVulnerabilities(response: string, code: string): SecurityVulnerability[] {
        const vulnerabilities: SecurityVulnerability[] = [];
        
        // Simple parsing for demonstration
        const lines = code.split('\n');
        
        // Look for common security issues
        if (response.toLowerCase().includes('no security vulnerabilities')) {
            return [];
        }

        // Parse vulnerability patterns from response
        const vulnMatches = response.matchAll(
            /Type:\s*([^\n]+)[\s\S]*?Severity:\s*(\w+)[\s\S]*?Description:\s*([^\n]+)[\s\S]*?Line:\s*(\d+)[\s\S]*?Fix:\s*([^\n]+)[\s\S]*?CWE:\s*(\w+-\d+)/gi
        );

        for (const match of vulnMatches) {
            vulnerabilities.push({
                type: match[1].trim(),
                severity: this.parseSeverity(match[2]),
                description: match[3].trim(),
                lineNumber: parseInt(match[4]),
                fix: match[5].trim(),
                cwe: match[6]
            });
        }

        return vulnerabilities;
    }

    /**
     * Parse category string
     */
    private parseCategory(category: string): BugCategory {
        const lower = category.toLowerCase();
        const mapping: Record<string, BugCategory> = {
            'logic': 'logic',
            'security': 'security',
            'performance': 'performance',
            'error-handling': 'error-handling',
            'type': 'type',
            'memory': 'memory',
            'concurrency': 'concurrency',
            'resource': 'resource',
            'syntax': 'syntax'
        };
        return mapping[lower] || 'logic';
    }

    /**
     * Parse severity string
     */
    private parseSeverity(severity: string): BugSeverity {
        const lower = severity.toLowerCase();
        const mapping: Record<string, BugSeverity> = {
            'critical': 'critical',
            'high': 'high',
            'medium': 'medium',
            'low': 'low',
            'info': 'info'
        };
        return mapping[lower] || 'medium';
    }

    /**
     * Infer severity from category
     */
    private inferSeverity(category: string, title: string): BugSeverity {
        if (category.toLowerCase() === 'security') return 'high';
        if (title.toLowerCase().includes('critical') || title.toLowerCase().includes('memory leak')) return 'critical';
        if (title.toLowerCase().includes('performance') || title.toLowerCase().includes('injection')) return 'high';
        return 'medium';
    }

    /**
     * Generate unique bug ID
     */
    private generateBugId(): string {
        return `bug-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Extract code from response
     */
    private extractCode(response: string): string {
        let code = response
            .replace(/```[\w]*\n?/g, '')
            .replace(/```/g, '')
            .trim();

        // Remove explanatory text
        const lines = code.split('\n');
        const codeLines: string[] = [];

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.match(/^(Here's|Below|The|In|To|For|Return|Apply)/i)) {
                codeLines.push(line);
            }
        }

        return codeLines.join('\n').trim();
    }

    /**
     * Get quick fixes for common bugs
     */
    getQuickFixes(): Array<{
        pattern: string;
        fix: string;
        description: string;
    }> {
        return [
            {
                pattern: 'console\\.log\\s*\\(',
                fix: '// Remove console.log or use logger',
                description: 'Remove debug logging'
            },
            {
                pattern: '==(?!=)',
                fix: '===',
                description: 'Use strict equality'
            },
            {
                pattern: '!=',
                fix: '!==',
                description: 'Use strict inequality'
            },
            {
                pattern: 'var\\s+',
                fix: 'let ',
                description: 'Use let instead of var'
            },
            {
                pattern: 'function\\s*\\(\\s*\\)',
                fix: '() =>',
                description: 'Use arrow functions'
            }
        ];
    }

    /**
     * Dispose
     */
    dispose(): void {
        // Cleanup if needed
    }
}

