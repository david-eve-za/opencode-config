import { tool } from "@opencode-ai/plugin"
import { runCommand, truncateOutput, withTimeout } from "../core/tool-utils"

export default tool({
  description: "Validate database migrations — schema changes, rollback safety",
  args: {
    tool: tool.schema.enum(["prisma", "alembic", "flyway", "golang-migrate", "django"]).describe("Migration tool"),
    action: tool.schema.enum(["status", "validate", "generate"]).describe("Action"),
  },
  async execute({ tool: migrationTool, action }) {
    const controller = new AbortController()
    
    let args: string[]
    switch (migrationTool) {
      case "prisma":
        args = ["prisma", "migrate", action === "status" ? "status" : action === "validate" ? "validate" : "dev"]
        break
      case "alembic":
        args = ["alembic", action === "status" ? "current" : action === "validate" ? "check" : "revision"]
        break
      case "flyway":
        args = ["flyway", action === "status" ? "info" : action === "validate" ? "validate" : "migrate"]
        break
      case "golang-migrate":
        args = ["migrate", action === "status" ? "status" : action === "validate" ? "validate" : "up"]
        break
      case "django":
        args = ["python", "manage.py", action === "status" ? "showmigrations" : action === "validate" ? "check" : "makemigrations"]
        break
      default:
        return `Unknown tool: ${migrationTool}`
    }

    try {
      const result = await withTimeout(
        runCommand(args, { signal: controller.signal }),
        60_000,
        controller.signal
      )
      return truncateOutput(result)
    } catch (error) {
      return `migration ${action} failed: ${error instanceof Error ? error.message : String(error)}`
    }
  }
})
