export function register(api: any) {
  api.addTool({
    name: "bd-quick",
    description: "[DEPRECATED] Quick bead operations — use hive_bead_* tools instead",
    args: {
      action: api.schema.enum(["create", "list", "get", "update", "close", "delete"]).describe("Action"),
      id: api.schema.string().optional().describe("Bead ID"),
      title: api.schema.string().optional().describe("Bead title"),
      description: api.schema.string().optional().describe("Bead description"),
      status: api.schema.enum(["open", "in_progress", "done", "blocked"]).optional().describe("Status"),
    },
    async execute({ action, id, title, description, status }) {
      return `bd-quick [DEPRECATED]: ${action}${id ? ` ${id}` : ""}${title ? ` "${title}"` : ""}`
    }
  })
}
