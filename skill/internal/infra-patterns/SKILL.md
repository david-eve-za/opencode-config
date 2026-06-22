# Infrastructure Patterns Skill

## Description
Patterns for Docker, Kubernetes, Terraform, and cloud infrastructure.

## Triggers
- "docker", "kubernetes", "k8s", "terraform", "cloud", "infra", "deploy"

## Patterns

### Docker
- **Multi-Stage Builds**: Builder stage → runtime stage (smaller images)
- **Non-Root User**: `USER appuser` in Dockerfile
- **Read-Only Rootfs**: `read_only: true` in compose/k8s
- **Drop Capabilities**: `cap_drop: ["ALL"]`, add only needed
- **Health Checks**: `HEALTHCHECK` in Dockerfile, liveness/readiness in k8s
- **Layer Caching**: Order Dockerfile for maximum cache hits
- **`.dockerignore`**: Exclude `.git`, `node_modules`, `*.log`, `*.md`

### Kubernetes
- **Resource Requests/Limits**: Always set CPU/memory
- **Liveness + Readiness Probes**: Different purposes, both needed
- **Pod Disruption Budgets**: Ensure availability during maintenance
- **Network Policies**: Default deny, explicit allow
- **RBAC**: Least privilege, service accounts per app
- **Secrets**: External Secrets Operator, SealedSecrets, or Vault
- **ConfigMaps**: For non-sensitive config, not secrets
- **Helm Charts**: Package, version, templatize K8s manifests

### Terraform
- **Module Structure**: Root → modules → resources
- **State Backend**: Remote (S3, GCS, Azurerm) with locking
- **Workspace/Environment**: Separate state per env
- **Variables**: Input variables with validation, outputs for consumers
- **Plan Before Apply**: Always `terraform plan` in CI
- **Drift Detection**: Periodic `terraform plan` on prod
- **Provider Versions**: Pin in `required_providers`

### Cloud (Universal)
- **Infrastructure as Code**: Everything in git, nothing manual
- **Immutable Infrastructure**: Replace, don't modify in place
- **Least Privilege**: IAM policies scoped to resources
- **Cost Awareness**: Right-size, spot instances, lifecycle policies
- **Multi-AZ/Region**: HA for production workloads
- **Backup/Restore**: Automated, tested, documented RTO/RPO
- **Observability**: Logs, metrics, traces from day one

### CI/CD
- **Pipeline as Code**: GitHub Actions, GitLab CI, Jenkinsfile
- **Build Once, Deploy Many**: Artifact promotion through envs
- **Automated Testing**: Unit, integration, contract, e2e in pipeline
- **Security Gates**: SAST, SCA, container scan, IaC scan
- **Rollback Strategy**: Blue-green, canary, or instant rollback
- **Deployment Gates**: Manual approval for production
