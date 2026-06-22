---
name: infra-plan
description: "Plan infrastructure changes — Terraform, Docker, K8s, cloud"
---

## Flow

1. Detect IaC tool (Terraform, CloudFormation, Pulumi, CDK)
2. Run `terraform plan` / equivalent
3. Analyze changes (additions, modifications, destructions)
4. Check for destructive changes
5. Estimate cost impact
6. Generate plan summary
7. Save to Engram: `mem_save(type="architecture", topic_key="infra/plan/[date]")`
