import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

/**
 * Indexed Code Document
 */
export interface IndexedDocument {
    id: string;
    filePath: string;
    content: string;
    symbols: IndexedSymbol[];
    chunks: CodeChunk[];
    embedding?: number[];
    lastModified: number;
    language: string;
}

/**
 * Indexed Symbol
 */
export interface IndexedSymbol {
    id: string;
    name: string;
    type: 'function' | 'class' | 'interface' | 'method' | 'variable' | 'constant' | 'type';
    filePath: string;
    lineNumber: number;
    endLineNumber: number;
    content: string;
    documentation?: string;
    visibility: 'public' | 'private' | 'protected';
}

/**
 * Code Chunk for semantic search
 */
export interface CodeChunk {
    id: string;
    content: string;
    filePath: string;
    startLine: number;
    endLine: number;
    symbols: string[];
    embedding?: number[];
    chunkType: 'function' | 'class' | 'block' | 'file';
}

/**
 * Search Result
 */
export interface SearchResult {
    documentId: string;
    filePath: string;
    chunkId?: string;
    symbolId?: string;
    score: number;
    matches: string[];
    content: string;
}

/**
 * Similar Code Result
 */
export interface SimilarCodeResult {
    sourceChunk: CodeChunk;
    similarChunks: Array<{
        chunk: CodeChunk;
        similarity: number;
        matchReason: string;
    }>;
}

/**
 * Vector Store Interface
 */
export interface VectorStore {
    add(vectors: number[][], ids: string[]): void;
    search(query: number[], topK: number): Array<{ id: string; score: number }>;
    delete(ids: string[]): void;
    clear(): void;
    save(indexPath: string): void;
    load(indexPath: string): void;
}

/**
 * Simple In-Memory Vector Store
 */
class InMemoryVectorStore implements VectorStore {
    private vectors: Map<string, number[]> = new Map();

    add(vectors: number[][], ids: string[]): void {
        for (let i = 0; i < ids.length; i++) {
            this.vectors.set(ids[i], vectors[i]);
        }
    }

    search(query: number[], topK: number): Array<{ id: string; score: number }> {
        const results: Array<{ id: string; score: number }> = [];

        for (const [id, vector] of this.vectors) {
            const similarity = this.cosineSimilarity(query, vector);
            results.push({ id, score: similarity });
        }

        results.sort((a, b) => b.score - a.score);
        return results.slice(0, topK);
    }

    delete(ids: string[]): void {
        for (const id of ids) {
            this.vectors.delete(id);
        }
    }

    clear(): void {
        this.vectors.clear();
    }

    save(indexPath: string): void {
        const data: Record<string, number[]> = {};
        for (const [id, vector] of this.vectors) {
            data[id] = vector;
        }
        // Simple save (in production, use proper serialization)
        fs.writeFileSync(indexPath, JSON.stringify(data));
    }

    load(indexPath: string): void {
        try {
            const data = fs.readFileSync(indexPath, 'utf-8');
            const parsed = JSON.parse(data);
            for (const [id, vector] of Object.entries(parsed)) {
                this.vectors.set(id, vector as number[]);
            }
        } catch {
            // File doesn't exist or is invalid
        }
    }

    private cosineSimilarity(a: number[], b: number[]): number {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}

/**
 * Code Embedding Generator (Simulated - in production, use actual embeddings)
 */
class CodeEmbeddingGenerator {
    private embeddingCache: Map<string, number[]> = new Map();

    /**
     * Generate embedding for code content
     * In production, this would call an embedding API or use a local model
     */
    generateEmbedding(content: string): number[] {
        // Check cache first
        const cacheKey = this.hashContent(content);
        if (this.embeddingCache.has(cacheKey)) {
            return this.embeddingCache.get(cacheKey)!;
        }

        // Generate pseudo-embedding based on content
        // This is a simplified version - in production, use real embeddings
        const embedding = this.generatePseudoEmbedding(content);
        this.embeddingCache.set(cacheKey, embedding);
        return embedding;
    }

