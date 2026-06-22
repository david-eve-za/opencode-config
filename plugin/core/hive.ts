export function registerHive(api: any) {
  // Hive operations: init, sync, ready, close
  api.addTool({
    name: "hive_init",
    description: "Initialize hive workspace",
    args: {},
    async execute() { return "Hive initialized" }
  })

  api.addTool({
    name: "hive_sync",
    description: "Sync hive workspace",
    args: {},
    async execute() { return "Hive synced" }
  })

  api.addTool({
    name: "hive_ready",
    description: "Check hive readiness",
    args: {},
    async execute() { return "Hive ready" }
  })

  api.addTool({
    name: "hive_close",
    description: "Close hive workspace",
    args: {},
    async execute() { return "Hive closed" }
  })
}
