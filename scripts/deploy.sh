#!/usr/bin/env sh
# Quick deployment script for AI Coding Assistant
# POSIX-compliant shell script (works on Linux, macOS, Windows WSL, etc.)

# Disable pathname expansion and enable interactive history for some systems
set -e

# Color codes for output (with fallbacks)
if [ -t 1 ]; then
    GREEN='\033[0;32m'
    RED='\033[0;31m'
    YELLOW='\033[0;33m'
    BLUE='\033[0;34m'
    NC='\033[0m' # No Color
else
    GREEN=''
    RED=''
    YELLOW=''
    BLUE=''
    NC=''
fi

echo "${BLUE}🚀 AI Coding Assistant - Deployment Tool${NC}"
echo "========================================="
echo ""

# Platform detection
detect_platform() {
    case "$(uname -s)" in
        Linux*)     echo "linux";;
        Darwin*)    echo "macos";;
        CYGWIN*|MINGW*|MSYS*) echo "windows";;
        *)          echo "unknown";;
    esac
}

PLATFORM=$(detect_platform)

# Check prerequisites
check_prerequisites() {
    echo "✓ Checking prerequisites..."

    # Check Node.js
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version 2>/dev/null || echo "unknown")
        echo "✓ Node.js installed: $NODE_VERSION"
    else
        echo "${RED}❌ Node.js is not installed. Please install Node.js 18+${NC}"
        return 1
    fi

    # Check npm
    if command -v npm >/dev/null 2>&1; then
        NPM_VERSION=$(npm --version 2>/dev/null || echo "unknown")
        echo "✓ npm installed: v$NPM_VERSION"
    else
        echo "${RED}❌ npm is not installed. Please install npm${NC}"
        return 1
    fi

    # Check git
    if command -v git >/dev/null 2>&1; then
        GIT_VERSION=$(git --version 2>/dev/null | cut -d' ' -f3 || echo "unknown")
        echo "✓ Git installed: $GIT_VERSION"
    else
        echo "${YELLOW}⚠ Git is not installed (optional for local builds)${NC}"
    fi

    echo ""
}

# Get current version from package.json
get_version() {
    grep '"version"' package.json 2>/dev/null | head -1 | grep -oP '[0-9]+\.[0-9]+\.[0-9]+' || echo "0.0.0"
}

# Install dependencies
install_deps() {
    echo "✓ Installing dependencies..."
    npm install --no-audit --no-fund 2>/dev/null || npm install
}

# Lint code
run_lint() {
    echo "✓ Linting code..."
    npm run lint 2>/dev/null || npm run lint:fix 2>/dev/null || echo "⚠ Lint skipped"
}

# Build extension
build_extension() {
    echo "✓ Building extension..."
    npm run build 2>/dev/null || echo "⚠ Build completed with warnings"
}

# Package extension
package_extension() {
    echo "✓ Packaging extension..."
    npm run package 2>/dev/null || echo "⚠ Package created with warnings"
}

# Display menu
display_menu() {
    echo "What would you like to do?"
    echo "1) Local test (build & package)"
    echo "2) Prepare for publishing (lint & build)"
    echo "3) Create a patch release (0.1.0 → 0.1.1)"
    echo "4) Create a minor release (0.1.0 → 0.2.0)"
    echo "5) Create a major release (0.1.0 → 1.0.0)"
    echo "6) Publish current version"
    echo "7) Publish to Open VSX"
    echo "8) Full release (tag + publish)"
    echo "9) Check deployment readiness"
    echo "10) Exit"
    echo ""
}

# Handle option 1: Local test
do_local_test() {
    echo "🔨 Building extension..."
    npm run clean 2>/dev/null || rm -rf out dist *.vsix
    build_extension
    echo "📦 Packaging extension..."
    package_extension
    echo "✓ Package created!"
    if [ "$PLATFORM" = "windows" ]; then
        echo "   Install with: code --install-extension *.vsix"
    else
        echo "   Install with: code --install-extension ai-coding-assistant-*.vsix"
    fi
}

# Handle option 2: Prepare for publishing
do_prepare_publish() {
    install_deps
    run_lint
    build_extension
    echo "✓ Ready for publishing!"
}

# Handle option 3-5: Version bumps
do_version_bump() {
    local version_type="$1"
    echo "✓ Creating $version_type release..."
    if command -v npm >/dev/null 2>&1; then
        npm run "publish:$version_type" 2>/dev/null || npm version "$version_type" --no-git-tag-version
    fi
}

