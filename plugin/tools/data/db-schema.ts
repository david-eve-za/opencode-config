export function register(api: any) {
  api.addTool({
    name: "db-schema",
    description: "Inspect database schema — tables, columns, indexes, relations",
    args: {
      engine: api.schema.enum(["postgres", "mysql", "sqlite"]).describe("Database engine"),
      connection: api.schema.string().optional().describe("Connection string or env var name"),
      table: api.schema.string().optional().describe("Specific table (omit for all)"),
    },
    async execute({ engine, connection, table }) {
      return `db-schema: inspecting ${engine}${table ? ` table ${table}` : ""}`
    }
  })
}
