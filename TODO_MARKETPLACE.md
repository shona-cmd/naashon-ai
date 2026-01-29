# GitHub Marketplace Compliance Fixes - TODO

## Phase 1: Critical Code Fixes
- [ ] 1.1 Fix extension.ts - Remove duplicate imports and fix structure
- [ ] 1.2 Fix multiModelService.ts - Correct HTML escape characters
- [ ] 1.3 Fix enhancedAssistant.ts - Correct HTML escape characters

## Phase 2: Test Infrastructure
- [ ] 2.1 Create test runner infrastructure
- [ ] 2.2 Create unit tests for AIService
- [ ] 2.3 Create unit tests for MultiModelService
- [ ] 2.4 Create integration tests for commands
- [ ] 2.5 Update package.json test scripts

## Phase 3: Repository Cleanup
- [ ] 3.1 Remove compiled .vsix file from repository
- [ ] 3.2 Add .vsix to .gitignore
- [ ] 3.3 Add .vsix to .vscodeignore

## Phase 4: Documentation & Quality
- [ ] 4.1 Verify icon meets marketplace requirements
- [ ] 4.2 Add screenshots to README.md
- [ ] 4.3 Update FINAL_CHECKLIST.md

## Phase 5: Final Verification
- [ ] 5.1 Run lint check
- [ ] 5.2 Run build
- [ ] 5.3 Run tests
- [ ] 5.4 Package extension locally
- [ ] 5.5 Final marketplace compliance check

---

## Details

### Issue 1.1: extension.ts
- **Problem**: Duplicate import statement at top of file
- **Fix**: Remove duplicate `import * as vscode from 'vscode';`
- **File**: `/media/naashon/projects/naashon AI/src/extension.ts`

### Issue 1.2: multiModelService.ts
- **Problem**: Incorrect HTML escape characters
  - `&` should be `&amp;`
  - `<` should be `<`
  - `>` should be `>`
- **Fix**: Update escapeHtml method
- **File**: `/media/naashon/projects/naashon AI/src/services/multiModelService.ts`

### Issue 1.3: enhancedAssistant.ts
- **Problem**: Same HTML escape character issues
- **Fix**: Update escapeHtml method
- **File**: `/media/naashon/projects/naashon AI/src/enhancedAssistant.ts`

### Issue 3.1: Repository cleanup
- **Problem**: `ai-coding-assistant-0.2.0.vsix` is committed to repo
- **Fix**: Remove file and add to ignore files

### Issue 2.x: Test Infrastructure
- **Problem**: No tests exist
- **Fix**: Create test files following VS Code extension testing patterns

---

**Created**: 2026-01-29
**Status**: In Progress

