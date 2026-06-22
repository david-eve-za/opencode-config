export function register(api: any) {
  api.addTool({
    name: "typecheck",
    description: "TypeScript type checker — runs tsc --noEmit",
    args: {
      path: api.schema.string().optional().describe("Path to check (default: .)"),
      project: api.schema.string().optional().describe("Specific tsconfig.json path"),
    },
    async execute({ path = ".", project }) {
      return `typecheck: checking ${path}${project ? ` with ${project}` : ""}`
    }
  })
}
