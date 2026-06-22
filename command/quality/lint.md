---
name: lint
description: "Run project linter — auto-detects language and linter"
---

## Detection Matrix

| File Found | Linter | Command |
|---|---|---|
| .eslintrc.* / eslint.config.* | ESLint | `npx eslint .` |
| biome.json | Biome | `npx biome check .` |
| .golangci.yml | golangci-lint | `golangci-lint run` |
| (Go project) | go vet | `go vet ./...` |
| clippy config | cargo clippy | `cargo clippy` |
| ruff.toml / pyproject.toml [tool.ruff] | ruff | `ruff check .` |
| .checkstyle.xml | checkstyle | `mvn checkstyle:check` |
| .editorconfig | editorconfig-checker | `ec` |

## Flow

1. Detect linter from project config
2. Run linter
3. Group results by severity and file
4. If fixable, offer to auto-fix
5. Save results to Engram
