export function register(api: any) {
  api.addTool({
    name: "pip-list",
    description: "List Python packages — installed, outdated, or from requirements",
    args: {
      action: api.schema.enum(["list", "outdated", "tree"]).describe("Action: list (installed), outdated (needs update), tree (dependency tree)"),
      format: api.schema.enum(["simple", "json"]).optional().describe("Output format (default: simple)"),
    },
    async execute({ action, format = "simple" }) {
      return `pip-list: ${action} (format: ${format})`
    }
  })
}
