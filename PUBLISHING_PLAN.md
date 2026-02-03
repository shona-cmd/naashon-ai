# Publishing Plan: AI Coding Assistant to VS Code Marketplace

## 📊 Project Analysis Summary

### What's Ready ✅
- **Extension Code**: Fully implemented with 5 AI features (Generate, Explain, Refactor, Optimize, Add Comments)
- **package.json**: Properly configured with publisher "naashon", version 0.2.0
- **Documentation**: Comprehensive README.md, CHANGELOG.md, and deployment guides
- **CI/CD**: GitHub Actions workflow configured in `.github/workflows/publish.yml`
- **Icon**: Professional SVG icon at `images/icon.png`
- **Build Output**: Compiled extension in `out/` directory

### What Needs Verification ⚠️
- **Publisher Account**: Need to verify "naashon" publisher exists on marketplace
- **GitHub Secrets**: Need to verify VSCODE_MARKETPLACE_TOKEN is configured
- **Local Testing**: Need to verify lint, build, and package work correctly

---

## 🎯 Publishing Strategy

### Option A: Automated Publishing (Recommended)
Uses GitHub Actions workflow - triggers on git tag push

### Option B: Manual Publishing
Direct CLI using vsce tool

### Option C: Manual Upload
Package .vsix and upload via marketplace web interface

---

## 📋 Pre-Publishing Checklist

### 1. Account Setup ✅
- [ ] Publisher "naashon" registered on VS Code Marketplace
- [ ] Azure DevOps Personal Access Token created
- [ ] GitHub repository secrets configured:
  - [ ] VSCODE_MARKETPLACE_TOKEN
  - [ ] OPEN_VSX_TOKEN (optional, for Open VSX)

### 2. Code Quality ✅
- [ ] `npm run lint` passes with no errors
- [ ] `npm run build` compiles successfully
- [ ] `npm run package` creates valid .vsix file
- [ ] No TypeScript/ESLint warnings

### 3. Documentation ✅
- [ ] README.md complete with installation instructions
- [ ] CHANGELOG.md updated for version 0.2.0
- [ ] Extension icon present at images/icon.png
- [ ] License file included (MIT)

### 4. Marketplace Compliance ✅
- [ ] package.json has all required fields
- [ ] Extension size under 10MB
- [ ] No sensitive data or secrets in code
- [ ] Repository URL is public and accessible

---

## 🚀 Step-by-Step Publishing Steps

### Step 1: Verify Prerequisites
```bash
# Check Node.js version
node --version  # Should be 18+

# Check npm version
npm --version   # Should be 8+

# Verify extension structure
ls -la out/     # Should have compiled JS files
ls -la images/  # Should have icon.png
```

### Step 2: Run Quality Checks
```bash
# Install dependencies
npm install

# Run linter
npm run lint

# Build extension
npm run build

# Package extension
npm run package

# Verify package created
ls -lh *.vsix
```

### Step 3: Test Extension Locally
```bash
# Install extension locally
code --install-extension *.vsix

# Test features
# - Generate Code (Ctrl+Shift+G)
# - Explain Code (Ctrl+Shift+E)
# - Refactor Code (Ctrl+Shift+R)
# - Optimize Performance (Ctrl+Shift+O)
# - Add Comments (Ctrl+Shift+C)

# Uninstall after testing
code --uninstall-extension naashon.ai-coding-assistant
```

### Step 4: Update Version (if needed)
```bash
# Update version number in package.json
# Current: 0.2.0
# Next:   0.2.1 (patch), 0.3.0 (minor), or 1.0.0 (major)

# Update CHANGELOG.md with release notes

# Commit changes
git add .
git commit -m "chore: prepare for release v0.2.1"
```

### Step 5: Publish (Choose Method)

#### Method A: Automated (Recommended)
```bash
# Create git tag
git tag v0.2.1

# Push tag to trigger GitHub Actions
git push origin v0.2.1

# Monitor: GitHub Actions → Workflows → Publish Extension
# Extension will appear on marketplace in 5-15 minutes
```

