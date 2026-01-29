# AI Coding Assistant

An intelligent, feature-rich AI-powered coding assistant extension for VS Code that accelerates your development workflow. Generate, explain, and refactor code using advanced AI models with a single keystroke.

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-GitHub-blue?style=flat-square&logo=github)](https://github.com/sponsors/naashon)
[![Visual Studio Marketplace](https://img.shields.io/visual-studio-marketplace/v/naashon.ai-coding-assistant?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=naashon.ai-coding-assistant)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/naashon.ai-coding-assistant?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=naashon.ai-coding-assistant)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## ✨ Features

- **🚀 Generate Code** - Write code from natural language descriptions
  - Specify what you want, get clean, production-ready code
  - Supports any programming language
  - Context-aware suggestions

- **📚 Explain Code** - Understand complex code instantly
  - Detailed explanations in a beautiful webview panel
  - Line-by-line breakdown
  - Supports all languages
  - Modern UI with syntax highlighting

- **♻️ Refactor Code** - Improve code quality and performance
  - Best practices applied automatically
  - Readability improvements
  - Performance optimization suggestions

- **⚡ Optimize Performance** - Make your code faster
  - Algorithm optimization
  - Memory efficiency improvements
  - Complexity analysis
  - Built-in method suggestions

- **📝 Add Comments** - Document your code automatically
  - Comprehensive function documentation
  - Complex logic explanation
  - Industry-standard comment format
  - Line-by-line clarity

- **⌨️ Quick Keyboard Shortcuts** - All features at your fingertips
  - Fast access without mouse clicks
  - Customizable keybindings
  - Context-aware actions

- **🎨 Beautiful Interface** - Modern, intuitive UI
  - Gradient-based design
  - Dark theme optimized
  - Responsive webview panels
  - Smooth animations

## 🚀 Quick Start

### Installation

1. Open VS Code
2. Press `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (Mac)
3. Search for "AI Coding Assistant"
4. Click "Install"

### Setup

1. Get your API key from [OpenAI Platform](https://platform.openai.com/account/api-keys)
2. Open VS Code Settings (`Ctrl+,` or `Cmd+,`)
3. Search for "AI Coding Assistant"
4. Paste your API key in the settings field

### Usage Examples

#### Generate Code
```
1. Press Ctrl+Shift+G (or Cmd+Shift+G)
2. Type: "Create a function to validate email addresses"
3. Get instant, production-ready code
```

#### Explain Code
```
1. Select any code snippet
2. Run: "AI: Explain Code" from command palette
3. View detailed explanation in side panel
```

#### Refactor Code
```
1. Select code you want to improve
2. Run: "AI: Refactor Code" from command palette
3. Get optimized, cleaner code
```

## ⌨️ Keyboard Shortcuts

| Feature | Windows/Linux | macOS |
|---------|--------------|-------|
| Generate Code | `Ctrl+Shift+G` | `Cmd+Shift+G` |
| Explain Code | `Ctrl+Shift+E` | `Cmd+Shift+E` |
| Refactor Code | `Ctrl+Shift+R` | `Cmd+Shift+R` |
| Optimize Performance | `Ctrl+Shift+O` | `Cmd+Shift+O` |
| Add Comments | `Ctrl+Shift+C` | `Cmd+Shift+C` |

**Tip:** Select code first for Explain, Refactor, Optimize, and Add Comments features!

## 🔧 Configuration

Open VS Code Settings and search for "AI Coding Assistant":

```json
{
  "ai-coding-assistant.apiKey": "sk-...",
  "ai-coding-assistant.model": "gpt-3.5-turbo",
  "ai-coding-assistant.temperature": 0.7
}
```

### Options

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `apiKey` | string | "" | Your OpenAI or compatible API key |
| `model` | string | "gpt-3.5-turbo" | AI model: gpt-3.5-turbo, gpt-4, etc. |
| `temperature` | number | 0.7 | Creativity (0.0-1.0) - lower = more focused, higher = more creative |

## 📋 Commands

Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac) to open command palette:

- **AI: Generate Code** (Ctrl+Shift+G) - Generate code from description
- **AI: Explain Code** (Ctrl+Shift+E) - Get explanation of selected code
- **AI: Refactor Code** (Ctrl+Shift+R) - Refactor selected code
- **AI: Optimize Performance** (Ctrl+Shift+O) - Optimize code performance
- **AI: Add Comments** (Ctrl+Shift+C) - Add documentation comments

**Context Menu Access:** All commands are also available in the right-click context menu!

## 💡 Tips & Tricks

- **Be specific** in your descriptions for better results
- **Context matters** - more details = better code
- **Experiment with temperature** - adjust for your needs:
  - 0.3-0.5: More focused, consistent outputs
  - 0.7 (default): Balanced creativity and consistency
  - 0.9+: More creative, diverse responses
- **Combine features** - Generate → Optimize → Add Comments
- **Use context menu** - Right-click for quick access to all commands
- **Select strategically** - Select functions/methods for targeted improvements

## 🎓 Usage Examples

### Generate Code
```
1. Press Ctrl+Shift+G
2. Type: "Create a recursive function to calculate fibonacci numbers"
3. Get instant production-ready code!
```

### Explain Code
```
1. Select function/code block
2. Press Ctrl+Shift+E
3. Get beautiful explanation with examples
```

### Refactor & Optimize
```
1. Select your code
2. Press Ctrl+Shift+R for refactoring
3. Or Ctrl+Shift+O for performance optimization
4. Code gets improved automatically
```

### Add Comments
```
1. Select function or complex logic
2. Press Ctrl+Shift+C
3. Get professional documentation added
```

## 🔐 Security & Privacy

- Your API key is stored locally in VS Code settings
- All requests go directly to your chosen AI provider
- No code is sent to our servers
- Your code never leaves your machine

## 📊 Supported Languages

Works with any programming language including:
- JavaScript/TypeScript
- Python
- Java
- C/C++
- Go
- Rust
- SQL
- HTML/CSS
- And many more!

## 🐛 Troubleshooting

### "API key not configured"
→ Add your API key in VS Code settings

### "401 Unauthorized"
→ Verify your API key is correct and hasn't expired

### Command not responding
→ Check your internet connection and API key validity

### Extension not loading
→ Reload VS Code (Ctrl+Shift+P → Reload Window)

For more help, see [DEVELOPMENT.md](DEVELOPMENT.md)

## 📖 Documentation

- [Setup Guide](DEPLOYMENT.md) - Detailed setup instructions
- [Development Guide](DEVELOPMENT.md) - For contributors
- [Changelog](CHANGELOG.md) - Version history

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) for details

## � Support This Project

Love AI Coding Assistant? Consider supporting development!

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-GitHub-blue?style=flat-square&logo=github)](https://github.com/sponsors/naashon)
[![Ko-fi](https://img.shields.io/badge/Buy%20Me%20A-Coffee-yellow?style=flat-square&logo=ko-fi)](https://ko-fi.com/naashon)
[![Patreon](https://img.shields.io/badge/Support-Patreon-red?style=flat-square&logo=patreon)](https://patreon.com/naashon)

Your support helps us:
- Keep the project maintained and updated
- Add new features and improvements
- Provide better support and documentation
- Cover hosting and infrastructure costs

👉 **See [SPONSORS.md](SPONSORS.md) for all ways to support**

## �🙋 Support

- **Issues**: [GitHub Issues](https://github.com/naashon/ai-coding-assistant/issues)
- **Discussions**: [GitHub Discussions](https://github.com/naashon/ai-coding-assistant/discussions)
- **Feedback**: Share your thoughts and feature requests

## 🚀 What's Next?

Check out our roadmap in [CHANGELOG.md](CHANGELOG.md) for upcoming features!

---

**Made with ❤️ by Naashon**

[Star us on GitHub!](https://github.com/naashon/ai-coding-assistant) ⭐
