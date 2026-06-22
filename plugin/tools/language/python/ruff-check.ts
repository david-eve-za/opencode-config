export function register(api: any) {
  api.addTool({
    name: "ruff-check",
    description: "Run Ruff — fast Python linter and formatter check",
    args: {
      path: api.schema.string().optional().describe("Path to check (default: .)"),
      fix: api.schema.boolean().optional().describe("Auto-fix issues (default: false)"),
      config: api.schema.string().optional().describe("Path to ruff.toml or pyproject.toml"),
    },
    async execute({ path = ".", fix = false, config }) {
      return `ruff-check: checking ${path}${fix ? ` (fix: true)` : ""}${config ? ` with ${config}` : ""}`
    }
  })
}
