export function register(api: any) {
  api.addTool({
    name: "go-mod",
    description: "Inspect Go module — dependencies, versions, graph",
    args: {
      action: api.schema.enum(["deps", "graph", "why", "tidy"]).describe("Action: deps (list), graph (dependency tree), why (why is X needed), tidy (go mod tidy)"),
      pkg: api.schema.string().optional().describe("Package name (for 'why' action)"),
    },
    async execute({ action, pkg }) {
      return `go-mod: ${action}${pkg ? ` ${pkg}` : ""}`
    }
  })
}
