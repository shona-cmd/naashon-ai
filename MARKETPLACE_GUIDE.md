# 🚀 Complete Marketplace Deployment Guide

Your AI Coding Assistant extension is now fully configured for marketplace deployment. This guide walks you through the entire process.

## 📋 Table of Contents

1. [Quick Start (5 minutes)](#quick-start)
2. [Detailed Setup](#detailed-setup)
3. [Pre-Deployment Checklist](#checklist)
4. [Publishing Options](#publishing)
5. [After Publishing](#after-publishing)
6. [Troubleshooting](#troubleshooting)

---

## ⚡ Quick Start

Just want the essentials? Follow these 5 steps:

### 1. Create Azure DevOps Account
```bash
# Go to: https://dev.azure.com
# Sign up (or use existing Microsoft account)
```

### 2. Create Personal Access Token
- In Azure DevOps, click your avatar → Personal access tokens
- Click "+ New Token"
- Name: `VS Code Extension Publishing`
- Scopes: `Marketplace (manage)` - Full access
- Expiration: 1 year (or your preference)
- **Copy and save this token safely** ✓

### 3. Register Publisher
- Go to: https://marketplace.visualstudio.com
- Click "Publish extensions"
- Create publisher name: `naashon` (update in package.json)

### 4. Setup GitHub Secrets
```
Repository → Settings → Secrets and variables → Actions
Add:
  VSCE_PAT = [your token from step 2]
```

### 5. Deploy
```bash
# Test locally
npm run package

# Create release tag
git tag v0.1.0
git push origin v0.1.0

# ✓ GitHub Actions automatically publishes!
# Check marketplace in 1-2 hours
```

---

## 🔧 Detailed Setup

### Prerequisites
- Node.js 18+ (`node --version`)
- npm 8+ (`npm --version`)
- Git (`git --version`)
- GitHub account
- Microsoft account (for Azure DevOps)

### File Structure Overview
```
├── .github/workflows/
│   ├── ci.yml           # Testing on every push
│   └── publish.yml      # Auto-publishing on tags
├── src/
│   ├── extension.ts     # Main entry point
│   ├── assistant.ts     # Core logic
│   └── services/
│       └── aiService.ts # API integration
├── images/
│   └── icon.png         # Extension icon (128x128)
├── scripts/
│   ├── deploy.sh        # Interactive deployment tool
│   └── generate-icon.sh # Generate icon
├── package.json         # Extension manifest
├── README.md            # User documentation
├── DEPLOYMENT.md        # Publishing guide
├── DEVELOPMENT.md       # Dev guide
└── DEPLOYMENT_CHECKLIST.md  # Pre-publish checklist
```

### Step-by-Step Setup

#### Step 1: Prepare Your Account

**On Azure DevOps:**
```
1. Go to https://dev.azure.com
2. Sign in with Microsoft account
3. Create organization (if needed)
4. Profile icon → Personal access tokens
5. New token with details:
   ├── Name: VS Code Extension Publishing
   ├── Org: [your org]
   ├── Scopes: Marketplace (manage)
   └── Expiration: 1 year
6. COPY TOKEN (you'll only see it once!)
```

**On VS Code Marketplace:**
```
1. Go to https://marketplace.visualstudio.com
2. Sign in with your Microsoft account
3. "Publish extensions"
4. Create publisher:
   ├── Name: naashon
   ├── Email: your@email.com
   └── Save
5. Update package.json:
   "publisher": "naashon"
```

#### Step 2: Configure GitHub

**Add Secrets:**
```
1. GitHub repo → Settings tab
2. Secrets and variables → Actions
3. New repository secret:
   Name: VSCE_PAT
   Value: [paste your token]
4. (Optional) Add OVSX_PAT for Open VSX
```

#### Step 3: Prepare Your Extension

**Update Metadata:**
```json
{
  "name": "ai-coding-assistant",
  "displayName": "AI Coding Assistant",
  "publisher": "naashon",
  "version": "0.1.0",
  "description": "AI-powered coding assistant...",
  "icon": "images/icon.png"
}
```

**Add Icon:**
- Place 128x128 PNG at `images/icon.png`
- Make it clear and recognizable
- Or run: `./scripts/generate-icon.sh`

**Update Documentation:**
- Edit README.md (user-facing)
- Edit CHANGELOG.md (version info)
- Update DEPLOYMENT.md if needed

#### Step 4: Test Locally

```bash
# Install dependencies
npm install

# Lint code
npm run lint:fix

# Build extension
npm run build

# Package for testing
npm run package

# Install locally to test
code --install-extension ai-coding-assistant-0.1.0.vsix

# Test all features before publishing!
```

#### Step 5: Create Release

**Automated (Recommended):**
```bash
# Commit all changes
git add .
git commit -m "feat: ready for marketplace release v0.1.0"
git push

# Create tag (triggers CI/CD)
git tag v0.1.0
git push origin v0.1.0

# ✓ GitHub Actions will:
# 1. Build the extension
# 2. Publish to VS Code Marketplace
# 3. Publish to Open VSX (if configured)
# 4. Create GitHub Release
```

**Manual (Alternative):**
```bash
# Install vsce globally
npm install -g vsce

# Publish (requires VSCE_PAT env var)
export VSCE_PAT="your-token-here"
npm run publish
```

---

## ✅ Pre-Deployment Checklist

Before publishing, verify:

### Code Quality
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] `npm run package` creates .vsix
- [ ] No TypeScript errors
- [ ] No console warnings

### Documentation
- [ ] README.md is complete and accurate
- [ ] CHANGELOG.md updated with new version
- [ ] Installation steps clear
- [ ] API key setup documented
- [ ] Usage examples provided

### Metadata
- [ ] package.json version correct (semantic versioning)
- [ ] Publisher name matches your account
- [ ] Display name is user-friendly
- [ ] Description is clear (max 200 chars)
- [ ] Keywords are relevant (3-10)
- [ ] Icon is present at images/icon.png
- [ ] Repository URL is correct
- [ ] License is MIT

### Testing
- [ ] Tested on Windows/macOS/Linux
- [ ] All commands work
- [ ] Error handling works
- [ ] API key validation works
- [ ] Settings are configurable

### Files
- [ ] LICENSE file exists
- [ ] README.md complete
- [ ] .gitignore updated
- [ ] .vscodeignore excludes unnecessary files
- [ ] No secrets in code

See full checklist: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

---

## 🎯 Publishing Options

### Option A: Automated with GitHub Actions (Recommended)

**Best for:** Regular releases with CI/CD

```bash
# 1. Prepare and commit
npm run lint:fix
npm run build
git add .
git commit -m "feat: new release"
git push

# 2. Create tag
git tag v0.2.0
git push origin v0.2.0

# 3. ✓ Automatic! GitHub Actions handles everything
```

**What happens automatically:**
- Code is linted and built
- Tests run (if configured)
- .vsix package is created
- Published to VS Code Marketplace
- Published to Open VSX
- Release notes created on GitHub

### Option B: Manual with npm Scripts

**Best for:** Quick releases or troubleshooting

```bash
# Setup
export VSCE_PAT="your-azure-devops-token"

# Patch release (0.1.0 → 0.1.1)
npm run publish:patch

# Minor release (0.1.0 → 0.2.0)
npm run publish:minor

# Major release (0.1.0 → 1.0.0)
npm run publish:major

# Or specific version
vsce publish 0.2.0
```

### Option C: Interactive Deployment Script

**Best for:** Guided deployment experience

```bash
./scripts/deploy.sh

# Menu options:
# 1) Local test
# 2) Prepare for publishing
# 3-5) Version updates
# 6-7) Publish commands
# 8) Full release
# 9) Readiness check
```

### Option D: Publish to Open VSX (Additional)

For VS Code alternatives (Gitpod, Theia, etc.):

```bash
# Get token from https://open-vsx.org
export OVSX_PAT="your-open-vsx-token"

# Publish
npm run publish:ovsx
```

---

## 🌟 After Publishing

### Monitoring (First 24 Hours)

1. **Check Marketplace:**
   ```
   https://marketplace.visualstudio.com/items?itemName=naashon.ai-coding-assistant
   ```

2. **Monitor GitHub:**
   - Watch for issues/feedback
   - Respond to comments
   - Check for bug reports

3. **Check Analytics:**
   - Marketplace provides download stats
   - Monitor rating and reviews

### Maintenance

```bash
# Update README with screenshots/GIFs
# Respond to user feedback
# Plan next version features
# Schedule regular releases (monthly/quarterly)
```

### Future Releases

```bash
# Bug fix
npm run publish:patch

# New feature
npm run publish:minor

# Major overhaul
npm run publish:major

# GitHub Actions auto-publishes!
```

---

## 🆘 Troubleshooting

### "401 Unauthorized"
```
Issue: Authentication failed
Fix: 
  1. Verify PAT hasn't expired
  2. Create new PAT with 'Marketplace (manage)' scope
  3. Update GitHub secret VSCE_PAT
```

### "Publisher not found"
```
Issue: Publisher doesn't exist
Fix:
  1. Register publisher on marketplace
  2. Update package.json "publisher" field
  3. Ensure publisher name is lowercase
```

### "Extension too large"
```
Issue: .vsix > 10MB
Fix:
  1. Update .vscodeignore to exclude more files
  2. Minimize dependencies
  3. Remove unused code
```

### "Build fails on CI/CD"
```
Issue: GitHub Actions error
Fix:
  1. Check CI logs: Actions tab → workflow
  2. Install missing dependencies: npm install
  3. Verify Node.js version: 18+
  4. Check for TypeScript errors: npm run build
```

### "Changes not showing in marketplace"
```
Issue: Old version still displayed
Fix:
  1. Wait 1-2 hours for marketplace update
  2. Refresh browser cache
  3. Check version number was incremented
  4. Verify publish succeeded in Actions
```

---

## 📚 Additional Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Publishing Guide (Official)](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [vsce Documentation](https://github.com/microsoft/vscode-vsce)
- [Open VSX Publishing](https://github.com/eclipse/openvsx/wiki/Publishing-Extensions)
- [Extension Quality Guidelines](https://marketplace.visualstudio.com/faq)

---

## 🎯 Success Indicators

You'll know you succeeded when:

✅ Extension appears on marketplace  
✅ Installation works (Ctrl+Shift+X → Search → Install)  
✅ Commands work as expected  
✅ Users can configure API key  
✅ No critical errors reported  
✅ Positive reviews start coming in  

---

## 📞 Need Help?

1. **Check Documentation:**
   - README.md - User guide
   - DEVELOPMENT.md - Dev guide
   - DEPLOYMENT.md - Detailed publishing
   - DEPLOYMENT_CHECKLIST.md - Pre-publish checklist

2. **Run Interactive Tools:**
   ```bash
   ./scripts/deploy.sh          # Deployment assistant
   ./scripts/generate-icon.sh   # Generate icon
   ```

3. **Check GitHub Issues:**
   - Create issue with details
   - Include error messages
   - Share reproduction steps

---

**🎉 You're ready to publish your AI Coding Assistant to the world!**

Start with QUICK_START.sh or run: `./scripts/deploy.sh`

Good luck! 🚀
