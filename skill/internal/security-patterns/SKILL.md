# Security Patterns Skill

## Description
Universal security patterns for applications and infrastructure.

## Triggers
- "security", "vulnerability", "auth", "secret", "scan", "audit"

## Patterns

### Authentication & Authorization
- **Never Roll Your Own**: Use battle-tested libraries (OAuth2, OIDC, JWT)
- **Short-Lived Access Tokens**: 15-30 min, refresh token rotation
- **Secure Cookies**: `HttpOnly`, `Secure`, `SameSite=Strict`
- **Principle of Least Privilege**: Minimum scopes/permissions
- **Role-Based Access Control (RBAC)**: Roles → Permissions → Resources
- **Attribute-Based Access Control (ABAC)**: For fine-grained policies

### Input Validation & Sanitization
- **Validate at Boundary**: Never trust client input
- **Allowlist over Blocklist**: Define what's allowed
- **Context-Aware Encoding**: HTML, SQL, URL, JS contexts differ
- **Parameterized Queries**: Always for SQL, never string concat
- **Content Security Policy**: Restrict resource loading

### Secrets Management
- **Never in Code**: Not in repo, not in config files
- **Vault/Secrets Manager**: HashiCorp Vault, AWS Secrets Manager, 1Password
- **Environment Variables**: For runtime injection only
- **Rotation**: Automated, regular, zero-downtime
- **Audit Access**: Log who/when accessed what

### Dependency Security
- **SCA Scanning**: `npm audit`, `cargo audit`, `govulncheck`, `pip-audit`
- **Pin Versions**: Exact versions in lockfiles
- **Allowlist Approved**: Review new dependencies
- **Update Regularly**: Scheduled dependency updates
- **License Compliance**: Track and enforce

### Infrastructure Security
- **Network Segmentation**: Private subnets, no direct internet
- **WAF/CDN**: Cloudflare, AWS WAF for layer 7 protection
- **Container Security**: Non-root user, read-only rootfs, drop capabilities
- **Image Scanning**: Trivy, Grype in CI pipeline
- **IaC Scanning**: tfsec, checkov, kube-score
- **Secrets Scanning**: gitleaks, trufflehog in pre-commit/CI

### Monitoring & Incident Response
- **Security Logs**: Centralized, immutable, alerted
- **Anomaly Detection**: Failed logins, unusual access patterns
- **Incident Playbook**: Defined steps for breach, data leak, compromise
- **Regular Drills**: Tabletop exercises, red team
