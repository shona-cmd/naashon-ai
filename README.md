# 🚀 AI Coding Assistant

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-GitHub-blue?style=flat-square&logo=github)](https://github.com/sponsors/naashon)
[![Visual Studio Marketplace](https://img.shields.io/visual-studio-marketplace/v/naashon.ai-coding-assistant?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=naashon.ai-coding-assistant)
[![Open VSX](https://img.shields.io/badge/Open%20VSX-Extension-purple?style=flat-square)](https://open-vsx.org/extension/naashon/ai-coding-assistant)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/shona-cmd/naashon-ai?style=flat-square&logo=github)](https://github.com/shona-cmd/naashon-ai/stargazers)

**An intelligent, feature-rich AI-powered coding assistant for VS Code** that accelerates your development workflow. Generate, explain, refactor, and optimize code using advanced AI models—all within your editor.

> 💡 **Turn your coding ideas into production-ready code in seconds!**

---

## ✨ Key Features

### 💡 Generate Code
Write clean, production-ready code from natural language descriptions
- Describe what you need → Get working code instantly
- Supports any programming language (Python, JavaScript, TypeScript, Java, C++, etc.)
- Context-aware and best-practice focused
- **Shortcut**: `Ctrl+Shift+G` (Windows/Linux) | `Cmd+Shift+G` (Mac)

### 📚 Explain Code  
Understand complex code with detailed, clear explanations
- Select any code → Get instant explanation
- Line-by-line breakdown and purpose
- Built-in examples and use cases
- Beautiful webview interface with syntax highlighting
- **Shortcut**: `Ctrl+Shift+E` | `Cmd+Shift+E`

### ♻️ Refactor Code
Improve code quality automatically
- Best practices applied instantly
- Readability enhancements
- Performance optimization suggestions
- Maintains functionality while improving style
- **Shortcut**: `Ctrl+Shift+R` | `Cmd+Shift+R`

### ⚡ Optimize Performance
Make your code faster and more efficient
- Algorithm optimization recommendations
- Memory efficiency improvements
- Time complexity analysis
- Alternative method suggestions
- **Shortcut**: `Ctrl+Shift+O` | `Cmd+Shift+O`

### 📝 Add Comments
Generate professional documentation automatically
- Comprehensive function documentation
- Complex logic explanation
- Industry-standard comment format
- JSDoc/DocString format support
- **Shortcut**: `Ctrl+Shift+C` | `Cmd+Shift+C`

### 🎨 Beautiful Interface
Modern, intuitive, and responsive design
- Gradient-based UI (Purple → Pink theme)
- Dark theme optimized
- Smooth animations and transitions
- Copy-to-clipboard functionality
- Professional styling

---

## 🚀 Quick Start

### Installation

#### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "AI Coding Assistant"
4. Click **Install**

#### From Open VSX
1. Open VS Code Extensions
2. Search for "naashon.ai-coding-assistant"
3. Click **Install**

#### From GitHub
```bash
git clone https://github.com/shona-cmd/naashon-ai.git
cd naashon-ai
npm install
npm run build
npm run package  # Creates .vsix file
# Then install the .vsix in VS Code
```

### Setup API Key

1. Open VS Code Settings (Cmd+, / Ctrl+,)
2. Search for "AI Coding Assistant"
3. Enter your OpenAI API key in the settings
4. Optionally customize:
   - **Model**: Choose from gpt-3.5-turbo, gpt-4, etc.
   - **Temperature**: Adjust creativity (0.0-1.0)

**Get your API key**: https://platform.openai.com/api-keys

---

## ⌨️ Keyboard Shortcuts

| Feature | Windows/Linux | Mac |
|---------|--------------|-----|
| Generate Code | `Ctrl+Shift+G` | `Cmd+Shift+G` |
| Explain Code | `Ctrl+Shift+E` | `Cmd+Shift+E` |
| Refactor Code | `Ctrl+Shift+R` | `Cmd+Shift+R` |
| Optimize Performance | `Ctrl+Shift+O` | `Cmd+Shift+O` |
| Add Comments | `Ctrl+Shift+C` | `Cmd+Shift+C` |

**All shortcuts are customizable** in VS Code settings!

---

## 📖 Usage Examples

### Generate Code
Select text or place cursor, press `Ctrl+Shift+G`, type your request:
```
"Create a function that validates email addresses"
```
→ Get a complete, working function

### Explain Code
Select any code snippet and press `Ctrl+Shift+E`:
```javascript
const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};
```
→ Get a clear explanation of what this code does

### Refactor Code
Select messy code, press `Ctrl+Shift+R`:
```python
# Before: Inefficient code
for i in range(len(arr)):
    for j in range(len(arr)):
        if arr[i] > arr[j]:
            temp = arr[i]
            arr[i] = arr[j]
            arr[j] = temp
```
→ Get optimized, clean version

---

## ⚙️ Configuration

### API Configuration
```json
{
  "ai-coding-assistant.apiKey": "sk-...",
  "ai-coding-assistant.model": "gpt-3.5-turbo",
  "ai-coding-assistant.temperature": 0.7
}
```

### Available Models
- `gpt-3.5-turbo` (Recommended - fast & efficient)
- `gpt-4` (Most capable)
- `gpt-4-turbo-preview` (Latest features)

### Temperature Setting
- **0.0-0.3**: Precise, deterministic
- **0.5-0.7**: Balanced (recommended)
- **0.8-1.0**: Creative, varied

---

## 🎯 Supported Languages

Python • JavaScript • TypeScript • Java • C++ • C# • Go • Rust • PHP • Ruby • Swift • Kotlin • Scala • Haskell • R • MATLAB • SQL • HTML • CSS • JSON • YAML • XML • and many more!

---

## 💰 Support This Project

Love the extension? Support the development!

[![GitHub Sponsors](https://img.shields.io/badge/GitHub_Sponsors-FF69B4?style=flat-square&logo=github)](https://github.com/sponsors/naashon)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Yellow?style=flat-square&logo=ko-fi)](https://ko-fi.com/naashon)
[![Patreon](https://img.shields.io/badge/Patreon-FF424D?style=flat-square&logo=patreon)](https://patreon.com/naashon)

Your support helps us:
- ✅ Keep the extension maintained and updated
- ✅ Add new features and improvements
- ✅ Provide better support and documentation
- ✅ Cover hosting and infrastructure costs

👉 See [SPONSORS.md](SPONSORS.md) for all ways to support

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Report Bugs
Found an issue? [Open an issue](https://github.com/shona-cmd/naashon-ai/issues)

### Suggest Features
Have an idea? [Start a discussion](https://github.com/shona-cmd/naashon-ai/discussions)

### Submit Code
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit (`git commit -m 'Add amazing feature'`)
5. Push (`git push origin feature/amazing-feature`)
6. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 📚 Documentation

- [Quick Start Guide](DEPLOY_GUIDE.txt)
- [Contributing Guide](CONTRIBUTING.md)
- [Development Guide](DEVELOPMENT.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Premium Features](PREMIUM_FEATURES.md)

---

## 🏗️ Architecture

```
naashon-ai/
├── src/
│   ├── extension.ts         # Main entry point
│   ├── assistant.ts         # Core AI logic
│   ├── services/
│   │   ├── aiService.ts     # AI API integration
│   │   └── multiModelService.ts  # Multi-model support
│   └── test/                # Test suite
├── out/                     # Compiled JavaScript
├── package.json             # Extension manifest
├── README.md                # This file
└── LICENSE                  # MIT License
```

---

## 📊 Version History

### v0.2.0 (Latest)
- ✨ Added Performance Optimization feature
- ✨ Added Auto-Comments generation
- 🎨 Beautiful gradient UI (Purple → Pink)
- 🎨 Professional SVG icon
- ✅ 5 keyboard shortcuts
- ✅ Context menu integration

### v0.1.0
- 🚀 Initial release
- 💡 Generate Code
- 📚 Explain Code  
- ♻️ Refactor Code
- 🎨 Beautiful webview interface

See [CHANGELOG.md](CHANGELOG.md) for full history.

---

## ⚖️ License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

---

## 🙋 Support & Community

- 💬 **Discussions**: [GitHub Discussions](https://github.com/shona-cmd/naashon-ai/discussions)
- 🐛 **Issues**: [Report bugs here](https://github.com/shona-cmd/naashon-ai/issues)
- 💌 **Email**: Contact via GitHub profile
- 💖 **Sponsor**: [Support development](SPONSORS.md)

---

## ✅ Security

- ✅ Your API key is stored locally in VS Code settings
- ✅ No data sent to third parties (except OpenAI for API calls)
- ✅ Open source - code is fully transparent
- ✅ MIT Licensed - free to audit and modify

---

## 🙏 Acknowledgments

Built with ❤️ using:
- VS Code Extension API
- OpenAI's GPT models
- TypeScript
- Node.js

---

## 🚀 Roadmap

### Planned Features
- [ ] Support for multiple AI models (Claude, Gemini, Ollama)
- [ ] Code diff viewer
- [ ] Unit test generation
- [ ] Bug detection and fixes
- [ ] AI chat interface
- [ ] Code review assistant
- [ ] Performance metrics

### Future Plans
- Premium tier with unlimited API calls
- Enterprise features
- Team collaboration tools
- Custom model support

---

<div align="center">

### Made with ❤️ by Naashon

⭐ **[Star this repository](https://github.com/shona-cmd/naashon-ai)** if you find it useful!

[Install from Marketplace](https://marketplace.visualstudio.com/items?itemName=naashon.ai-coding-assistant) • [Open VSX](https://open-vsx.org/extension/naashon/ai-coding-assistant) • [GitHub](https://github.com/shona-cmd/naashon-ai)

</div>

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
