---
name: branch-push
description: 'Push code to branch-specific Git workflows. Use when committing frontend (Rin-Nairith branch) or backend (Rin-Nairith-backend branch) code. Handles branch detection, switching, staging, committing, and pushing.'
argument-hint: 'Optional: "frontend" or "backend" to override auto-detection'
user-invocable: true
---

# Branch-Specific Git Push

Automates Git workflow for pushing frontend and backend code to their designated branches.

## Branch Mapping

| Code Type | Directory Pattern | Target Branch |
|-----------|------------------|---------------|
| Frontend | Root files, `src/`, `public/`, `components/` | `Rin-Nairith` |
| Backend | `backend/` and subdirectories | `Rin-Nairith-backend` |

## When to Use

- Committing and pushing frontend changes
- Committing and pushing backend changes  
- Need to ensure code goes to the correct branch
- Want branch auto-detection based on current context

## Procedure

### 1. Detect Context

**Auto-detection logic:**
- If the current file or most recent edits are in `backend/` → Backend workflow
- If in `src/`, `public/`, `components/`, or root config files → Frontend workflow
- If ambiguous, ask the user or use the argument hint

**Manual override:**
User can invoke with "frontend" or "backend" argument to skip detection.

### 2. Verify and Switch Branch

**Frontend workflow:**
```bash
git status
git checkout Rin-Nairith || git checkout -b Rin-Nairith
```

**Backend workflow:**
```bash
git status
git checkout Rin-Nairith-backend || git checkout -b Rin-Nairith-backend
```

If there are uncommitted changes on the current branch:
- Warn the user
- Offer to stash (`git stash push -m "Auto-stash before branch switch"`)
- Or ask if they want to commit first

### 3. Stage Changes

**Frontend (auto-detect):**
```bash
git add src/ public/ components/ index.html *.config.* *.json package.json
```

**Backend (auto-detect):**
```bash
git add backend/
```

**All changes:**
If user wants to stage everything:
```bash
git add .
```

Always show what will be staged:
```bash
git status --short
```

### 4. Commit with Message

Prompt the user for a commit message using the ask-questions tool.

**Template suggestions based on context:**
- `feat: [description]` - New feature
- `fix: [description]` - Bug fix  
- `refactor: [description]` - Code refactoring
- `style: [description]` - UI/styling changes
- `docs: [description]` - Documentation

Commit:
```bash
git commit -m "<user-provided-message>"
```

### 5. Push to Remote

```bash
git push origin <branch-name>
```

If this is the first push for a new branch:
```bash
git push -u origin <branch-name>
```

### 6. Confirm Success

Report:
- Branch pushed to: `<branch-name>`
- Commit hash and message
- Files changed summary

## Error Handling

**Merge conflicts:**
- Detect with `git status`
- Instruct user to resolve conflicts
- Don't proceed with commit until clean

**No changes to commit:**
- Inform user no changes detected
- Show `git status` output

**Remote rejected (e.g., behind remote):**
- Suggest `git pull origin <branch-name>` first
- Ask if they want to pull and retry

**Detached HEAD or other branch issues:**
- Show current state
- Guide user to resolve before proceeding

## Safety Checks

Before any destructive operation:
1. Show current branch and status
2. Confirm target branch matches code type
3. List files to be staged
4. Preview commit before pushing

## Example Usage

**Slash command invocations:**
- `/branch-push` - Auto-detect and push
- `/branch-push frontend` - Force frontend workflow
- `/branch-push backend` - Force backend workflow

**Chat invocations:**
- "Push my frontend changes"
- "Commit and push backend code"
- "Push to the correct branch"

## Related Commands

**Check current status:**
```bash
git status
git branch --show-current
```

**View recent commits:**
```bash
git log --oneline -5
```

**Undo last commit (keep changes):**
```bash
git reset --soft HEAD~1
```
