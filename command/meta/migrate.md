---
name: migrate
description: "Pattern migration universal — detects language and uses appropriate migration tool"
---

## Migration Tools by Language

| Language | Tool | Capabilities |
|---|---|---|
| TypeScript/JS | ast-grep | AST-based pattern matching and replacement |
| Go | gofmt -r, gopls | Go-specific refactoring |
| Rust | cargo fix, rustfmt | Auto-fix compiler suggestions |
| Python | rope, lib2to3 | Python refactoring |
| Java | OpenRewrite | Java大规模 refactoring |
| Universal | sed/regex | Simple text replacement (last resort) |

## Flow

1. Detect language
2. Identify pattern to migrate
3. Search Engram for similar migrations: `mem_search(query="migration [pattern] [language]")`
4. Generate migration plan with rollback
5. Execute with dry-run first
6. Verify: tests pass, no regressions
7. Save migration record to Engram
