---
name: review-my-shit
description: "Pre-PR review — runs language-specific checks"
---

## Language-Specific Checks

### TypeScript/JavaScript
- [ ] `tsc --noEmit` passes
- [ ] ESLint passes (or ruff for .ts)
- [ ] No `console.log` left
- [ ] No `any` casts
- [ ] No TODO without ticket
- [ ] No secrets/keys

### Go
- [ ] `go vet` passes
- [ ] `gofmt -d` shows no diff
- [ ] `go test -race` passes
- [ ] No unchecked errors
- [ ] No goroutine leaks
- [ ] No hardcoded secrets

### Rust
- [ ] `cargo clippy` passes
- [ ] `cargo test` passes
- [ ] No unnecessary `unwrap()`
- [ ] No `unsafe` without SAFETY comment
- [ ] No hardcoded secrets

### Python
- [ ] `ruff check` passes
- [ ] `mypy`/`pyright` passes (if configured)
- [ ] `pytest` passes
- [ ] No mutable default arguments
- [ ] No bare `except:`
- [ ] No hardcoded secrets

### Universal
- [ ] No secrets/keys in code
- [ ] No `.env` files staged
- [ ] No debug flags enabled
- [ ] Git history clean (no accidental commits)
