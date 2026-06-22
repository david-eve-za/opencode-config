---
name: deploy-check
description: "Pre-deployment validation — tests, security, config, readiness"
---

## Checklist

1. [ ] All tests pass (language-appropriate)
2. [ ] Linter passes with zero errors
3. [ ] Security scan clean (no critical/high findings)
4. [ ] No secrets in code
5. [ ] Docker image builds (if applicable)
6. [ ] Terraform plan reviewed (if applicable)
7. [ ] Database migrations validated (if applicable)
8. [ ] CI pipeline green
9. [ ] Version bumped appropriately
10. [ ] Changelog updated

## Flow

1. Run `/test` equivalent
2. Run `/lint` equivalent
3. Run `/security-scan` equivalent
4. Check Dockerfile (if exists)
5. Check Terraform (if exists)
6. Check CI status
7. Generate deployment readiness report
