---
name: commit
description: "Smart commit — detects language, generates conventional commit with appropriate scope"
---

## Language-Specific Commit Scopes

| Language | Scope Examples |
|---|---|
| Go | `api`, `cmd`, `internal`, `pkg`, `handler`, `service` |
| Rust | `crate`, `lib`, `bin`, `cli`, `core` |
| Python | `api`, `models`, `services`, `cli`, `core` |
| TypeScript | `ui`, `api`, `db`, `auth`, `core` |
| Terraform | `infra`, `network`, `compute`, `storage` |
| SQL | `schema`, `migration`, `index`, `proc` |

## Flow

1. `git diff` → Identify changed files
2. Detect language from file extensions
3. Group changes by scope (directory structure)
4. Generate conventional commit with appropriate scope
5. Include bead reference if available
6. Commit with generated message
