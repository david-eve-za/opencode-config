export function register(api: any) {
  api.addCommand({
    name: "infra-plan",
    description: "Plan infrastructure changes — Terraform, Docker, K8s, cloud",
    async execute() {
      return "Infra plan generated"
    }
  })
}
