import { tool } from "@opencode-ai/plugin"
import { runCommand, truncateOutput, withTimeout } from "../core/tool-utils"

export default tool({
  description: "Run read-only database queries — SELECT only, no mutations",
  args: {
    engine: tool.schema.enum(["postgres", "mysql", "sqlite"]).describe("Database engine"),
    query: tool.schema.string().describe("SQL query (SELECT only)"),
    connection: tool.schema.string().optional().describe("Connection string or env var name"),
  },
  async execute({ engine, query, connection }) {
    const controller = new AbortController()
    
    // Security: Only allow SELECT queries
    const trimmed = query.trim().toUpperCase()
    if (!trimmed.startsWith("SELECT")) {
      return "Error: Only SELECT queries are allowed for safety"
    }
    if (trimmed.includes(";") && !trimmed.endsWith(";")) {
      return "Error: Multiple statements not allowed"
    }

    const conn = connection || process.env.DATABASE_URL
    if (!conn) return "Error: connection string required (via arg or DATABASE_URL env)"

    let args: string[]
    switch (engine) {
      case "postgres":
        args = ["psql", conn, "-c", query]
        break
      case "mysql":
        args = ["mysql", conn, "-e", query]
        break
      case "sqlite":
        args = ["sqlite3", conn, query]
        break
      default:
        return `Unknown engine: ${engine}`
    }

    try {
      const result = await withTimeout(
        runCommand(args, { signal: controller.signal }),
        30_000,
        controller.signal
      )
      return truncateOutput(result)
    } catch (error) {
      return `db query failed: ${error instanceof Error ? error.message : String(error)}`
    }
  }
})
