import { tool } from "@opencode-ai/plugin"
import { runCommand, truncateOutput, withTimeout } from "../core/tool-utils"

export default tool({
  description: "Inspect database schema — tables, columns, indexes, relations",
  args: {
    engine: tool.schema.enum(["postgres", "mysql", "sqlite"]).describe("Database engine"),
    connection: tool.schema.string().optional().describe("Connection string or env var name"),
    table: tool.schema.string().optional().describe("Specific table (omit for all)"),
  },
  async execute({ engine, connection, table }) {
    const controller = new AbortController()
    
    let args: string[]
    const conn = connection || process.env.DATABASE_URL
    if (!conn) return "Error: connection string required (via arg or DATABASE_URL env)"

    switch (engine) {
      case "postgres":
        args = ["psql", conn, "-c", table ? `\\d+ ${table}` : "\\d+"]
        break
      case "mysql":
        args = ["mysql", conn, "-e", table ? `DESCRIBE ${table}` : "SHOW TABLES"]
        break
      case "sqlite":
        args = ["sqlite3", conn, table ? `.schema ${table}` : ".schema"]
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
      return `db schema failed: ${error instanceof Error ? error.message : String(error)}`
    }
  }
})
