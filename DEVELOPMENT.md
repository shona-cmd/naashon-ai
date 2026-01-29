# Development Guide

## Local Development Setup

### Prerequisites
- Node.js 18+ or 20+
- npm 8+
- Git
- VS Code 1.85+

### Installation

1. Clone the repository:
```bash
git clone https://github.com/naashon/ai-coding-assistant.git
cd ai-coding-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Open in VS Code:
```bash
code .
```

## Development Workflow

### Building

```bash
# One-time build
npm run build

# Watch mode (rebuilds on file changes)
npm run watch
```

### Linting

```bash
# Check for linting errors
npm run lint

# Automatically fix linting issues
npm run lint:fix
```

### Testing

```bash
# Run tests
npm run test

# Run tests in watch mode (if supported)
npm run test -- --watch
```

### Running the Extension

1. Open VS Code
2. Press `F5` to start debugging
3. A new VS Code window will open with your extension
4. Test your changes in real-time

### Packaging

```bash
# Create a .vsix file
npm run package

# Install the .vsix in VS Code
code --install-extension ai-coding-assistant-0.1.0.vsix
```

### Cleaning Build Artifacts

```bash
npm run clean
```

## Project Structure

```
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
├── .vscode/
│   ├── launch.json        # Debug configuration
│   ├── tasks.json         # Build tasks
│   └── extensions.json    # Recommended extensions
├── images/
│   └── icon.png           # Extension icon
├── src/
│   ├── extension.ts       # Main extension entry
│   ├── assistant.ts       # Core assistant logic
│   └── services/
│       └── aiService.ts   # AI API integration
├── package.json           # Project metadata
├── tsconfig.json          # TypeScript config
├── .vscodeignore          # Exclude files from package
├── DEPLOYMENT.md          # Publishing guide
├── DEVELOPMENT.md         # This file
├── CHANGELOG.md           # Version history
└── README.md              # User documentation
```

## Key Files

### `src/extension.ts`
Entry point for the extension. Registers commands and initializes the assistant.

### `src/assistant.ts`
Core `AICodingAssistant` class that handles:
- Code generation
- Code explanation
- Code refactoring

### `src/services/aiService.ts`
AI service integration using OpenAI API (or your chosen provider).

## Configuration

Settings are defined in `package.json` under `"contributes"`:

- `ai-coding-assistant.apiKey`: API key for AI service
- `ai-coding-assistant.model`: Model selection (e.g., gpt-3.5-turbo, gpt-4)
- `ai-coding-assistant.temperature`: Response creativity (0.0-1.0)

Users can configure these in VS Code settings.

## Adding New Features

### Example: Add a new command

1. Add command in `package.json`:
```json
{
  "command": "ai-coding-assistant.newFeature",
  "title": "AI: New Feature",
  "category": "AI Coding Assistant"
}
```

2. Register command in `src/extension.ts`:
```typescript
const newFeatureCommand = vscode.commands.registerCommand(
  'ai-coding-assistant.newFeature',
  () => assistant.newFeature()
);
context.subscriptions.push(newFeatureCommand);
```

3. Implement method in `src/assistant.ts`:
```typescript
async newFeature(): Promise<void> {
  // Implementation
}
```

## Debugging

### Breakpoints
- Set breakpoints in VS Code editor
- Use `F5` to start debugging
- Press `F10` to step through code

### Console Output
Use `console.log()` to debug. Output appears in VS Code Debug Console.

### Useful Extensions for Development
- ESLint
- Prettier
- TypeScript Vue Plugin (if using Vue)
- Thunder Client (for API testing)

## Testing

Create test files in a `test` directory:

```typescript
import * as assert from 'assert';
import { AICodingAssistant } from '../../src/assistant';

suite('AI Coding Assistant', () => {
  test('should generate code', async () => {
    // Test implementation
  });
});
```

## Publishing Pre-Checks

Before publishing, ensure:

1. ✅ `npm run lint` passes
2. ✅ `npm run build` succeeds
3. ✅ `npm run package` creates .vsix
4. ✅ Version bumped in `package.json`
5. ✅ `CHANGELOG.md` updated
6. ✅ README and docs updated
7. ✅ Icon is present at `images/icon.png`

## Common Issues

### Extension Not Loading
- Check output panel for error messages
- Verify `activationEvents` in `package.json`
- Ensure `main` points to correct file

### Commands Not Appearing
- Verify commands registered in `extension.ts`
- Check command IDs match `package.json`
- Reload VS Code window

### Build Fails
- Run `npm install` to ensure deps are installed
- Check TypeScript errors: `npm run build`
- Verify Node.js version matches requirements

## Performance Tips

1. **Lazy Loading**: Use activation events to defer loading
2. **Code Splitting**: Break large modules into smaller files
3. **Minimize Dependencies**: Reduce bundle size
4. **Async Operations**: Use promises/async-await properly
5. **Memory Management**: Clear references when done

## Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [VS Code Best Practices](https://code.visualstudio.com/api/working-with-extensions/testing-extension)

## Support

For issues or questions:
1. Check GitHub Issues
2. Review existing documentation
3. Create a new issue with detailed information