    /**
     * Generate pseudo-embedding for demonstration
     */
    private generatePseudoEmbedding(content: string): number[] {
        const dimensions = 128;
        const embedding: number[] = new Array(dimensions).fill(0);

        // Simple hashing to generate consistent "embedding"
        const words = content.toLowerCase().split(/\W+/);
        const wordHashes: number[] = [];

        for (const word of words) {
            let hash = 0;
            for (let i = 0; i < word.length; i++) {
                hash = ((hash << 5) - hash) + word.charCodeAt(i);
                hash = hash & hash;
            }
            wordHashes.push(Math.abs(hash));
        }

        // Spread word hashes across dimensions
        for (let i = 0; i < dimensions; i++) {
            if (wordHashes.length > 0) {
                const wordIndex = i % wordHashes.length;
                embedding[i] = (wordHashes[wordIndex] % 100) / 100;
            }
        }

        // Normalize
        const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        if (norm > 0) {
            for (let i = 0; i < dimensions; i++) {
                embedding[i] /= norm;
            }
        }

        return embedding;
    }

    private hashContent(content: string): string {
        return crypto.createHash('sha256').update(content).digest('hex');
    }

    clearCache(): void {
        this.embeddingCache.clear();
    }
}

/**
 * Semantic Code Indexing Service
 * Provides semantic search and code similarity detection
 */
export class IndexingService {
    private context: vscode.ExtensionContext;
    private documents: Map<string, IndexedDocument> = new Map();
    private vectorStore: VectorStore;
    private embeddingGenerator: CodeEmbeddingGenerator;
    private indexPath: string;
    private isIndexing: boolean = false;
    private progress?: vscode.Progress<{ message?: string; increment?: number }>;
    private statusBarItem?: vscode.StatusBarItem;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.vectorStore = new InMemoryVectorStore();
        this.embeddingGenerator = new CodeEmbeddingGenerator();
        this.indexPath = path.join(context.globalStoragePath, 'code-index');
        
        this.createStatusBarItem();
    }

