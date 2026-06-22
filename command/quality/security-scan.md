---
name: security-scan
description: "Run security scan — SAST, SCA, secret detection, container scan"
---

## Scan Types (by project type)

| Detection | Scanner | Command |
|---|---|---|
| package.json | npm audit / snyk | `npm audit` / `snyk test` |
| go.sum | govulncheck | `govulncheck ./...` |
| Cargo.lock | cargo audit | `cargo audit` |
| requirements.txt | pip-audit / snyk | `pip-audit` / `snyk test` |
| Dockerfile | trivy / hadolint | `trivy image` / `hadolint` |
| *.tf | tfsec / checkov | `tfsec .` / `checkov` |
| Any | gitleaks | `gitleaks detect` |

## Flow

1. Detect project type and dependencies
2. Run appropriate scanners
3. Group findings by severity (critical → low)
4. For each critical/high: create bead
5. Save findings to Engram: `mem_save(type="discovery", topic_key="security/[project]/[finding]")`
