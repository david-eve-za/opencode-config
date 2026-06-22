# DevOps Patterns Skill

## Description
Patterns for CI/CD, monitoring, incident response, and operational excellence.

## Triggers
- "ci", "cd", "pipeline", "monitoring", "observability", "incident", "oncall"

## Patterns

### CI/CD Pipeline
- **Fast Feedback**: Unit tests < 5 min, full pipeline < 30 min
- **Fail Fast**: Lint → Typecheck → Unit → Integration → E2E
- **Parallel Jobs**: Independent stages run concurrently
- **Cache Dependencies**: Restore `node_modules`, cargo, go mod cache
- **Artifact Promotion**: Build once, deploy same artifact to all envs
- **Environment Parity**: Dev/staging/prod as similar as possible

### Branching & Release
- **Trunk-Based Development**: Short-lived branches, frequent merges
- **Feature Flags**: Deploy incomplete features safely
- **Semantic Versioning**: MAJOR.MINOR.PATCH, automated
- **Changelog**: Generated from conventional commits
- **Release Branches**: Only for stabilization, not development

### Monitoring & Observability
- **Four Golden Signals**: Latency, Traffic, Errors, Saturation
- **RED Metrics**: Rate, Errors, Duration for services
- **USE Metrics**: Utilization, Saturation, Errors for resources
- **Structured Logging**: JSON, correlation IDs, sampling
- **Distributed Tracing**: OpenTelemetry, W3C TraceContext
- **Alerting**: Actionable alerts, runbooks, no noise

### Incident Response
- **Runbooks**: Step-by-step for common incidents
- **Severity Levels**: SEV1 (critical) → SEV4 (low)
- **Incident Commander**: Single person coordinating
- **Communication**: Status page, Slack channel, stakeholder updates
- **Blameless Postmortems**: Timeline, root cause, action items
- **Action Items Tracked**: Assigned, due dates, verified

### On-Call
- **Rotation**: Fair, sustainable, documented handoff
- **Escalation**: Clear paths, backup on-call
- **Runbook Access**: Searchable, up-to-date, tested
- **Compensation**: Time off, extra pay, recognition

### GitOps
- **Declarative**: Desired state in git
- **Automated Sync**: ArgoCD, Flux reconcile continuously
- **Drift Detection**: Alert on manual changes
- **Audit Trail**: Git history = deployment history
- **Rollback**: `git revert` triggers redeploy
