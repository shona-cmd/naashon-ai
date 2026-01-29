#!/bin/bash

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                                                                              ║
# ║          🚀 AI CODING ASSISTANT - MARKETPLACE DEPLOYMENT READY 🚀            ║
# ║                                                                              ║
# ║                Your Extension is Built and Ready to Publish!                 ║
# ║                                                                              ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                    ✨ DEPLOYMENT STATUS REPORT ✨                           ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

cd "/media/naashon/projects/naashon AI" 2>/dev/null || {
    echo "❌ Please run this script from the extension root directory"
    exit 1
}

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}📊 BUILD STATUS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check build status
if [ -f "out/extension.js" ]; then
    SIZE=$(du -h out/extension.js | cut -f1)
    echo -e "${GREEN}✅ Extension built:${NC} out/extension.js ($SIZE)"
else
    echo "❌ Extension not built"
    exit 1
fi

if [ -f "images/icon.png" ]; then
    ICON_SIZE=$(du -h images/icon.png | cut -f1)
    echo -e "${GREEN}✅ Icon created:${NC} images/icon.png ($ICON_SIZE)"
fi

# Check for VSIX
VSIX_FILE=$(ls -t *.vsix 2>/dev/null | head -1)
if [ -f "$VSIX_FILE" ]; then
    VSIX_SIZE=$(du -h "$VSIX_FILE" | cut -f1)
    echo -e "${GREEN}✅ Package ready:${NC} $VSIX_FILE ($VSIX_SIZE)"
else
    echo "❌ Package not found"
    exit 1
fi

echo ""
echo -e "${BLUE}📦 EXTENSION DETAILS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PUBLISHER=$(grep '"publisher"' package.json | sed 's/.*"publisher": "\([^"]*\)".*/\1/')
VERSION=$(grep '"version"' package.json | sed 's/.*"version": "\([^"]*\)".*/\1/')
DISPLAY_NAME=$(grep '"displayName"' package.json | sed 's/.*"displayName": "\([^"]*\)".*/\1/')
DESCRIPTION=$(grep '"description"' package.json | sed 's/.*"description": "\([^"]*\)".*/\1/' | head -c 80)

echo "Extension: $DISPLAY_NAME"
echo "ID: $PUBLISHER.ai-coding-assistant"
echo "Version: $VERSION"
echo "Description: $DESCRIPTION..."
echo ""

echo -e "${BLUE}✨ FEATURES${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "  1. 💡 Generate Code - Create production-ready code from descriptions"
echo "  2. 📚 Explain Code - Understand complex code with AI (Ctrl+Shift+E)"
echo "  3. ♻️ Refactor Code - Improve code quality automatically (Ctrl+Shift+R)"
echo "  4. ⚡ Optimize Performance - Speed up algorithms (Ctrl+Shift+O)"
echo "  5. 📝 Add Comments - Auto-generate professional documentation (Ctrl+Shift+C)"
echo ""

echo -e "${BLUE}🎨 DESIGN${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "  • Modern gradient UI (Purple → Pink)"
echo "  • Smooth animations and transitions"
echo "  • Professional SVG icon"
echo "  • Dark theme optimized"
echo "  • Copy-to-clipboard button"
echo "  • Beautiful webview panel"
echo ""

echo -e "${BLUE}🚀 WHAT'S NEXT${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "To deploy to VS Code Marketplace:"
echo ""
echo "  Step 1: Create your accounts (if not done yet)"
echo "    → Microsoft: https://account.microsoft.com"
echo "    → Azure DevOps: https://dev.azure.com"
echo "    → Publisher: https://marketplace.visualstudio.com/manage/createpublisher"
echo ""
echo "  Step 2: Get a Personal Access Token (PAT)"
echo "    → https://dev.azure.com → User Settings → Personal access tokens"
echo "    → Select scope: Marketplace (Manage, Acquire, Publish)"
echo "    → Copy token"
echo ""
echo "  Step 3: Run the deployment script"
echo "    → ./deploy.sh"
echo ""
echo "  Step 4: Follow the interactive menu"
echo "    → Select option 2: Login with PAT token"
echo "    → Select option 3: Publish to marketplace"
echo ""
echo "  Step 5: Done! 🎉"
echo "    → Your extension will appear on marketplace in 5-10 minutes"
echo ""

echo -e "${BLUE}📖 DOCUMENTATION${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "  📄 PUBLISH_NOW.md ......... Complete publishing guide"
echo "  📄 FINAL_CHECKLIST.md .... Pre-publication checklist"
echo "  📄 README.md .............. User-facing documentation"
echo "  📄 CHANGELOG.md ........... Version history"
echo ""

echo -e "${BLUE}💰 MONETIZATION MODEL${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "  ✅ Extension is FREE on marketplace (smart choice!)"
echo ""
echo "  💡 Recommended monetization:"
echo "    • Keep core features free"
echo "    • Sell premium via website (Gumroad, Stripe, Paddle)"
echo "    • Offer subscription for advanced features"
echo "    • Use GitHub Sponsors for donations"
echo ""
echo "  This approach:"
echo "    → Maximizes downloads"
echo "    → Builds user base"
echo "    → Enables premium conversions"
echo "    → No marketplace complications"
echo ""

echo -e "${BLUE}🎯 QUICK COMMANDS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "  Interactive deployment:"
echo "    → ./deploy.sh"
echo ""
echo "  Manual commands:"
echo "    → npm run build              # Rebuild"
echo "    → npm run package            # Create .vsix"
echo "    → vsce login naashon         # Login with PAT"
echo "    → vsce publish               # Publish"
echo "    → vsce show naashon.ai-coding-assistant  # View listing"
echo ""

echo -e "${BLUE}🌐 MARKETPLACE LINKS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "  Your future listing:"
echo "  https://marketplace.visualstudio.com/items?itemName=$PUBLISHER.ai-coding-assistant"
echo ""
echo "  Publisher dashboard:"
echo "  https://marketplace.visualstudio.com/manage/publishers/$PUBLISHER"
echo ""

echo -e "${GREEN}✅ YOUR EXTENSION IS READY TO PUBLISH!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next step: Run './deploy.sh' to begin publishing"
echo ""
echo "Good luck! 🚀 Your AI extension is about to reach thousands of developers!"
echo ""
