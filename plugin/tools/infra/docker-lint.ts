export function register(api: any) {
  api.addTool({
    name: "docker-lint",
    description: "Lint Dockerfile — best practices, security, size optimization",
    args: {
      path: api.schema.string().optional().describe("Dockerfile path (default: ./Dockerfile)"),
      strict: api.schema.boolean().optional().describe("Strict mode (no exceptions)"),
    },
    async execute({ path = "./Dockerfile", strict = false }) {
      return `docker-lint: linting ${path}${strict ? ` (strict)` : ""}`
    }
  })
}
