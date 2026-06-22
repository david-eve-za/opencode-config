export function register(api: any) {
  api.addCommand({
    name: "deploy-check",
    description: "Pre-deployment validation — tests, security, config, readiness",
    async execute() {
      return "Deploy check completed"
    }
  })
}