    /**
     * Create status bar item
     */
    private createStatusBarItem(): void {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            101
        );
        this.statusBarItem.text = '$(search) AI Index';
        this.statusBarItem.tooltip = 'Click to rebuild code index';
        this.statusBarItem.command = 'ai-coding-assistant.rebuildIndex';
        this.statusBarItem.show();
    }

    /**
     * Initialize the indexing service
     */
    async initialize(): Promise<void> {
        // Create storage directory
        const storageDir = this.context.globalStoragePath;
        if (!fs.existsSync(storageDir)) {
            fs.mkdirSync(storageDir, { recursive: true });
        }

        // Load existing index
        await this.loadIndex();

        // Start indexing
        await this.indexWorkspace();
    }

    /**
     * Index entire workspace
     */
    async indexWorkspace(): Promise<void> {
        if (this.isIndexing) {
            vscode.window.showWarningMessage('Indexing already in progress');
            return;
        }

        this.isIndexing = true;
        this.statusBarItem!.text = '$(sync~spin) AI Indexing...';

        try {
            await vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Window,
                    title: 'AI Code Indexing',
                    cancellable: true
                },
                async (progress, token) => {
                    this.progress = progress;
                    
                    const workspaceFolders = vscode.workspace.workspaceFolders;
                    if (!workspaceFolders) {
                        progress.report({ message: 'No workspace open' });
                        return;
                    }

                    const rootPath = workspaceFolders[0].uri.fsPath;
                    const files = await this.findSourceFiles(rootPath);
                    
                    progress.report({ message: `Found ${files.length} files to index`, increment: 10 });

                    const total = files.length;
                    let processed = 0;

                    for (const filePath of files) {
                        if (token.isCancellationRequested) {
                            break;
                        }

                        try {
                            await this.indexFile(filePath);
                        } catch (error) {
                            console.error(`Error indexing ${filePath}:`, error);
                        }

                        processed++;
                        const increment = ((processed / total) * 90);
                        progress.report({
                            message: `Indexing ${path.basename(filePath)} (${processed}/${total})`,
                            increment
                        });
                    }

                    // Build vector index
                    progress.report({ message: 'Building semantic index...', increment: 0 });
                    await this.buildVectorIndex();

                    progress.report({ message: 'Saving index...', increment: 5 });
                    await this.saveIndex();

                    progress.report({ message: 'Index complete!', increment: 5 });
                }
            );

            vscode.window.showInformationMessage(`✅ Indexed ${this.documents.size} files`);
        } catch (error) {
            vscode.window.showErrorMessage(`Indexing failed: ${error}`);
        } finally {
            this.isIndexing = false;
            this.statusBarItem!.text = '$(search) AI Index';
        }
    }

    /**
     * Find all source files in workspace
     */
    private async findSourceFiles(rootPath: string): Promise<string[]> {
        const files: string[] = [];
        const extensions = [
            '.ts', '.tsx', '.js', '.jsx',
            '.py', '.java', '.go', '.rs',
            '.cpp', '.c', '.h', '.cs',
            '.rb', '.php', '.swift', '.kt',
            '.vue', '.svelte'
        ];

        const scanDir = async (dir: string): Promise<void> => {
            try {
                const entries = await vscode.workspace.fs.readDirectory(vscode.Uri.file(dir));
                
                for (const [name, type] of entries) {
                    if (name.startsWith('.') || name === 'node_modules') continue;
                    if (name === 'dist' || name === 'build' || name === '.git') continue;

                    const fullPath = path.join(dir, name);
                    
                    if (type === vscode.FileType.Directory) {
                        await scanDir(fullPath);
                    } else {
                        const ext = path.extname(name).toLowerCase();
                        if (extensions.includes(ext)) {
                            files.push(fullPath);
                        }
                    }
                }
            } catch (error) {
                console.error(`Error scanning directory ${dir}:`, error);
            }
        };

        await scanDir(rootPath);
        return files;
    }

    /**
     * Index a single file
     */
    private async indexFile(filePath: string): Promise<IndexedDocument> {
        const content = fs.readFileSync(filePath, 'utf-8');
        const stat = fs.statSync(filePath);
        const language = this.detectLanguage(filePath);

        // Extract symbols
        const symbols = this.extractSymbols(content, filePath, language);

        // Create chunks
        const chunks = this.createChunks(content, filePath, language, symbols);

        const document: IndexedDocument = {
            id: this.getDocumentId(filePath),
            filePath,
            content,
            symbols,
            chunks,
            lastModified: stat.mtimeMs,
            language
        };

        this.documents.set(document.id, document);
        return document;
    }

    /**
     * Detect language from file path
     */
    private detectLanguage(filePath: string): string {
        const ext = path.extname(filePath).toLowerCase();
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
            '.vue': 'vue',
            '.svelte': 'svelte'
        };
        return mapping[ext] || 'unknown';
    }

    /**
     * Extract symbols from code
     */
    private extractSymbols(content: string, filePath: string, language: string): IndexedSymbol[] {
        const symbols: IndexedSymbol[] = [];
        const lines = content.split('\n');
        const fileId = this.getDocumentId(filePath);

        // Symbol patterns for different languages
        const patterns: Array<{ type: IndexedSymbol['type']; regex: RegExp }> = [
            { type: 'function', regex: /(?:async\s+)?function\s+(\w+)/g },
            { type: 'class', regex: /class\s+(\w+)/g },
            { type: 'interface', regex: /interface\s+(\w+)/g },
            { type: 'method', regex: /(?:public|private|protected)?\s*(?:async\s+)?(\w+)\s*\(/g },
            { type: 'constant', regex: /(?:const|let|var)\s+(\w+)\s*=/g },
            { type: 'type', regex: /type\s+(\w+)/g }
        ];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            for (const { type, regex } of patterns) {
                let match;
                regex.lastIndex = 0;
                while ((match = regex.exec(line)) !== null) {
                    const name = match[1];
                    
                    // Skip if symbol already exists
                    if (symbols.some(s => s.name === name && s.lineNumber === i + 1)) {
                        continue;
                    }

                    const endLine = this.findEndLine(lines, i);
                    const symbolContent = lines.slice(i, endLine).join('\n');

                    symbols.push({
                        id: `${fileId}::${name}`,
                        name,
                        type,
                        filePath,
                        lineNumber: i + 1,
                        endLineNumber: endLine,
                        content: symbolContent,
                        visibility: this.extractVisibility(line)
                    });
                }
            }
        }

        return symbols;
    }

    /**
     * Find end line for a code block
     */
    private findEndLine(lines: string[], startLine: number): number {
        let braceCount = 0;
        let foundFirstBrace = false;
        
        for (let i = startLine; i < lines.length; i++) {
            for (const char of lines[i]) {
                if (char === '{') {
                    braceCount++;
                    foundFirstBrace = true;
                } else if (char === '}') {
                    braceCount--;
                }
            }
            
            if (foundFirstBrace && braceCount <= 0) {
                return i + 1;
            }
        }
        
        return startLine + 1;
    }

    /**
     * Extract visibility modifier
     */
    private extractVisibility(line: string): 'public' | 'private' | 'protected' {
        if (line.includes('private')) return 'private';
        if (line.includes('protected')) return 'protected';
        return 'public';
    }

    /**
     * Create code chunks for semantic search
     */
    private createChunks(
        content: string,
        filePath: string,
        language: string,
        symbols: IndexedSymbol[]
    ): CodeChunk[] {
        const chunks: CodeChunk[] = [];
        const lines = content.split('\n');
        const fileId = this.getDocumentId(filePath);

        // Create chunk for each symbol
        for (const symbol of symbols) {
            if (symbol.type === 'function' || symbol.type === 'class' || symbol.type === 'method') {
                const chunk: CodeChunk = {
                    id: `${fileId}::chunk::${symbol.lineNumber}`,
                    content: symbol.content,
                    filePath,
                    startLine: symbol.lineNumber,
                    endLine: symbol.endLineNumber,
                    symbols: [symbol.id],
                    chunkType: symbol.type
                };
                chunks.push(chunk);
            }
        }

        // If no symbols found, create a single file chunk
        if (chunks.length === 0) {
            chunks.push({
                id: `${fileId}::chunk::file`,
                content: content,
                filePath,
                startLine: 1,
                endLine: lines.length,
                symbols: symbols.map(s => s.id),
                chunkType: 'file'
            });
        }

        return chunks;
    }

    /**
     * Build vector index from all chunks
     */
    private async buildVectorIndex(): Promise<void> {
        const vectors: number[][] = [];
        const ids: string[] = [];

        for (const doc of this.documents.values()) {
            for (const chunk of doc.chunks) {
                if (!chunk.embedding) {
                    chunk.embedding = this.embeddingGenerator.generateEmbedding(chunk.content);
                }
                vectors.push(chunk.embedding);
                ids.push(chunk.id);
            }
        }

        this.vectorStore.add(vectors, ids);
    }

    /**
     * Semantic search across codebase
     */
    async semanticSearch(query: string, topK: number = 10): Promise<SearchResult[]> {
        const queryEmbedding = this.embeddingGenerator.generateEmbedding(query);
        const vectorResults = this.vectorStore.search(queryEmbedding, topK * 2);

        const results: SearchResult[] = [];

        for (const { id, score } of vectorResults) {
            // Find the chunk
            let foundChunk: CodeChunk | null = null;
            let foundDoc: IndexedDocument | null = null;

            for (const doc of this.documents.values()) {
                const chunk = doc.chunks.find(c => c.id === id);
                if (chunk) {
                    foundChunk = chunk;
                    foundDoc = doc;
                    break;
                }
            }

            if (foundChunk && foundDoc) {
                // Find matching symbols
                const matches = this.findMatchingTerms(query, foundChunk.content);

                results.push({
                    documentId: foundDoc.id,
                    filePath: foundDoc.filePath,
                    chunkId: foundChunk.id,
                    score,
                    matches,
                    content: foundChunk.content.substring(0, 500)
                });
            }
        }

        // Sort by score and limit
        results.sort((a, b) => b.score - a.score);
        return results.slice(0, topK);
    }

    /**
     * Find terms in content that match query
     */
    private findMatchingTerms(query: string, content: string): string[] {
        const terms = query.toLowerCase().split(/\s+/);
        const matches: string[] = [];
        const contentLower = content.toLowerCase();

        for (const term of terms) {
            if (term.length > 2 && contentLower.includes(term)) {
                matches.push(term);
            }
        }

        return matches;
    }

    /**
     * Find similar code patterns
     */
    async findSimilarCode(filePath: string, lineNumber: number): Promise<SimilarCodeResult | null> {
        // Find the chunk at the given location
        const doc = this.documents.get(this.getDocumentId(filePath));
        if (!doc) return null;

        const sourceChunk = doc.chunks.find(
            c => c.startLine <= lineNumber && c.endLine >= lineNumber
        );

        if (!sourceChunk) return null;

        // Generate embedding for source chunk
        const sourceEmbedding = this.embeddingGenerator.generateEmbedding(sourceChunk.content);

        // Search for similar chunks
        const results = this.vectorStore.search(sourceEmbedding, 10);

        const similarChunks: Array<{ chunk: CodeChunk; similarity: number; matchReason: string }> = [];

        for (const { id, score } of results) {
            if (id === sourceChunk.id) continue;

            for (const d of this.documents.values()) {
                const chunk = d.chunks.find(c => c.id === id);
                if (chunk) {
                    similarChunks.push({
                        chunk,
                        similarity: score,
                        matchReason: this.generateMatchReason(sourceChunk, chunk)
                    });
                    break;
                }
            }
        }

        return {
            sourceChunk,
            similarChunks: similarChunks.slice(0, 5)
        };
    }

    /**
     * Generate explanation for why chunks are similar
     */
    private generateMatchReason(source: CodeChunk, target: CodeChunk): string {
        const reasons: string[] = [];

        if (source.chunkType === target.chunkType) {
            reasons.push(`Both are ${source.chunkType}s`);
        }

        if (source.symbols.length === target.symbols.length) {
            reasons.push('Similar complexity');
        }

        return reasons.join(' • ');
    }

    /**
     * Search for symbol by name
     */
    searchSymbol(name: string): IndexedSymbol[] {
        const results: IndexedSymbol[] = [];
        const nameLower = name.toLowerCase();

        for (const doc of this.documents.values()) {
            for (const symbol of doc.symbols) {
                if (symbol.name.toLowerCase().includes(nameLower)) {
                    results.push(symbol);
                }
            }
        }

        return results;
    }

    /**
     * Get document by file path
     */
    getDocument(filePath: string): IndexedDocument | undefined {
        return this.documents.get(this.getDocumentId(filePath));
    }

    /**
     * Update indexed document when file changes
     */
    async updateDocument(filePath: string): Promise<void> {
        await this.indexFile(filePath);
        await this.buildVectorIndex();
        await this.saveIndex();
    }

    /**
     * Remove document from index
     */
    async removeDocument(filePath: string): Promise<void> {
        const docId = this.getDocumentId(filePath);
        this.documents.delete(docId);
        
        // Remove from vector store
        const idsToDelete = this.documents.get(docId)?.chunks.map(c => c.id) || [];
        this.vectorStore.delete(idsToDelete);
        
        await this.saveIndex();
    }

    /**
     * Get document ID
     */
    private getDocumentId(filePath: string): string {
        return crypto.createHash('sha256').update(filePath).digest('hex').substring(0, 16);
    }

    /**
     * Save index to disk
     */
    private async saveIndex(): Promise<void> {
        try {
            // Save documents metadata
            const docsData = Array.from(this.documents.values()).map(doc => ({
                id: doc.id,
                filePath: doc.filePath,
                lastModified: doc.lastModified,
                language: doc.language,
                symbols: doc.symbols.map(s => ({
                    id: s.id,
                    name: s.name,
                    type: s.type,
                    filePath: s.filePath,
                    lineNumber: s.lineNumber
                })),
                chunks: doc.chunks.map(c => ({
                    id: c.id,
                    filePath: c.filePath,
                    startLine: c.startLine,
                    endLine: c.endLine,
                    chunkType: c.chunkType
                }))
            }));

            const docsPath = path.join(this.indexPath, 'documents.json');
            fs.writeFileSync(docsPath, JSON.stringify(docsData, null, 2));

            // Save vector index
            const vectorsPath = path.join(this.indexPath, 'vectors.json');
            this.vectorStore.save(vectorsPath);

        } catch (error) {
            console.error('Error saving index:', error);
        }
    }

    /**
     * Load index from disk
     */
    private async loadIndex(): Promise<void> {
        try {
            const docsPath = path.join(this.indexPath, 'documents.json');
            const vectorsPath = path.join(this.indexPath, 'vectors.json');

            if (fs.existsSync(docsPath)) {
                const docsData = JSON.parse(fs.readFileSync(docsPath, 'utf-8'));
                
                for (const docData of docsData) {
                    const content = fs.readFileSync(docData.filePath, 'utf-8');
                    
                    // Recreate chunks
                    const chunks: CodeChunk[] = docData.chunks.map((c: any) => ({
                        ...c,
                        content: '',
                        symbols: []
                    }));

                    this.documents.set(docData.id, {
                        ...docData,
                        content,
                        symbols: docData.symbols,
                        chunks
                    });
                }
            }

            if (fs.existsSync(vectorsPath)) {
                this.vectorStore.load(vectorsPath);
            }

        } catch (error) {
            console.error('Error loading index:', error);
        }
    }

    /**
     * Rebuild entire index
     */
    async rebuildIndex(): Promise<void> {
        this.documents.clear();
        this.vectorStore.clear();
        this.embeddingGenerator.clearCache();
        await this.indexWorkspace();
    }

    /**
     * Get indexing status
     */
    getStatus(): { isIndexing: boolean; documentCount: number } {
        return {
            isIndexing: this.isIndexing,
            documentCount: this.documents.size
        };
    }

    /**
     * Get all indexed documents
     */
    getAllDocuments(): IndexedDocument[] {
        return Array.from(this.documents.values());
    }

    /**
     * Dispose
     */
    dispose(): void {
        this.statusBarItem?.dispose();
        this.embeddingGenerator.clearCache();
    }
}

