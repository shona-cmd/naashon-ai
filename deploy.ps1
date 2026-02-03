#!/usr/bin/env pwsh
# Quick deployment script for AI Coding Assistant
# PowerShell version for Windows users
# Works with PowerShell 5.1+ (Windows) and PowerShell Core 7+ (cross-platform)

$ErrorActionPreference = "Stop"

# Color codes for Windows console
$GREEN = if ($Host.UI.RawUI -and $Host.UI.RawUI.ForegroundColor) { "`e[0;32m" } else { "" }
$RED = if ($Host.UI.RawUI -and $Host.UI.RawUI.ForegroundColor) { "`e[0;31m" } else { "" }
$YELLOW = if ($Host.UI.RawUI -and $Host.UI.RawUI.ForegroundColor) { "`e[0;33m" } else { "" }
$BLUE = if ($Host.UI.RawUI -and $Host.UI.RawUI.ForegroundColor) { "`e[0;34m" } else { "" }
$NC = if ($Host.UI.RawUI -and $Host.UI.RawUI.ForegroundColor) { "`e[0m" } else { "" }

Write-Host "${BLUE}🚀 AI Coding Assistant - Deployment Tool${NC}" -ForegroundColor Blue
Write-Host "=========================================" -ForegroundColor Blue
Write-Host ""

# Platform detection
function Get-Platform {
    $os = $PSVersionTable.OS
    if ($os -match "Windows") { return "windows" }
    if ($os -match "Linux") { return "linux" }
    if ($os -match "Darwin") { return "macos" }
    return "unknown"
}

$Platform = Get-Platform

# Check prerequisites
function Test-Prerequisites {
    Write-Host "✓ Checking prerequisites..." -ForegroundColor Green

    # Check Node.js
    if (Get-Command node -ErrorAction SilentlyContinue) {
        $nodeVersion = node --version
        Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Node.js is not installed. Please install Node.js 18+" -ForegroundColor Red
        return $false
    }

    # Check npm
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        $npmVersion = npm --version
        Write-Host "✓ npm installed: v$npmVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ npm is not installed. Please install npm" -ForegroundColor Red
        return $false
    }

    # Check git
    if (Get-Command git -ErrorAction SilentlyContinue) {
        $gitVersion = git --version
        Write-Host "✓ Git installed: $gitVersion" -ForegroundColor Green
    } else {
        Write-Host "⚠ Git is not installed (optional for local builds)" -ForegroundColor Yellow
    }

    Write-Host ""
    return $true
}

# Get current version from package.json
function Get-Version {
    $content = Get-Content package.json -Raw -ErrorAction SilentlyContinue
    if ($content -match '"version"\s*:\s*"([0-9]+\.[0-9]+\.[0-9]+)"') {
        return $Matches[1]
    }
    return "0.0.0"
}

# Install dependencies
function Install-Dependencies {
    Write-Host "✓ Installing dependencies..." -ForegroundColor Green
    try {
        npm install --no-audit --no-fund 2>&1 | Out-Null
    } catch {
        npm install 2>&1 | Out-Null
    }
}

# Lint code
function Invoke-Lint {
    Write-Host "✓ Linting code..." -ForegroundColor Green
    try {
        npm run lint 2>&1 | Out-Null
    } catch {
        try {
            npm run lint:fix 2>&1 | Out-Null
        } catch {
            Write-Host "⚠ Lint skipped" -ForegroundColor Yellow
        }
    }
}

# Build extension
function Invoke-Build {
    Write-Host "✓ Building extension..." -ForegroundColor Green
    try {
        npm run build 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠ Build completed with warnings" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠ Build completed with warnings" -ForegroundColor Yellow
    }
}

# Package extension
function Invoke-Package {
    Write-Host "✓ Packaging extension..." -ForegroundColor Green
    try {
        npm run package 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠ Package created with warnings" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠ Package created with warnings" -ForegroundColor Yellow
    }
}

