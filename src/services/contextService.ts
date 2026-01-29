import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Project Context Information
 */
export interface ProjectContext {
    projectRoot: string;
    language: string;
    framework?: string;
    dependencies: string[];
    imports: Map<string, ImportInfo[]>;
    codeGraph: CodeGraph;
    fileStructure: FileNode[];
}

/**
 * Import Information
 */
export interface ImportInfo {
    module: string;
    importedSymbols: string[];
    filePath: string;
    lineNumber: number;
}

/**
 * Code Graph Node
 */
export interface CodeNode {
    id: string;
    name: string;
    type: 'function' | 'class' | 'interface' | 'variable' | 'constant' | 'type';
    filePath: string;
    lineNumber: number;
    endLineNumber: number;
    dependencies: string[];
    dependents: string[];
    children: string[];
    parent?: string;
}

/**
 * Code Graph
 */
export interface CodeGraph {
    nodes: Map<string, CodeNode>;
    edges: Array<{ from: string; to: string; type: string }>;
}

/**
 * File Node for tree structure
 */
export interface FileNode {
    name: string;
    path: string;
    type: 'file' | 'directory';
    children?: FileNode[];
    language?: string;
}

/**
 * Project Context Service
 * Provides project-wide context awareness for AI features
 */
export class ContextService {
    private context: vscode.ExtensionContext;
    private projectContext: ProjectContext | null = null;
    private workspaceRoot: string = '';
    private parseQueue: string[] = [];
    private isIndexing: boolean = false;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * Initialize the context service
     */
    async initialize(): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showWarningMessage('No workspace folder open');
            return;
        }

        this.workspaceRoot = workspaceFolders[0].uri.fsPath;
        await this.buildProjectContext();
    }

    /**
     * Build complete project context
     */
    async buildProjectContext(): Promise<ProjectContext> {
        if (this.isIndexing) {
            return this.projectContext!;
        }

        this.isIndexing = true;

        try {
            // Detect language and framework
            const language = this.detectLanguage();
            const framework = this.detectFramework();

            // Build file structure
            const fileStructure = await this.buildFileStructure(this.workspaceRoot);

            // Parse all source files
            await this.parseAllFiles();

            // Build code graph
            const codeGraph = this.buildCodeGraph();

            // Extract dependencies
            const dependencies = this.extractDependencies();

            // Build project context
            this.projectContext = {
                projectRoot: this.workspaceRoot,
                language,
                framework,
                dependencies,
                imports: this.parseImports(),
                codeGraph,
                fileStructure
            };

            vscode.window.showInformationMessage('✅ Project context built successfully!');
            return this.projectContext;
        } finally {
            this.isIndexing = false;
        }
    }

    /**
     * Detect primary programming language
     */
    private detectLanguage(): string {
        const extensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.go', '.rs'];
        const counts: { [key: string]: number } = {};

        const countFiles = (dir: string): void => {
            try {
                const files = fs.readdirSync(dir);
                for (const file of files) {
                    const fullPath = path.join(dir, file);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
                        countFiles(fullPath);
                    } else if (stat.isFile()) {
                        const ext = path.extname(file).toLowerCase();
                        const lang = this.extensionToLanguage(ext);
                        if (lang) {
                            counts[lang] = (counts[lang] || 0) + 1;
                        }
                    }
                }
            } catch {
                // Ignore permission errors
            }
        };

        countFiles(this.workspaceRoot);

        let maxLang = 'javascript';
        let maxCount = 0;
        for (const [lang, count] of Object.entries(counts)) {
            if (count > maxCount) {
                maxCount = count;
                maxLang = lang;
            }
        }

        return maxLang;
    }

    /**
     * Map extension to language
     */
    private extensionToLanguage(ext: string): string | null {
        const mapping: { [key: string]: string } = {
            '.ts': 'typescript',
            '.tsx': 'typescript',
            '.js': 'javascript',
            '.jsx': 'javascript',
            '.py': 'python',
            '.java': 'java',
            '.go': 'go',
            '.rs': 'rust',
            '.cpp': 'cpp',
            '.c': 'c',
            '.cs': 'csharp',
            '.rb': 'ruby',
            '.php': 'php',
            '.swift': 'swift',
            '.kt': 'kotlin',
            '.scala': 'scala'
        };

        return mapping[ext] || null;
    }

    /**
     * Detect framework from project files
     */
    private detectFramework(): string | undefined {
        const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
        const requirementsPath = path.join(this.workspaceRoot, 'requirements.txt');
        const pomPath = path.join(this.workspaceRoot, 'pom.xml');
        const goModPath = path.join(this.workspaceRoot, 'go.mod');

        // Check package.json
        try {
            if (fs.existsSync(packageJsonPath)) {
                const content = fs.readFileSync(packageJsonPath, 'utf-8');
                const pkg = JSON.parse(content);
                const deps = { ...pkg.dependencies, ...pkg.devDependencies };
                
                if (deps['@react']) return 'react';
                if (deps['vue']) return 'vue';
                if (deps['@angular/core']) return 'angular';
                if (deps['express']) return 'express';
                if (deps['next']) return 'next';
                if (deps['nestjs']) return 'nestjs';
            }
        } catch {
            // Ignore
        }

        // Check requirements.txt
        try {
            if (fs.existsSync(requirementsPath)) {
                const content = fs.readFileSync(requirementsPath, 'utf-8');
                if (content.includes('django')) return 'django';
                if (content.includes('flask')) return 'flask';
                if (content.includes('fastapi')) return 'fastapi';
            }
        } catch {
            // Ignore
        }

        // Check go.mod
        try {
            if (fs.existsSync(goModPath)) {
                const content = fs.readFileSync(goModPath, 'utf-8');
                if (content.includes('gin-gonic')) return 'gin';
                if (content.includes('beego')) return 'beego';
            }
        } catch {
            // Ignore
        }

        return undefined;
    }

    /**
     * Build file structure tree
     */
    private async buildFileStructure(root: string): Promise<FileNode[]> {
        const nodes: FileNode[] = [];

        const buildTree = async (dir: string, parentNode: FileNode | null = null): Promise<void> => {
            try {
                const entries = await vscode.workspace.fs.readDirectory(vscode.Uri.file(dir));
                
                for (const [name, type] of entries) {
                    if (name.startsWith('.') || name === 'node_modules') continue;
                    if (name === 'dist' || name === 'build' || name === '.git') continue;

                    const fullPath = path.join(dir, name);
                    
                    if (type === vscode.FileType.Directory) {
                        const node: FileNode = {
                            name,
                            path: fullPath,
                            type: 'directory',
                            children: []
                        };
                        parentNode?.children?.push(node);
                        await buildTree(fullPath, node);
                    } else {
                        const ext = path.extname(name).toLowerCase();
                        const lang = this.extensionToLanguage(ext);
                        
                        const node: FileNode = {
                            name,
                            path: fullPath,
                            type: 'file',
                            language: lang || 'unknown'
                        };
                        parentNode?.children?.push(node);
                        nodes.push(node);
                    }
                }
            } catch (error) {
                console.error(`Error reading directory ${dir}:`, error);
            }
        };

        await buildTree(root, null);
        return nodes;
    }

    /**
     * Parse all source files
     */
    private async parseAllFiles(): Promise<void> {
        this.parseQueue = [];

        const scanDir = async (dir: string): Promise<void> => {
            try {
                const entries = await vscode.workspace.fs.readDirectory(vscode.Uri.file(dir));
                
                for (const [name, type] of entries) {
                    if (name.startsWith('.') || name === 'node_modules') continue;
                    
                    const fullPath = path.join(dir, name);
                    
                    if (type === vscode.FileType.Directory) {
                        await scanDir(fullPath);
                    } else {
                        const ext = path.extname(name).toLowerCase();
                        if (['.ts', '.tsx', '.js', '.jsx', '.py', '.java'].includes(ext)) {
                            this.parseQueue.push(fullPath);
                        }
                    }
                }
            } catch (error) {
                console.error(`Error scanning directory ${dir}:`, error);
            }
        };

        await scanDir(this.workspaceRoot);
    }

    /**
     * Parse imports from all files
     */
    private parseImports(): Map<string, ImportInfo[]> {
        const imports = new Map<string, ImportInfo[]>();

        for (const filePath of this.parseQueue) {
            const fileImports = this.parseFileImports(filePath);
            imports.set(filePath, fileImports);
        }

        return imports;
    }

    /**
     * Parse imports from a single file
     */
    private parseFileImports(filePath: string): ImportInfo[] {
        const imports: ImportInfo[] = [];

        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n');

            const importPatterns: RegExp[] = [
                /import\s+(?:\{[^}]*\}|\* as \w+|\w+)\s+from\s+['"]([^'"]+)['"]/g, // ES6
                /import\s+['"]([^'"]+)['"]/g, // Default import
                /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g // CommonJS
            ];

            lines.forEach((line, index) => {
                for (const pattern of importPatterns) {
                    let match;
                    pattern.lastIndex = 0;
                    while ((match = pattern.exec(line)) !== null) {
                        imports.push({
                            module: match[1],
                            importedSymbols: this.extractImportedSymbols(line),
                            filePath,
                            lineNumber: index + 1
                        });
                    }
                }
            });
        } catch (error) {
            console.error(`Error parsing imports in ${filePath}:`, error);
        }

        return imports;
    }

    /**
     * Extract imported symbols from import statement
     */
    private extractImportedSymbols(line: string): string[] {
        const symbols: string[] = [];
        
        const braceMatch = line.match(/import\s*\{([^}]+)\}/);
        if (braceMatch) {
            braceMatch[1].split(',').forEach(s => {
                const symbol = s.trim().split(' as ')[0].trim();
                if (symbol) symbols.push(symbol);
            });
        } else {
            const defaultMatch = line.match(/import\s+(\w+)/);
            if (defaultMatch) {
                symbols.push(defaultMatch[1]);
            }
        }

        return symbols;
    }

    /**
     * Build code graph from parsed files
     */
    private buildCodeGraph(): CodeGraph {
        const nodes = new Map<string, CodeNode>();
        const edges: Array<{ from: string; to: string; type: string }> = [];

        for (const filePath of this.parseQueue) {
            const fileNodes = this.parseFileForSymbols(filePath);
            
            for (const node of fileNodes) {
                nodes.set(node.id, node);
            }
        }

        // Build edges based on dependencies
        for (const [filePath, imports] of this.parseImports()) {
            for (const imp of imports) {
                const targetFile = this.resolveImportPath(filePath, imp.module);
                if (targetFile) {
                    const sourceNode = this.findNodeForFile(nodes, filePath);
                    const targetNode = this.findNodeForFile(nodes, targetFile);
                    
                    if (sourceNode && targetNode) {
                        edges.push({
                            from: sourceNode.id,
                            to: targetNode.id,
                            type: 'imports'
                        });
                        sourceNode.dependencies.push(targetNode.id);
                        targetNode.dependents.push(sourceNode.id);
                    }
                }
            }
        }

        return { nodes, edges };
    }

    /**
     * Parse file for code symbols (functions, classes, etc.)
     */
    private parseFileForSymbols(filePath: string): CodeNode[] {
        const nodes: CodeNode[] = [];

        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n');
            const fileId = this.pathToId(filePath);

            // Pattern definitions for different symbol types
            const patterns: Array<{ type: CodeNode['type']; regex: RegExp }> = [
                { type: 'function', regex: /(?:async\s+)?function\s+(\w+)/g },
                { type: 'class', regex: /class\s+(\w+)/g },
                { type: 'interface', regex: /interface\s+(\w+)/g },
                { type: 'constant', regex: /(?:const|let|var)\s+(\w+)/g },
                { type: 'type', regex: /type\s+(\w+)/g }
            ];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                for (const { type, regex } of patterns) {
                    let match;
                    regex.lastIndex = 0;
                    while ((match = regex.exec(line)) !== null) {
                        const name = match[1];
                        const nodeId = `${fileId}::${name}`;

                        // Calculate end line (rough estimate)
                        let endLine = i + 1;
                        let braceCount = 0;
                        let foundFirstBrace = false;

                        for (let j = i; j < lines.length; j++) {
                            for (const char of lines[j]) {
                                if (char === '{') {
                                    braceCount++;
                                    foundFirstBrace = true;
                                } else if (char === '}') {
                                    braceCount--;
                                }
                            }
                            if (foundFirstBrace && braceCount === 0) {
                                endLine = j + 1;
                                break;
                            }
                        }

                        nodes.push({
                            id: nodeId,
                            name,
                            type,
                            filePath,
                            lineNumber: i + 1,
                            endLineNumber: endLine,
                            dependencies: [],
                            dependents: [],
                            children: []
                        });
                    }
                }
            }
        } catch (error) {
            console.error(`Error parsing symbols in ${filePath}:`, error);
        }

        return nodes;
    }

    /**
     * Find node for a file
     */
    private findNodeForFile(nodes: Map<string, CodeNode>, filePath: string): CodeNode | undefined {
        for (const node of nodes.values()) {
            if (node.filePath === filePath) {
                return node;
            }
        }
        return undefined;
    }

    /**
     * Resolve import path to file path
     */
    private resolveImportPath(fromFile: string, module: string): string | null {
        if (module.startsWith('.') || module.startsWith('/')) {
            const exts = ['.ts', '.tsx', '.js', '.jsx', '.json'];
            const basePath = path.dirname(fromFile);
            
            for (const ext of exts) {
                const fullPath = path.join(basePath, module + ext);
                if (fs.existsSync(fullPath)) {
                    return fullPath;
                }
                
                const indexPath = path.join(basePath, module, `index${ext}`);
                if (fs.existsSync(indexPath)) {
                    return indexPath;
                }
            }
        }
        return null;
    }

    /**
     * Extract dependencies from package.json
     */
    private extractDependencies(): string[] {
        const deps: string[] = [];

        try {
            const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                const content = fs.readFileSync(packageJsonPath, 'utf-8');
                const pkg = JSON.parse(content);
                
                const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
                deps.push(...Object.keys(allDeps));
            }
        } catch (error) {
            console.error('Error extracting dependencies:', error);
        }

        return deps;
    }

    /**
     * Convert file path to ID
     */
    private pathToId(filePath: string): string {
        return filePath
            .replace(this.workspaceRoot, '')
            .replace(/[\\/]/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '')
            .replace(/^_/, '');
    }

    /**
     * Get project context
     */
    getProjectContext(): ProjectContext | null {
        return this.projectContext;
    }

    /**
     * Get code graph
     */
    getCodeGraph(): CodeGraph | null {
        return this.projectContext?.codeGraph || null;
    }

    /**
     * Get symbols in current file
     */
    getSymbolsInFile(filePath: string): CodeNode[] {
        const graph = this.getCodeGraph();
        if (!graph) return [];

        const fileId = this.pathToId(filePath);
        return Array.from(graph.nodes.values()).filter(
            node => node.filePath === filePath
        );
    }

    /**
     * Find related symbols based on current selection
     */
    findRelatedSymbols(symbolId: string): CodeNode[] {
        const graph = this.getCodeGraph();
        if (!graph) return [];

        const node = graph.nodes.get(symbolId);
        if (!node) return [];

        const related = new Set<CodeNode>();
        const visited = new Set<string>();

        const traverse = (id: string): void => {
            if (visited.has(id)) return;
            visited.add(id);

            const currentNode = graph.nodes.get(id);
            if (!currentNode) return;

            related.add(currentNode);

            // Add dependencies
            for (const depId of currentNode.dependencies) {
                traverse(depId);
            }

            // Add dependents
            for (const depId of currentNode.dependents) {
                traverse(depId);
            }
        };

        traverse(symbolId);
        return Array.from(related);
    }

    /**
     * Search for symbol by name
     */
    searchByName(name: string): CodeNode[] {
        const graph = this.getCodeGraph();
        if (!graph) return [];

        return Array.from(graph.nodes.values()).filter(
            node => node.name.toLowerCase().includes(name.toLowerCase())
        );
    }

    /**
     * Get all functions in project
     */
    getAllFunctions(): CodeNode[] {
        const graph = this.getCodeGraph();
        if (!graph) return [];

        return Array.from(graph.nodes.values()).filter(
            node => node.type === 'function'
        );
    }

    /**
     * Get all classes in project
     */
    getAllClasses(): CodeNode[] {
        const graph = this.getCodeGraph();
        if (!graph) return [];

        return Array.from(graph.nodes.values()).filter(
            node => node.type === 'class'
        );
    }

    /**
     * Refresh project context
     */
    async refresh(): Promise<void> {
        this.projectContext = null;
        await this.buildProjectContext();
    }

    /**
     * Dispose
     */
    dispose(): void {
        this.projectContext = null;
        this.parseQueue = [];
    }
}

