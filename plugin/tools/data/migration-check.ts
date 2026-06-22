export function register(api: any) {
  api.addTool({
    name: "migration-check",
    description: "Validate database migrations — schema changes, rollback safety",
    args: {
      tool: api.schema.enum(["prisma", "alembic", "flyway", "golang-migrate", "django"]).describe("Migration tool"),
      action: api.schema.enum(["status", "validate", "generate"]).describe("Action"),
    },
    async execute({ tool, action }) {
      return `migration-check: ${action} for ${tool}`
    }
  })
}