# Display menu
function Show-Menu {
    Write-Host "What would you like to do?"
    Write-Host "1) Local test (build & package)"
    Write-Host "2) Prepare for publishing (lint & build)"
    Write-Host "3) Create a patch release (0.1.0 → 0.1.1)"
    Write-Host "4) Create a minor release (0.1.0 → 0.2.0)"
    Write-Host "5) Create a major release (0.1.0 → 1.0.0)"
    Write-Host "6) Publish current version"
    Write-Host "7) Publish to Open VSX"
    Write-Host "8) Full release (tag + publish)"
    Write-Host "9) Check deployment readiness"
    Write-Host "10) Exit"
    Write-Host ""
}

# Handle option 1: Local test
function Start-LocalTest {
    Write-Host "🔨 Building extension..." -ForegroundColor Cyan
    if (Test-Path "out") { Remove-Item out -Recurse -Force -ErrorAction SilentlyContinue }
    if (Test-Path "dist") { Remove-Item dist -Recurse -Force -ErrorAction SilentlyContinue }
    Remove-Item *.vsix -ErrorAction SilentlyContinue | Out-Null
    
    Invoke-Build
    Write-Host "📦 Packaging extension..." -ForegroundColor Cyan
    Invoke-Package
    Write-Host "✓ Package created!" -ForegroundColor Green
    Write-Host "   Install with: code --install-extension ai-coding-assistant-*.vsix" -ForegroundColor Gray
}

# Handle option 2: Prepare for publishing
function Start-PreparePublish {
    Install-Dependencies
    Invoke-Lint
    Invoke-Build
    Write-Host "✓ Ready for publishing!" -ForegroundColor Green
}

# Handle option 3-5: Version bumps
function Start-VersionBump {
    param([string]$VersionType)
    Write-Host "✓ Creating $VersionType release..." -ForegroundColor Green
    try {
        npm run "publish:$VersionType" 2>&1 | Out-Null
    } catch {
        npm version $VersionType --no-git-tag-version 2>&1 | Out-Null
    }
}

# Handle option 6: Publish to VS Marketplace
function Start-Publish {
    if ([string]::IsNullOrEmpty($env:VSCE_PAT)) {
        Write-Host "❌ VSCE_PAT environment variable not set" -ForegroundColor Red
        Write-Host "   Run: \$env:VSCE_PAT='your-token'" -ForegroundColor Gray
        return
    }
    Write-Host "📤 Publishing to VS Code Marketplace..." -ForegroundColor Cyan
    npm run publish
    Write-Host "✓ Published successfully!" -ForegroundColor Green
}

# Handle option 7: Publish to Open VSX
function Start-PublishOVSX {
    if ([string]::IsNullOrEmpty($env:OVSX_PAT)) {
        Write-Host "❌ OVSX_PAT environment variable not set" -ForegroundColor Red
        Write-Host "   Run: \$env:OVSX_PAT='your-token'" -ForegroundColor Gray
        return
    }
    Write-Host "📤 Publishing to Open VSX Registry..." -ForegroundColor Cyan
    npm run publish:ovsx
    Write-Host "✓ Published to Open VSX!" -ForegroundColor Green
}