#### Method B: Manual CLI
```bash
# Install vsce globally
npm install -g vsce

# Login to marketplace
vsce login naashon
# Enter your PAT token when prompted

# Publish
vsce publish

# Or publish with version bump
vsce publish patch  # 0.2.0 → 0.2.1
vsce publish minor  # 0.2.0 → 0.3.0
vsce publish major  # 0.2.0 → 1.0.0
```

#### Method C: Manual Upload
```bash
# Package extension
npm run package

# Upload to marketplace:
# 1. Go to https://marketplace.visualstudio.com/manage
# 2. Select publisher "naashon"
# 3. Click "New extension" → "VSIX"
# 4. Upload ai-coding-assistant-0.2.0.vsix
```

---

## 📦 Post-Publishing Actions

### Immediate (First Hour)
- [ ] Verify extension appears on marketplace
- [ ] Check marketplace listing looks correct
- [ ] Test installation from marketplace
- [ ] Monitor GitHub Actions for success/failure

### First Day
- [ ] Check download count
- [ ] Monitor for any issues
- [ ] Respond to any feedback

### First Week
- [ ] Review user ratings and reviews
- [ ] Plan next version based on feedback
- [ ] Consider marketing the extension

---

## 🆘 Troubleshooting Common Issues

### "Publisher not found"
**Cause**: Publisher account doesn't exist
**Solution**: 
1. Go to https://marketplace.visualstudio.com/manage/createpublisher
2. Create publisher with ID "naashon"
3. Wait 5-10 minutes for propagation

### "401 Unauthorized"
**Cause**: Invalid or expired PAT token
**Solution**:
1. Go to https://dev.azure.com
2. User Settings → Personal access tokens
3. Create new token with "Marketplace (manage)" scope
4. Update GitHub secret VSCODE_MARKETPLACE_TOKEN

### "Extension too large"
**Cause**: .vsix file exceeds 10MB limit
**Solution**:
1. Review .vscodeignore
2. Add more patterns to exclude:
   ```
   node_modules/**
   src/**
   *.map
   ```
3. Recompress and repackage

### "Build fails on CI/CD"
**Cause**: Missing dependencies or Node version issue
**Solution**:
1. Check GitHub Actions logs
2. Ensure npm ci is used (not npm install)
3. Verify Node.js version is 18+ in workflow

### "Changes not showing in marketplace"
**Cause**: Marketplace hasn't re-indexed yet
**Solution**:
1. Wait 1-2 hours
2. Hard refresh browser (Ctrl+F5)
3. Verify version number incremented

---

## 📞 Important Links

| Resource | URL |
|----------|-----|
| VS Code Marketplace | https://marketplace.visualstudio.com |
| Publisher Dashboard | https://marketplace.visualstudio.com/manage |
| Azure DevOps | https://dev.azure.com |
| Create Publisher | https://marketplace.visualstudio.com/manage/createpublisher |
| Open VSX Registry | https://open-vsx.org |
| vsce Documentation | https://github.com/microsoft/vscode-vsce |
| GitHub Repository | https://github.com/naashon/ai-coding-assistant |
| Extension Page | https://marketplace.visualstudio.com/items?itemName=naashon.ai-coding-assistant |

---

## 🎯 Success Metrics

After publishing, success looks like:
- ✅ Extension appears on marketplace within 15 minutes
- ✅ Installation works via VS Code Extensions panel
- ✅ All 5 commands work as expected
- ✅ Users can configure API key in settings
- ✅ No critical errors in console
- ✅ Positive ratings and reviews start coming in

---

## 📋 Quick Reference Commands

```bash
# Full release workflow
npm install && npm run lint && npm run build && npm run package

# Create release tag
git tag v0.2.1
git push origin v0.2.1

# Manual publish
vsce login naashon
vsce publish

# Check extension status
vsce show naashon.ai-coding-assistant

# List published versions
vsce list
```

---

## 🔐 Security Checklist

- [ ] API keys are stored in VS Code settings, not in code
- [ ] No secrets in GitHub repository
- [ ] Personal Access Token has minimal required scopes
- [ ] Token expiration is set appropriately (1 year max)
- [ ] Repository is public (required for marketplace)

---

*Last Updated: 2026-01-31*

