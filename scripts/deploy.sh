#!/bin/bash

# Quick deployment script for AI Coding Assistant
# This script automates the deployment process

set -e

echo "🚀 AI Coding Assistant - Deployment Tool"
echo "========================================="
echo ""

# Check prerequisites
echo "✓ Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo "❌ git is not installed. Please install git"
    exit 1
fi

echo "✓ All prerequisites installed"
echo ""

# Get current version
VERSION=$(grep '"version"' package.json | head -1 | grep -oP '\K[0-9]+\.[0-9]+\.[0-9]+')
echo "Current version: $VERSION"
echo ""

# Menu
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
echo ""

read -p "Select an option (1-9): " choice

case $choice in
    1)
        echo "🔨 Building extension..."
        npm run clean
        npm run build
        echo "📦 Packaging extension..."
        npm run package
        echo "✓ Package created! Install with: code --install-extension *.vsix"
        ;;
    2)
        echo "✓ Installing dependencies..."
        npm install
        echo "🔍 Linting code..."
        npm run lint:fix
        echo "🔨 Building extension..."
        npm run build
        echo "✓ Ready for publishing!"
        ;;
    3)
        npm run publish:patch
        ;;
    4)
        npm run publish:minor
        ;;
    5)
        npm run publish:major
        ;;
    6)
        if [ -z "$VSCE_PAT" ]; then
            echo "❌ VSCE_PAT environment variable not set"
            echo "   export VSCE_PAT=your-token"
            exit 1
        fi
        echo "📤 Publishing to VS Code Marketplace..."
        npm run publish
        echo "✓ Published successfully!"
        ;;
    7)
        if [ -z "$OVSX_PAT" ]; then
            echo "❌ OVSX_PAT environment variable not set"
            echo "   export OVSX_PAT=your-token"
            exit 1
        fi
        echo "📤 Publishing to Open VSX Registry..."
        npm run publish:ovsx
        echo "✓ Published to Open VSX!"
        ;;
    8)
        echo "📋 Running full release process..."
        echo ""
        
        # Check if all changes are committed
        if ! git diff-index --quiet HEAD --; then
            echo "❌ Uncommitted changes exist. Please commit first:"
            git status
            exit 1
        fi
        
        # Lint and build
        echo "🔍 Linting..."
        npm run lint:fix
        echo "🔨 Building..."
        npm run build
        
        # Get new version
        read -p "What's the new version? (current: $VERSION): " NEW_VERSION
        
        # Update version
        npm version "$NEW_VERSION" --no-git-tag-version
        
        # Update CHANGELOG
        echo ""
        echo "📝 Don't forget to update CHANGELOG.md!"
        read -p "Press Enter after updating CHANGELOG.md..."
        
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
        ;;
    9)
        echo "📋 Checking deployment readiness..."
        echo ""
        
        checks=0
        pass=0
        
        # Check lint
        checks=$((checks + 1))
        if npm run lint > /dev/null 2>&1; then
            echo "✓ Linting passed"
            pass=$((pass + 1))
        else
            echo "❌ Linting failed"
        fi
        
        # Check build
        checks=$((checks + 1))
        if npm run build > /dev/null 2>&1; then
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
        
        # Check files
        checks=$((checks + 1))
        required_files=("README.md" "CHANGELOG.md" "LICENSE" "DEPLOYMENT.md" "package.json" "src/extension.ts")
        files_ok=true
        for file in "${required_files[@]}"; do
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
        
        if [ $pass -eq $checks ]; then
            echo "✅ Ready for deployment!"
            exit 0
        else
            echo "⚠️  Please fix the above issues before deploying"
            exit 1
        fi
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "✅ Done!"