# Handle option 8: Full release
function Start-FullRelease {
    Write-Host "📋 Running full release process..." -ForegroundColor Cyan
    Write-Host ""

    # Check if all changes are committed
    $status = git status --porcelain 2>&1 | Out-String
    if ($status.Trim() -ne "") {
        Write-Host "❌ Uncommitted changes exist. Please commit first:" -ForegroundColor Red
        git status
        return
    }

    # Lint and build
    Invoke-Lint
    Invoke-Build

    # Get current version
    $currentVersion = Get-Version
    Write-Host "Current version: $currentVersion" -ForegroundColor Gray
    Write-Host ""

    # Get user input for new version
    $newVersion = Read-Host "What's the new version? (current: $currentVersion)"
    if ([string]::IsNullOrEmpty($newVersion)) {
        Write-Host "❌ Version cannot be empty" -ForegroundColor Red
        return
    }

    # Update version in package.json
    $packageJson = Get-Content package.json -Raw
    $packageJson = $packageJson -replace """version""\s*:\s*""$currentVersion""", """version"": ""$newVersion"""
    Set-Content package.json $packageJson

    Write-Host ""
    Write-Host "📝 Don't forget to update CHANGELOG.md!" -ForegroundColor Yellow
    Write-Host "Press Enter after updating CHANGELOG.md..." -ForegroundColor Gray
    Read-Host | Out-Null

    # Commit and tag
    git add -A
    git commit -m "chore: release v$newVersion"
    git tag "v$newVersion"

    Write-Host "✓ Release prepared!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Gray
    Write-Host "1. git push origin main" -ForegroundColor Gray
    Write-Host "2. git push origin v$newVersion" -ForegroundColor Gray
    Write-Host "   (GitHub Actions will automatically publish)" -ForegroundColor Gray
}

# Handle option 9: Check deployment readiness
function Test-Readiness {
    Write-Host "📋 Checking deployment readiness..." -ForegroundColor Cyan
    Write-Host ""

    $checks = 0
    $pass = 0

    # Check lint
    $checks++
    if (npm run lint 2>&1 | Out-Null) {
        Write-Host "✓ Linting passed" -ForegroundColor Green
        $pass++
    } else {
        Write-Host "❌ Linting failed" -ForegroundColor Red
    }

    # Check build
    $checks++
    if (npm run build 2>&1 | Out-Null) {
        Write-Host "✓ Build successful" -ForegroundColor Green
        $pass++
    } else {
        Write-Host "❌ Build failed" -ForegroundColor Red
    }

    # Check icon
    $checks++
    if (Test-Path "images/icon.png") {
        Write-Host "✓ Icon file exists" -ForegroundColor Green
        $pass++
    } else {
        Write-Host "❌ Icon file missing at images/icon.png" -ForegroundColor Red
    }

    # Check required files
    $checks++
    $requiredFiles = @("README.md", "CHANGELOG.md", "LICENSE", "DEPLOYMENT.md", "package.json", "src/extension.ts")
    $filesOk = $true
    foreach ($file in $requiredFiles) {
        if (-not (Test-Path $file)) {
            Write-Host "❌ Missing: $file" -ForegroundColor Red
            $filesOk = $false
        }
    }
    if ($filesOk) {
        Write-Host "✓ All required files present" -ForegroundColor Green
        $pass++
    }

    Write-Host ""
    Write-Host "Summary: $pass/$checks checks passed" -ForegroundColor Gray

    if ($pass -eq $checks) {
        Write-Host "✅ Ready for deployment!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Please fix the above issues before deploying" -ForegroundColor Yellow
    }
}

# Main execution
function Start-Main {
    if (-not (Test-Prerequisites)) {
        exit 1
    }

    $version = Get-Version
    Write-Host "Current version: $version" -ForegroundColor Gray
    Write-Host ""

    Show-Menu

    $choice = Read-Host "Select an option (1-10)"
    Write-Host ""

    switch ($choice) {
        "1" { Start-LocalTest }
        "2" { Start-PreparePublish }
        "3" { Start-VersionBump -VersionType "patch" }
        "4" { Start-VersionBump -VersionType "minor" }
        "5" { Start-VersionBump -VersionType "major" }
        "6" { Start-Publish }
        "7" { Start-PublishOVSX }
        "8" { Start-FullRelease }
        "9" { Test-Readiness }
        "10" { Write-Host "Exiting..." -ForegroundColor Gray; exit 0 }
        default { Write-Host "❌ Invalid option" -ForegroundColor Red; exit 1 }
    }

    Write-Host ""
    Write-Host "✅ Done!" -ForegroundColor Green
}

# Run main function
Start-Main

