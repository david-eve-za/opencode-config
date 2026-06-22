# Git Patterns Skill

## Description
Universal Git workflows, branching strategies, and conflict resolution.

## Triggers
- "git", "branch", "merge", "rebase", "conflict", "commit", "push"

## Patterns

### Branching Strategy
- **Main/Master**: Protected, deployable, CI passes
- **Feature Branches**: `feat/description`, `fix/description`
- **Release Branches**: `release/vX.Y` for stabilization
- **Hotfix Branches**: `hotfix/description` from main
- **Delete Merged Branches**: Clean up after merge

### Commit Messages (Conventional Commits)
```
<type>(<scope>): <subject>

<body>

<footer>
```
Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`
Scopes by language:
- Go: `api`, `cmd`, `internal`, `pkg`, `handler`, `service`
- Rust: `crate`, `lib`, `bin`, `cli`, `core`
- Python: `api`, `models`, `services`, `cli`, `core`
- TypeScript: `ui`, `api`, `db`, `auth`, `core`
- Terraform: `infra`, `network`, `compute`, `storage`
- SQL: `schema`, `migration`, `index`, `proc`

### Rebasing
- **Interactive Rebase**: `git rebase -i HEAD~N` to squash/fixup
- **Rebase onto Main**: `git rebase main` before PR
- **Never Rebase Public**: Only rebase local, unpushed commits

### Conflict Resolution
1. `git status` — see conflicted files
2. Open files, resolve `<<<<<<< ======= >>>>>>>`
3. `git add <resolved-files>`
4. `git rebase --continue` or `git commit`

### Useful Commands
- `git log --oneline --graph --all` — Visual history
- `git log -p -- <file>` — File history with diffs
- `git blame -L <start>,<end> <file>` — Line authorship
- `git bisect` — Binary search for regression
- `git stash push -m "msg"` — Stash with message
- `git worktree add ../task-name` — Isolated worktree

### PR Workflow
1. Create feature branch from main
2. Commit early, often, with clear messages
3. Push branch, open PR
4. CI runs: tests, lint, security
5. Review: request changes, approve
6. Squash and merge (or rebase merge)
7. Delete branch
