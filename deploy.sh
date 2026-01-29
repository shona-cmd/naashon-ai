#!/bin/bash

# 🚀 AI Coding Assistant - Marketplace Deployment Script
# This script guides you through publishing to VS Code Marketplace

set -e

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                    🚀 VS CODE MARKETPLACE DEPLOYMENT 🚀                      ║"
echo "║              AI Coding Assistant - One-Click Publishing Setup                ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this script from the extension root directory"
    exit 1
fi

echo -e "${BLUE}📋 Pre-Flight Checklist${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check requirements
echo ""
echo -e "Checking requirements..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js${NC} $(node --version)"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm${NC} $(npm --version)"

if ! npm list vsce &> /dev/null; then
    echo -e "${YELLOW}⚠️  Installing vsce...${NC}"
    npm install --save-dev @vscode/vsce
fi
echo -e "${GREEN}✅ vsce${NC} installed"

# Check if built
if [ ! -f "out/extension.js" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Extension not built yet${NC}"
    echo "Building now..."
    npm run esbuild-base
    echo -e "${GREEN}✅ Build complete${NC}"
fi

echo ""
echo -e "${GREEN}✅ All pre-flight checks passed!${NC}"

# Main menu
while true; do
    echo ""
    echo -e "${BLUE}🎯 What would you like to do?${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "  1) 📦 Package extension (.vsix file)"
    echo "  2) 🔐 Login to marketplace (with PAT token)"
    echo "  3) 🚀 Publish to marketplace"
    echo "  4) 👀 View marketplace listing"
    echo "  5) 📝 Show publishing guide"
    echo "  6) 🔄 Update version and publish"
    echo "  7) 📊 Show extension info"
    echo "  8) ❌ Exit"
    echo ""
    read -p "Enter your choice (1-8): " choice

    case $choice in
        1)
            echo ""
            echo -e "${BLUE}📦 Creating .vsix package...${NC}"
            npm run package
            VSIX_FILE=$(ls -t *.vsix 2>/dev/null | head -1)
            if [ -f "$VSIX_FILE" ]; then
                SIZE=$(du -h "$VSIX_FILE" | cut -f1)
                echo -e "${GREEN}✅ Package created:${NC} $VSIX_FILE ($SIZE)"
                echo ""
                echo -e "${YELLOW}Next steps:${NC}"
                echo "  • Option A: Use 'vsce publish' to upload (recommended)"
                echo "  • Option B: Upload manually to marketplace"
            fi
            ;;

        2)
            echo ""
            echo -e "${BLUE}🔐 Marketplace Login${NC}"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo ""
            echo -e "${YELLOW}You need a Personal Access Token (PAT) from Azure DevOps${NC}"
            echo ""
            echo "Steps to get your PAT:"
            echo "  1. Go to: https://dev.azure.com"
            echo "  2. Sign in with Microsoft account"
            echo "  3. Click User Settings (top-right)"
            echo "  4. Select 'Personal access tokens'"
            echo "  5. Click '+ New Token'"
            echo "  6. Settings:"
            echo "     • Name: vsce-publisher-token"
            echo "     • Organization: Your organization"
            echo "     • Expiration: 1 year"
            echo "     • Scopes: Marketplace (Manage, Acquire, Publish)"
            echo "  7. Click Create and COPY the token"
            echo ""
            read -p "Do you have your PAT token ready? (y/n): " has_token

            if [ "$has_token" = "y" ] || [ "$has_token" = "Y" ]; then
                PUBLISHER=$(grep '"publisher"' package.json | sed 's/.*"publisher": "\([^"]*\)".*/\1/')
                read -p "Enter your publisher ID [$PUBLISHER]: " pub_input
                PUBLISHER="${pub_input:-$PUBLISHER}"

                echo ""
                echo "Logging in as publisher: $PUBLISHER"
                npx vsce login "$PUBLISHER"
                echo -e "${GREEN}✅ Login successful!${NC}"
            fi
            ;;

        3)
            echo ""
            echo -e "${BLUE}🚀 Publishing to Marketplace${NC}"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo ""

            PUBLISHER=$(grep '"publisher"' package.json | sed 's/.*"publisher": "\([^"]*\)".*/\1/')
            VERSION=$(grep '"version"' package.json | sed 's/.*"version": "\([^"]*\)".*/\1/')
            DISPLAY_NAME=$(grep '"displayName"' package.json | sed 's/.*"displayName": "\([^"]*\)".*/\1/')

            echo -e "${YELLOW}Publishing Details:${NC}"
            echo "  Publisher: $PUBLISHER"
            echo "  Name: $DISPLAY_NAME"
            echo "  Version: $VERSION"
            echo ""

            read -p "Publish $DISPLAY_NAME v$VERSION? (y/n): " confirm
            if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
                echo ""
                echo -e "${YELLOW}Starting publish...${NC}"
                npx vsce publish

                echo ""
                echo -e "${GREEN}✅ Published successfully!${NC}"
                echo ""
                echo -e "${YELLOW}Your extension is now on the marketplace!${NC}"
                echo "📍 It may take 5-10 minutes to appear in search"
                echo "🔗 View it at:"
                echo "   https://marketplace.visualstudio.com/items?itemName=$PUBLISHER.ai-coding-assistant"
            else
                echo -e "${YELLOW}Publish cancelled${NC}"
            fi
            ;;

        4)
            echo ""
            PUBLISHER=$(grep '"publisher"' package.json | sed 's/.*"publisher": "\([^"]*\)".*/\1/')
            URL="https://marketplace.visualstudio.com/items?itemName=$PUBLISHER.ai-coding-assistant"
            echo -e "${BLUE}📍 Your Marketplace Listing${NC}"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo ""
            echo "🔗 $URL"
            echo ""
            read -p "Open in browser? (y/n): " open_browser
            if [ "$open_browser" = "y" ] || [ "$open_browser" = "Y" ]; then
                if command -v xdg-open &> /dev/null; then
                    xdg-open "$URL"
                elif command -v open &> /dev/null; then
                    open "$URL"
                else
                    echo "Please open this URL manually: $URL"
                fi
            fi
            ;;

        5)
            echo ""
            echo -e "${BLUE}📝 Publishing Guide${NC}"
            if [ -f "PUBLISH_NOW.md" ]; then
                cat PUBLISH_NOW.md
            else
                echo "PUBLISH_NOW.md not found"
            fi
            ;;

        6)
            echo ""
            echo -e "${BLUE}🔄 Version Update & Publish${NC}"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo ""
            echo "  1) Patch version (0.2.0 → 0.2.1)"
            echo "  2) Minor version (0.2.0 → 0.3.0)"
            echo "  3) Major version (0.2.0 → 1.0.0)"
            echo "  4) Cancel"
            echo ""
            read -p "Choose version bump (1-4): " version_choice

            case $version_choice in
                1)
                    echo -e "${YELLOW}Bumping patch version...${NC}"
                    npm run publish:patch
                    ;;
                2)
                    echo -e "${YELLOW}Bumping minor version...${NC}"
                    npm run publish:minor
                    ;;
                3)
                    echo -e "${YELLOW}Bumping major version...${NC}"
                    npm run publish:major
                    ;;
                *)
                    echo -e "${YELLOW}Cancelled${NC}"
                    ;;
            esac
            ;;

        7)
            echo ""
            echo -e "${BLUE}📊 Extension Information${NC}"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo ""

            PUBLISHER=$(grep '"publisher"' package.json | sed 's/.*"publisher": "\([^"]*\)".*/\1/')
            VERSION=$(grep '"version"' package.json | sed 's/.*"version": "\([^"]*\)".*/\1/')
            DISPLAY_NAME=$(grep '"displayName"' package.json | sed 's/.*"displayName": "\([^"]*\)".*/\1/')
            DESCRIPTION=$(grep '"description"' package.json | sed 's/.*"description": "\([^"]*\)".*/\1/')

            echo "📦 Extension: $DISPLAY_NAME"
            echo "🏷️  ID: $PUBLISHER.ai-coding-assistant"
            echo "📌 Version: $VERSION"
            echo "📝 Description: $DESCRIPTION"
            echo ""

            if [ -f "out/extension.js" ]; then
                SIZE=$(du -h out/extension.js | cut -f1)
                echo -e "${GREEN}✅ Built:${NC} out/extension.js ($SIZE)"
            else
                echo -e "${RED}❌ Not built:${NC} Run 'npm run build' first"
            fi

            if [ -f "images/icon.png" ]; then
                ICON_SIZE=$(du -h images/icon.png | cut -f1)
                echo -e "${GREEN}✅ Icon:${NC} images/icon.png ($ICON_SIZE)"
            fi

            VSIX_FILE=$(ls -t *.vsix 2>/dev/null | head -1)
            if [ -f "$VSIX_FILE" ]; then
                VSIX_SIZE=$(du -h "$VSIX_FILE" | cut -f1)
                echo -e "${GREEN}✅ Package:${NC} $VSIX_FILE ($VSIX_SIZE)"
            fi
            echo ""
            ;;

        8)
            echo ""
            echo -e "${GREEN}👋 Thank you for publishing! Good luck with your extension! 🚀${NC}"
            exit 0
            ;;

        *)
            echo -e "${RED}Invalid choice. Please try again.${NC}"
            ;;
    esac
done
