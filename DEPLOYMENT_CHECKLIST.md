# Pre-Deployment Checklist

Use this checklist before publishing your extension to the marketplace.

## Code Quality

- [ ] All TypeScript compilation errors resolved
- [ ] `npm run lint` passes without errors
- [ ] `npm run build` completes successfully
- [ ] No console warnings or errors in debug mode
- [ ] Tested in VS Code 1.85+ (your minimum version)

## Documentation

- [ ] README.md is comprehensive and accurate
- [ ] CHANGELOG.md updated with new version
- [ ] DEPLOYMENT.md has correct steps
- [ ] All code comments are clear and helpful
- [ ] API key setup instructions clear
- [ ] Usage examples included
- [ ] Troubleshooting section added

## Package Configuration

- [ ] `package.json` version number incremented (semantic versioning)
- [ ] `displayName` is user-friendly
- [ ] `description` is clear and concise (max 200 chars)
- [ ] `publisher` name matches Azure DevOps publisher
- [ ] `keywords` are relevant and searchable (3-10 keywords)
- [ ] `icon` path is correct (128x128 PNG)
- [ ] `repository` URL is valid and public
- [ ] `bugs` URL points to issue tracker
- [ ] `homepage` is set (if applicable)
- [ ] `license` is specified (MIT recommended)
- [ ] `activationEvents` are optimized
- [ ] All commands registered properly

## Assets

- [ ] Icon exists at `images/icon.png` (128x128 PNG)
- [ ] Icon is clear and recognizable at small sizes
- [ ] High DPI version at `images/icon-256.png` (optional)
- [ ] Screenshots prepared for marketplace (if applicable)
- [ ] GIFs showing features (optional but recommended)

## Testing

- [ ] Manual testing on multiple OS (Windows, macOS, Linux)
- [ ] Manual testing on supported VS Code versions
- [ ] Test all commands work correctly
- [ ] Test error handling and user feedback
- [ ] Test configuration options
- [ ] Test keyboard shortcuts
- [ ] API key validation works
- [ ] Graceful degradation without API key

## Performance

- [ ] Extension starts quickly (< 1 second)
- [ ] Commands respond promptly
- [ ] No memory leaks during extended use
- [ ] Package size is reasonable (< 10MB)
- [ ] `.vscodeignore` excludes unnecessary files

## Security

- [ ] No hardcoded secrets or API keys
- [ ] Sensitive data stored securely
- [ ] HTTPS used for external APIs
- [ ] Input validation implemented
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies are up-to-date

## Marketplace Compliance

- [ ] Extension has a unique name
- [ ] No profanity or offensive content
- [ ] Follows Microsoft code of conduct
- [ ] No misleading descriptions
- [ ] No malware or harmful code
- [ ] Properly licensed and attributed
- [ ] No ads or tracking (unless disclosed)

## GitHub Setup

- [ ] Repository is public
- [ ] README visible on repository
- [ ] Repository has topics/tags
- [ ] Issue templates configured (optional)
- [ ] Contributing guidelines (optional)
- [ ] License file included
- [ ] .gitignore is appropriate

## CI/CD

- [ ] GitHub Actions workflows exist
- [ ] `VSCE_PAT` secret configured in GitHub
- [ ] `OVSX_PAT` secret configured (if publishing to Open VSX)
- [ ] Secrets have appropriate expiration dates
- [ ] Workflow triggers are correct (on tags)
- [ ] Build passes on CI/CD

## Version & Release

- [ ] Version follows semantic versioning (MAJOR.MINOR.PATCH)
- [ ] Git tags created (e.g., v0.1.0)
- [ ] Release notes prepared
- [ ] CHANGELOG.md comprehensive
- [ ] All changes committed to main branch
- [ ] No uncommitted changes

## Final Checks

- [ ] Test `.vsix` package locally:
  ```bash
  npm run package
  code --install-extension *.vsix
  ```
- [ ] Verify all features work in packaged version
- [ ] Test uninstall and reinstall
- [ ] Check marketplace preview (before final publish)
- [ ] Verify icon displays correctly
- [ ] Confirm pricing/free status

## Publishing

- [ ] Ready to publish? Review above checklist
- [ ] Backup `package.json` and `.git`
- [ ] Choose publish method:
  - Automated: Create git tag → GitHub Actions publishes
  - Manual: Run `npm run publish` with VSCE_PAT
- [ ] Monitor CI/CD logs during publishing
- [ ] Verify extension appears on marketplace within 1-2 hours
- [ ] Post announcement (Twitter, Reddit, HN, etc.)

## Post-Publishing

- [ ] Monitor marketplace for reviews/ratings
- [ ] Respond to user feedback and issues
- [ ] Check GitHub issues and pull requests
- [ ] Plan next features/updates
- [ ] Collect user feedback via surveys
- [ ] Plan next release cycle

## Emergency Rollback

If critical issues found after publishing:

1. Remove from marketplace (marketplace settings)
2. Create bugfix version (e.g., 0.1.1)
3. Republish with fixes
4. Post announcement about rollback

---

**Last Updated**: January 29, 2026  
**Next Review**: Before each release
