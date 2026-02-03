#!/usr/bin/env sh
# Quick Start: Publish Your Extension
# POSIX-compliant shell script (works on Linux, macOS, Windows WSL, etc.)

# Detect if running in a terminal that supports colors
if [ -t 1 ]; then
    BLUE='\033[0;34m'
    GREEN='\033[0;32m'
    YELLOW='\033[0;33m'
    NC='\033[0m' # No Color
else
    BLUE=''
    GREEN=''
    YELLOW=''
    NC=''
fi

echo "${BLUE}🚀 AI Coding Assistant - Quick Deploy${NC}"
echo "===================================="
echo ""
echo "Your extension is ready to deploy! Follow these steps:"
echo ""
echo "STEP 1: Get Your API Tokens"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Create Azure DevOps account:"
echo "   👉 https://dev.azure.com"
echo ""
echo "2. Create Personal Access Token (PAT):"
echo "   - Go to: Personal access tokens"
echo "   - Create token with 'Marketplace (manage)' scope"
echo "   - Save your token (you'll need it)"
echo ""
echo "3. Register Publisher on VS Code Marketplace:"
echo "   - Go to: https://marketplace.visualstudio.com"
echo "   - Click 'Publish extensions'"
echo "   - Sign in and create publisher 'naashon'"
echo ""
echo "STEP 2: Setup GitHub Secrets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Go to your GitHub repo:"
echo "   👉 https://github.com/naashon/ai-coding-assistant"
echo ""
echo "2. Settings → Secrets and variables → Actions"
echo ""
echo "3. Add new secrets:"
echo "   - VSCE_PAT: (your VS Code token)"
echo "   - OVSX_PAT: (optional, for Open VSX)"
echo ""
echo "STEP 3: Test Locally"
echo "━━━━━━━━━━━━━━━━━"
echo "Run: npm run package"
echo "Then: code --install-extension ai-coding-assistant-*.vsix"
echo ""
echo "STEP 4: Create Release"
echo "━━━━━━━━━━━━━━━━━"
echo "Option A - Automated (Recommended):"
echo "  git tag v0.1.0"
echo "  git push origin v0.1.0"
echo "  ✓ GitHub Actions handles the rest!"
echo ""
echo "Option B - Manual:"
echo "  npm run publish:patch"
echo "  npm run publish:minor"
echo "  npm run publish:major"
echo ""
echo "STEP 5: Verify"
echo "━━━━━━━━━━━━"
echo "After 1-2 hours, check marketplace:"
echo "👉 https://marketplace.visualstudio.com/items?itemName=naashon.ai-coding-assistant"
echo ""
echo "📚 Documentation:"
echo "  - Full guide: cat DEPLOYMENT.md"
echo "  - Checklist: cat DEPLOYMENT_CHECKLIST.md"
echo "  - Development: cat DEVELOPMENT.md"
echo ""
echo "❓ Need help?"
echo "  - Run: ./scripts/deploy.sh"
echo "  - For Windows: run deploy.ps1 in PowerShell"
echo "  - Check: https://code.visualstudio.com/api/working-with-extensions/publishing-extension"
echo ""
echo "🎉 Good luck with your extension!"

