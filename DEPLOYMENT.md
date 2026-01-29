# Deployment Guide for AI Coding Assistant

## Prerequisites

Before deploying your extension to the VS Code Marketplace and Open VSX Registry, you'll need:

1. **GitHub Account**: For version control and CI/CD
2. **VS Code Marketplace Account**: To publish on the official marketplace
3. **Open VSX Account**: To publish on the open-source registry (optional)
4. **Node.js**: v18 or higher
5. **npm**: Latest version

## Step 1: Prepare Your Publisher Account

### Create a Personal Access Token (PAT) on Azure DevOps

1. Go to [Azure DevOps](https://dev.azure.com/)
2. Sign in with your Microsoft account (create one if needed)
3. Click on your profile icon → **Personal access tokens**
4. Click **+ New Token**
5. Fill in the details:
   - **Name**: `VS Code Extension Publishing`
   - **Organization**: Select your organization or create a new one
   - **Scopes**: Select **Marketplace (manage)** with full access
   - **Expiration**: Set appropriate expiration date
6. Click **Create** and copy the token (save it securely)

### Register Publisher Name

1. Go to [VS Code Marketplace](https://marketplace.visualstudio.com/)
2. Click **Publish extensions**
3. Sign in with your Microsoft account
4. Create a publisher name (e.g., "naashon")
5. Update `package.json` with your publisher name:
   ```json
   "publisher": "your-publisher-name"
   ```

## Step 2: Set Up GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:

   - **Name**: `VSCE_PAT`
   - **Value**: Your VS Code Marketplace PAT from Step 1

   For Open VSX (optional):
   - **Name**: `OVSX_PAT`
   - **Value**: Your Open VSX token (get from [Open VSX](https://open-vsx.org/) → Account settings)

## Step 3: Install Global Dependencies

```bash
npm install -g vsce ovsx
```

## Step 4: Test Locally Before Publishing

```bash
# Install dependencies
npm install

# Run linter
npm run lint:fix

# Build the extension
npm run build

# Package as .vsix file
npm run package
```

This creates a `.vsix` file that you can manually test in VS Code:
- Open VS Code
- Go to Extensions
- Click **Install from VSIX** and select your `.vsix` file

## Step 5: Version and Publish

### Option A: Automated Publishing (Recommended)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "feat: initial release v0.1.0"
   git push origin main
   ```

2. Create a Git tag and push:
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

3. GitHub Actions will automatically:
   - Build the extension
   - Publish to VS Code Marketplace
   - Publish to Open VSX Registry

### Option B: Manual Publishing

```bash
# For patch version (0.1.0 → 0.1.1)
npm run publish:patch

# For minor version (0.1.0 → 0.2.0)
npm run publish:minor

# For major version (0.1.0 → 1.0.0)
npm run publish:major

# Or manually
vsce publish 0.1.0
```

## Step 6: Publish to Open VSX (Optional)

To make your extension available to VS Code derivatives and other editors:

```bash
npm run publish:ovsx
```

Or manually:
```bash
ovsx publish
```

## CI/CD Pipeline

Your GitHub Actions workflow automatically:

1. **On Push to main/develop**:
   - Runs linter
   - Builds extension
   - Tests on Node.js 18.x and 20.x

2. **On Tag Creation (v*)**:
   - Builds extension
   - Publishes to VS Code Marketplace
   - Publishes to Open VSX Registry
   - Creates release artifacts

## Marketplace Optimization

### Icon
- Place a 128x128 PNG icon at `images/icon.png`
- Use a simple, recognizable design
- Avoid transparency for better visibility

### README
- Update [README.md](README.md) with:
  - Feature descriptions
  - Screenshots
  - Installation instructions
  - Usage examples
  - Configuration options

### Marketplace Metadata
In `package.json`:
- `displayName`: User-friendly name
- `description`: Clear, concise description (short tagline)
- `keywords`: Searchable keywords
- `icon`: Path to icon file
- `repository`: Link to GitHub repo
- `homepage`: Website or documentation
- `bugs`: Link to issue tracker
- `license`: License type

### Categories
Update appropriate categories in `package.json`:
- AI
- Programming Languages
- Snippets
- Other (pick 1-3 most relevant)

## Troubleshooting

### "401 Unauthorized" Error
- Verify your PAT hasn't expired
- Check that PAT has "Marketplace (manage)" scope
- Re-create PAT if needed

### "Extension too large" Warning
- Ensure `.vscodeignore` excludes unnecessary files
- Minimize dependencies
- Use minified builds (done automatically)

### "Publisher name not found"
- Make sure publisher account exists in Azure DevOps
- Update publisher name in `package.json` to match

### Changes not reflecting in marketplace
- Marketplace can take 1-2 hours to update listings
- Check existing version number to avoid conflicts

## Support

For more information:
- [VS Code Extension Publishing](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Open VSX Documentation](https://github.com/eclipse/openvsx/wiki/Publishing-Extensions)
- [vsce Documentation](https://github.com/microsoft/vscode-vsce)
