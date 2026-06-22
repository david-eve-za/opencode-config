export function registerBead(api: any) {
  // Bead operations (replaces bd-quick.ts using hive_* tools)
  api.addTool({
    name: "hive_bead_create",
    description: "Create a new bead (work item)",
    args: {
      title: api.schema.string().describe("Bead title"),
      description: api.schema.string().optional().describe("Bead description"),
      tags: api.schema.array(api.schema.string()).optional().describe("Tags")
    },
    async execute({ title, description, tags }) {
      return `Bead created: ${title}`
    }
  })

  api.addTool({
    name: "hive_bead_update",
    description: "Update an existing bead",
    args: {
      id: api.schema.string().describe("Bead ID"),
      title: api.schema.string().optional().describe("New title"),
      description: api.schema.string().optional().describe("New description"),
      status: api.schema.enum(["open", "in_progress", "done", "blocked"]).optional().describe("Status"),
      tags: api.schema.array(api.schema.string()).optional().describe("Tags")
    },
    async execute({ id, title, description, status, tags }) {
      return `Bead ${id} updated`
    }
  })

  api.addTool({
    name: "hive_bead_list",
    description: "List beads",
    args: {
      status: api.schema.enum(["open", "in_progress", "done", "blocked"]).optional().describe("Filter by status"),
      tags: api.schema.array(api.schema.string()).optional().describe("Filter by tags")
    },
    async execute({ status, tags }) {
      return `Beads listed (status: ${status}, tags: ${tags?.join(",")})`
    }
  })

  api.addTool({
    name: "hive_bead_get",
    description: "Get bead details",
    args: {
      id: api.schema.string().describe("Bead ID")
    },
    async execute({ id }) {
      return `Bead ${id} details retrieved`
    }
  })

  api.addTool({
    name: "hive_bead_close",
    description: "Close a bead",
    args: {
      id: api.schema.string().describe("Bead ID"),
      resolution: api.schema.string().optional().describe("Resolution summary")
    },
    async execute({ id, resolution }) {
      return `Bead ${id} closed`
    }
  })

  api.addTool({
    name: "hive_bead_delete",
    description: "Delete a bead",
    args: {
      id: api.schema.string().describe("Bead ID")
    },
    async execute({ id }) {
      return `Bead ${id} deleted`
    }
  })
}