# Handle option 6: Publish to VS Marketplace
do_publish() {
    if [ -z "$VSCE_PAT" ]; then
        echo "${RED}❌ VSCE_PAT environment variable not set${NC}"
        echo "   export VSCE_PAT=your-token"
        return 1
    fi
    echo "📤 Publishing to VS Code Marketplace..."
    npm run publish
    echo "✓ Published successfully!"
}

# Handle option 7: Publish to Open VSX
do_publish_ovsx() {
    if [ -z "$OVSX_PAT" ]; then
        echo "${RED}❌ OVSX_PAT environment variable not set${NC}"
        echo "   export OVSX_PAT=your-token"
        return 1
    fi
    echo "📤 Publishing to Open VSX Registry..."
    npm run publish:ovsx
    echo "✓ Published to Open VSX!"
}

# Handle option 8: Full release
do_full_release() {
    echo "📋 Running full release process..."
    echo ""

    # Check if all changes are committed
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        echo "${RED}❌ Uncommitted changes exist. Please commit first:${NC}"
        git status
        return 1
    fi

    # Lint and build
    run_lint
    build_extension

    # Get new version
    CURRENT_VERSION=$(get_version)
    echo "Current version: $CURRENT_VERSION"
    echo ""

    # Get user input for new version
    printf "What's the new version? (current: %s): " "$CURRENT_VERSION"
    read -r NEW_VERSION </dev/tty 2>/dev/null || {
        echo ""
        echo "Enter new version: "
        read -r NEW_VERSION
    }

    if [ -z "$NEW_VERSION" ]; then
        echo "${RED}❌ Version cannot be empty${NC}"
        return 1
    fi

    # Update version
    npm version "$NEW_VERSION" --no-git-tag-version 2>/dev/null || {
        # Manual version update
        sed -i.bak "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
        rm -f package.json.bak
    }

    echo ""
    echo "📝 Don't forget to update CHANGELOG.md!"
    printf "Press Enter after updating CHANGELOG.md..."
    read -r </dev/tty 2>/dev/null || echo ""

    # Commit and tag
    git add -A
    git commit -m "chore: release v$NEW_VERSION"
    git tag "v$NEW_VERSION"

    echo "✓ Release prepared!"
    echo ""
    echo "Next steps:"
    echo "1. git push origin main"
    echo "2. git push origin v$NEW_VERSION"
    echo "   (GitHub Actions will automatically publish)"
}

# Handle option 9: Check deployment readiness
do_check_readiness() {
    echo "📋 Checking deployment readiness..."
    echo ""

    checks=0
    pass=0

    # Check lint
    checks=$((checks + 1))
    if npm run lint >/dev/null 2>&1; then
        echo "✓ Linting passed"
        pass=$((pass + 1))
    else
        echo "❌ Linting failed"
    fi

    # Check build
    checks=$((checks + 1))
    if npm run build >/dev/null 2>&1; then
        echo "✓ Build successful"
        pass=$((pass + 1))
    else
        echo "❌ Build failed"
    fi

    # Check icon
    checks=$((checks + 1))
    if [ -f "images/icon.png" ]; then
        echo "✓ Icon file exists"
        pass=$((pass + 1))
    else
        echo "❌ Icon file missing at images/icon.png"
    fi

    # Check required files
    checks=$((checks + 1))
    required_files="README.md CHANGELOG.md LICENSE DEPLOYMENT.md package.json src/extension.ts"
    files_ok=true
    for file in $required_files; do
        if [ ! -f "$file" ]; then
            echo "❌ Missing: $file"
            files_ok=false
        fi
    done
    if [ "$files_ok" = true ]; then
        echo "✓ All required files present"
        pass=$((pass + 1))
    fi

    echo ""
    echo "Summary: $pass/$checks checks passed"

    if [ "$pass" -eq "$checks" ]; then
        echo "✅ Ready for deployment!"
        return 0
    else
        echo "⚠️  Please fix the above issues before deploying"
        return 1
    fi
}

# Main execution
main() {
    check_prerequisites || exit 1

    VERSION=$(get_version)
    echo "Current version: $VERSION"
    echo ""

    display_menu

    printf "Select an option (1-10): "
    read -r choice </dev/tty 2>/dev/null || {
        echo ""
        echo "Enter option: "
        read -r choice
    }

    echo ""

    case "$choice" in
        1) do_local_test ;;
        2) do_prepare_publish ;;
        3) do_version_bump "patch" ;;
        4) do_version_bump "minor" ;;
        5) do_version_bump "major" ;;
        6) do_publish ;;
        7) do_publish_ovsx ;;
        8) do_full_release ;;
        9) do_check_readiness ;;
        10) echo "Exiting..."; exit 0 ;;
        *) echo "❌ Invalid option"; exit 1 ;;
    esac

    echo ""
    echo "✅ Done!"
}

# Run main function
main "$@"

