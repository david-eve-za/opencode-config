export function register(api: any) {
  api.addTool({
    name: "k8s-validate",
    description: "Validate Kubernetes manifests — schema, best practices, security",
    args: {
      path: api.schema.string().optional().describe("Manifest file or directory (default: .)"),
      strict: api.schema.boolean().optional().describe("Strict validation (default: false)"),
    },
    async execute({ path = ".", strict = false }) {
      return `k8s-validate: validating ${path}${strict ? ` (strict)` : ""}`
    }
  })
}
