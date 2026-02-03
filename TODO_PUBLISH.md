# TODO: GitHub App Token Integration for Publish Workflow

## Plan
Add GitHub App token authentication to `.github/workflows/publish.yml`

## Steps Completed
- [x] Analyze current workflow structure
- [x] Review existing publish.yml configuration
- [x] Plan GitHub App token integration
- [x] Get user approval for the plan
- [x] Edit `.github/workflows/publish.yml` to add GitHub App token step

## Next Steps
- [ ] Configure GitHub App and add required secrets (APP_ID, PRIVATE_KEY)

## GitHub App Setup Guide

### 1. Create a GitHub App
1. Go to **GitHub Settings → Developer settings → GitHub Apps → New GitHub App**
2. Fill in:
   - **GitHub App name**: `naashon-ai-publisher`
   - **Homepage URL**: `https://github.com/naashon/ai-coding-assistant`
   - **Webhook**: Uncheck (not needed for this use case)
   - **Permissions**: Grant `contents:write` and `releases:write` (or appropriate permissions for your needs)
3. Create the app and note the **App ID**

### 2. Generate Private Key
1. On the GitHub App settings page, click **"Generate a private key"**
2. Download the `.pem` file
3. Encode it to Base64:
   ```bash
   base64 -w 0 your-app-private-key.pem
   ```

### 3. Install the App
1. On the GitHub App settings page, click **"Install App"**
2. Select the repository `naashon/ai-coding-assistant`
3. Grant access

### 4. Add Secrets to GitHub Repository
1. Go to **Repository Settings → Secrets and variables → Actions**
2. Add new repository secrets:
   - **Name**: `APP_ID`
     **Value**: Your GitHub App ID (number)
   - **Name**: `PRIVATE_KEY`
     **Value**: Base64-encoded private key from step 2

## Usage
The app token is available as:
```
${{ steps.create_token.outputs.token }}
```

Use it for GitHub API operations requiring app permissions.

## Updated Workflow Flow
```
checkout → setup-node → get-app-token → install-deps → build → lint → test → vsce publish → ovsx publish → create-release
```

---
*Created: 2026-01-31*
*Updated: 2026-01-31*

