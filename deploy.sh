#!/usr/bin/env sh
# 🚀 AI Coding Assistant - Marketplace Deployment Script
# POSIX-compliant version (works on Linux, macOS, Windows WSL)

# Exit on error
set -e

# Color codes with fallbacks
if [ -t 1 ]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    NC='\033[0m' # No Color
else
    RED=''
    GREEN=''
    YELLOW=''
    BLUE=''
    NC=''
fi

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                    🚀 VS CODE MARKETPLACE DEPLOYMENT 🚀                      ║"
echo "║              AI Coding Assistant - One-Click Publishing Setup                ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Get value from package.json field (POSIX-compatible)
get_package_field() {
    field="$1"
    grep "\"$field\"" package.json | sed 's/.*"'"$field"'"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' | head -1
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this script from the extension root directory"
    exit 1
fi

echo "${BLUE}📋 Pre-Flight Checklist${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check requirements
echo ""
echo "Checking requirements..."

if ! command -v node >/dev/null 2>&1; then
    echo "${RED}❌ Node.js not found${NC}"
    exit 1
fi
echo "${GREEN}✅ Node.js${NC} $(node --version)"

if ! command -v npm >/dev/null 2>&1; then
    echo "${RED}❌ npm not found${NC}"
    exit 1
fi
echo "${GREEN}✅ npm${NC} $(npm --version)"

if ! npm list vsce >/dev/null 2>&1; then
    echo "${YELLOW}⚠️  Installing vsce...${NC}"
    npm install --save-dev @vscode/vsce
fi
echo "${GREEN}✅ vsce${NC} installed"

# Check if built
if [ ! -f "out/extension.js" ]; then
    echo ""
    echo "${YELLOW}⚠️  Extension not built yet${NC}"
    echo "Building now..."
    npm run esbuild-base
    echo "${GREEN}✅ Build complete${NC}"
fi

echo ""
echo "${GREEN}✅ All pre-flight checks passed!${NC}"

# Main menu
while true; do
    echo ""
    echo "${BLUE}🎯 What would you like to do?${NC}"
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

    printf "Enter your choice (1-8): "
    read -r choice </dev/tty 2>/dev/null || {
        echo ""
        printf "Enter your choice: "
        read -r choice
    }

    echo ""

    case "$choice" in
        1)
            echo ""
            echo "${BLUE}📦 Creating .vsix package...${NC}"
            npm run package
            VSIX_FILE=$(ls -t *.vsix 2>/dev/null | head -1)
            if [ -f "$VSIX_FILE" ]; then
                SIZE=$(du -h "$VSIX_FILE" | cut -f1)
                echo "${GREEN}✅ Package created:${NC} $VSIX_FILE ($SIZE)"
                echo ""
                echo "${YELLOW}Next steps:${NC}"
                echo "  • Option A: Use 'vsce publish' to upload (recommended)"
                echo "  • Option B: Upload manually to marketplace"
            fi
            ;;

        2)
            echo ""
            echo "${BLUE}🔐 Marketplace Login${NC}"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo ""
            echo "${YELLOW}You need a Personal Access Token (PAT) from Azure DevOps${NC}"
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
            printf "Do you have your PAT token ready? (y/n): "
            read -r has_token </dev/tty 2>/dev/null || read -r has_token

            if [ "$has_token" = "y" ] || [ "$has_token" = "Y" ]; then
                PUBLISHER=$(get_package_field "publisher")
                printf "Enter your publisher ID [%s]: " "$PUBLISHER"
                read -r pub_input </dev/tty 2>/dev/null || read -r pub_input
                PUBLISHER="${pub_input:-$PUBLISHER}"

                echo ""
                echo "Logging in as publisher: $PUBLISHER"
                npx vsce login "$PUBLISHER"
                echo "${GREEN}✅ Login successful!${NC}"
            fi
            ;;

        3)
            echo ""
            echo "${BLUE}🚀 Publishing to Marketplace${NC}"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo ""

            PUBLISHER=$(get_package_field "publisher")
            VERSION=$(get_package_field "version")
            DISPLAY_NAME=$(get_package_field "displayName")

            echo "${YELLOW}Publishing Details:${NC}"
            echo "  Publisher: $PUBLISHER"
            echo "  Name: $DISPLAY_NAME"
            echo "  Version: $VERSION"
            echo ""

            printf "Publish %s v%s? (y/n): " "$DISPLAY_NAME" "$VERSION"
            read -r confirm </dev/tty 2>/dev/null || read -r confirm

            if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
                echo ""
                echo "${YELLOW}Starting publish...${NC}"
                npx vsce publish

                echo ""
                echo "${GREEN}✅ Published successfully!${NC}"
                echo ""
                echo "${YELLOW}Your extension is now on the marketplace!${NC}"
                echo "📍 It may take 5-10 minutes to appear in search"
                echo "🔗 View it at:"
                echo "   https://marketplace.visualstudio.com/items?itemName=$PUBLISHER.ai-coding-assistant"
            else
                echo "${YELLOW}Publish cancelled${NC}"
            fi
            ;;

        4)
            echo ""
            PUBLISHER=$(get_package_field "publisher")
            URL="https://marketplace.visualstudio.com/items?itemName=$PUBLISHER.ai-coding-assistant"
            echo "${BLUE}📍 Your Marketplace Listing${NC}"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo ""
            echo "🔗 $URL"
            echo ""
            printf "Open in browser? (y/n): "
            read -r open_browser </dev/tty 2>/dev/null || read -r open_browser

            if [ "$open_browser" = "y" ] || [ "$open_browser" = "Y" ]; then
                if command -v xdg-open >/dev/null 2>&1; then
                    xdg-open "$URL"
                elif command -v open >/dev/null 2>&1; then
                    open "$URL"
                elif command -v start >/dev/null 2>&1; then
                    start "$URL"
                else
                    echo "Please open this URL manually: $URL"
                fi
            fi
            ;;

        5)
            echo ""
            echo "${BLUE}📝 Publishing Guide${NC}"
            if [ -f "PUBLISH_NOW.md" ]; then
                cat PUBLISH_NOW.md
            else
                echo "PUBLISH_NOW.md not found"
            fi
            ;;

        6)
            echo ""
            echo "${BLUE}🔄 Version Update & Publish${NC}"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo ""
            echo "  1) Patch version (0.2.0 → 0.2.1)"
            echo "  2) Minor version (0.2.0 → 0.3.0)"
            echo "  3) Major version (0.2.0 → 1.0.0)"
            echo "  4) Cancel"
            echo ""
            printf "Choose version bump (1-4): "
            read -r version_choice </dev/tty 2>/dev/null || read -r version_choice

            case "$version_choice" in
                1)
                    echo "${YELLOW}Bumping patch version...${NC}"
                    npm run publish:patch
                    ;;
                2)
                    echo "${YELLOW}Bumping minor version...${NC}"
                    npm run publish:minor
                    ;;
                3)
                    echo "${YELLOW}Bumping major version...${NC}"
                    npm run publish:major
                    ;;
                *)
                    echo "${YELLOW}Cancelled${NC}"
                    ;;
            esac
            ;;

        7)
            echo ""
            echo "${BLUE}📊 Extension Information${NC}"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo ""

            PUBLISHER=$(get_package_field "publisher")
            VERSION=$(get_package_field "version")
            DISPLAY_NAME=$(get_package_field "displayName")
            DESCRIPTION=$(get_package_field "description")

            echo "📦 Extension: $DISPLAY_NAME"
            echo "🏷️  ID: $PUBLISHER.ai-coding-assistant"
            echo "📌 Version: $VERSION"
            echo "📝 Description: $DESCRIPTION"
            echo ""

            if [ -f "out/extension.js" ]; then
                SIZE=$(du -h out/extension.js | cut -f1)
                echo "${GREEN}✅ Built:${NC} out/extension.js ($SIZE)"
            else
                echo "${RED}❌ Not built:${NC} Run 'npm run build' first"
            fi

            if [ -f "images/icon.png" ]; then
                ICON_SIZE=$(du -h images/icon.png | cut -f1)
                echo "${GREEN}✅ Icon:${NC} images/icon.png ($ICON_SIZE)"
            fi

            VSIX_FILE=$(ls -t *.vsix 2>/dev/null | head -1)
            if [ -f "$VSIX_FILE" ]; then
                VSIX_SIZE=$(du -h "$VSIX_FILE" | cut -f1)
                echo "${GREEN}✅ Package:${NC} $VSIX_FILE ($VSIX_SIZE)"
            fi
            echo ""
            ;;

        8)
            echo ""
            echo "${GREEN}👋 Thank you for publishing! Good luck with your extension! 🚀${NC}"
            exit 0
            ;;

        *)
            echo "${RED}Invalid choice. Please try again.${NC}"
            ;;
    esac
done

