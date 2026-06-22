---
name: sweep
description: "Codebase cleanup — detects language and runs appropriate cleanup"
---

## Language-Specific Sweep

### TypeScript
- Fix `tsc` errors
- Remove dead code (unused imports, unreachable code)
- Fix ESLint issues
- Remove `console.log`

### Go
- Run `go vet -fix`
- Run `gofmt -w`
- Remove unused imports (`goimports`)
- Simplify code (`gofmt -s`)

### Rust
- Run `cargo clippy --fix`
- Run `cargo fmt`
- Remove `dead_code` warnings
- Fix unused imports

### Python
- Run `ruff check --fix`
- Remove unused imports (`autoflake`)
- Remove dead code
- Fix type annotations

### Universal
- Remove TODO/FIXME without tickets
- Remove commented-out code
- Remove debug flags
- Fix trailing whitespace
