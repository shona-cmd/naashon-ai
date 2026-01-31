# Security Policy

## Reporting Security Vulnerabilities

**Please do not publicly disclose security vulnerabilities.** If you discover a security issue, please report it responsibly.

### How to Report

1. **GitHub Security Advisory** (Preferred for sensitive issues): 
   - Use [GitHub's security advisory feature](https://github.com/naashon/ai-coding-assistant/security/advisories)
   - This provides encrypted, private communication

2. **GitHub Issues** (Non-critical): 
   - Use [GitHub Issues](https://github.com/naashon/ai-coding-assistant/issues) with `[SECURITY]` tag
   - Use for non-sensitive issues only

3. **Email** (Critical vulnerabilities):
   - Contact through GitHub profile for critical issues
   - Include detailed description of the vulnerability

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)
- CVSS score (if applicable)

### Response Timeline
- **Critical (0-7 days)**: Patches released immediately
- **High (1-2 weeks)**: Priority review and patching
- **Medium (2-4 weeks)**: Standard review and patching  
- **Low (1-2 months)**: Next release cycle

We take security seriously and will respond promptly to security reports.

## Security Best Practices

### For Users

#### API Key Management
- ✅ **Do**: Use strong API keys from your provider (OpenAI, Anthropic, Google, etc.)
- ✅ **Do**: Rotate API keys regularly
- ✅ **Do**: Use different keys for development and production
- ✅ **Do**: Enable provider-side rate limiting and spend alerts
- ✅ **Do**: Store keys in VS Code secure storage (automatic)
- ❌ **Don't**: Share your API keys with anyone
- ❌ **Don't**: Commit API keys to version control
- ❌ **Don't**: Use the same key across multiple machines
- ❌ **Don't**: Log or display API keys in output

#### Secure Code Usage
- ✅ Review all AI-generated code before using in production
- ✅ Test generated code in a safe environment first
- ✅ Never send sensitive data (passwords, tokens, API keys) to AI providers
- ✅ Check your organization's AI usage policies
- ✅ Audit AI-generated code for security vulnerabilities
- ✅ Keep VS Code and the extension updated
- ❌ Don't blindly trust AI output
- ❌ Don't use generated code with production data before testing
- ❌ Don't disable code review for AI-generated code

#### Data Privacy
- ✅ Review your AI provider's privacy policy
- ✅ Be mindful of proprietary or business-sensitive code
- ✅ Use self-hosted models (Ollama) for maximum privacy
- ✅ Check if your organization has AI usage guidelines
- ✅ Consider data classification before using cloud AI
- ❌ Don't send confidential company code to cloud providers without approval
- ❌ Don't ignore data residency requirements
- ❌ Don't use with personal identifiable information (PII)

### For Developers

#### Development Security
```bash
# Never commit API keys
export OPENAI_API_KEY="sk_test_..."

# Add to .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# Use environment variables in code
const apiKey = process.env.OPENAI_API_KEY;

# Rotate keys after development
# Use provider dashboard to revoke old keys
```

#### Code Review & Testing
- All pull requests reviewed for security issues
- Use `npm audit` to check for dependency vulnerabilities
- Keep dependencies updated with `npm update`
- Review vulnerability reports in GitHub Security tab
- Run linting: `npm run lint`

#### Input Validation
- Sanitize all user inputs before processing
- Validate all API responses
- Handle errors securely without exposing details
- Don't expose stack traces or sensitive information in error messages
- Implement rate limiting for API calls

### Extension Security

The extension implements several security measures:

1. **Local Storage**: API keys stored in VS Code's secure storage
2. **HTTPS Only**: All API calls use encrypted HTTPS connections
3. **No Cloud Storage**: Your code never stored on our servers
4. **Direct API Calls**: Code sent directly to your AI provider
5. **Minimal Permissions**: Extension limited to necessary VS Code APIs
6. **No Telemetry**: No tracking of your usage or code

## Supported Versions

- Latest version: Full support
- Previous version: Security fixes only
- Older versions: No support

## Security Updates

Security updates will be released as needed and published to:
- VS Code Marketplace
- Open VSX Registry
- GitHub Releases

Subscribe to releases to stay informed about security updates.

---

## Data Security & Privacy

For complete privacy information, see [PRIVACY_POLICY.md](PRIVACY_POLICY.md).

## Related Policies

- [Privacy Policy](PRIVACY_POLICY.md)
- [Terms of Service](TERMS_OF_SERVICE.md)
- [Contributing Guidelines](CONTRIBUTING.md)

---

**Last Updated:** January 31, 2026  
**Version:** 2.0 (Updated for Marketplace Compliance)
