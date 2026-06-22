export function register(api: any) {
  api.addTool({
    name: "pkg-scripts",
    description: "List and run package scripts from various config files (package.json, Makefile, Cargo.toml, pyproject.toml, etc.)",
    args: {
      runtime: api.schema.enum(["node", "go", "rust", "python", "java", "csharp", "auto"]).optional().describe("Runtime (default: auto-detect)"),
      action: api.schema.enum(["list", "run"]).optional().describe("Action: list scripts or run a script"),
      script: api.schema.string().optional().describe("Script name to run (for 'run' action)"),
    },
    async execute({ runtime = "auto", action = "list", script }) {
      return `pkg-scripts: ${action} for ${runtime}${script ? ` (${script})` : ""}`
    }
  })
}
