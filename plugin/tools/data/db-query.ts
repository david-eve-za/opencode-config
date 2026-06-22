export function register(api: any) {
  api.addTool({
    name: "db-query",
    description: "Run read-only database queries — SELECT only, no mutations",
    args: {
      engine: api.schema.enum(["postgres", "mysql", "sqlite"]).describe("Database engine"),
      query: api.schema.string().describe("SQL query (SELECT only)"),
      connection: api.schema.string().optional().describe("Connection string or env var"),
    },
    async execute({ engine, query, connection }) {
      const trimmed = query.trim().toUpperCase()
      if (!trimmed.startsWith("SELECT")) {
        return "Error: Only SELECT queries are allowed for safety"
      }
      return `db-query: executing on ${engine}: ${query.substring(0, 50)}...`
    }
  })
}
