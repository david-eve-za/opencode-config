import { tool } from "@opencode-ai/plugin"
import { runCommand, truncateOutput, withTimeout } from "../../core/tool-utils"

export default tool({
  description: "Inspect Go module — dependencies, versions, graph",
  args: {
    action: tool.schema.enum(["deps", "graph", "why", "tidy"]).describe("Action: deps (list), graph (dependency tree), why (why is X needed), tidy (go mod tidy)"),
    pkg: tool.schema.string().optional().describe("Package name (for 'why' action)"),
  },
  async execute({ action, pkg }) {
    const controller = new AbortController()
    
    let args: string[]
    switch (action) {
      case "deps":
        args = ["go", "list", "-m", "all"]
        break
      case "graph":
        args = ["go", "mod", "graph"]
        break
      case "why":
        if (!pkg) return "Error: 'pkg' required for 'why' action"
        args = ["go", "mod", "why", pkg]
        break
      case "tidy":
        args = ["go", "mod", "tidy"]
        break
      default:
        return `Unknown action: ${action}`
    }

    try {
      const result = await withTimeout(
        runCommand(args, { signal: controller.signal }),
        30_000,
        controller.signal
      )
      return truncateOutput(result)
    } catch (error) {
      return `go mod ${action} failed: ${error instanceof Error ? error.message : String(error)}`
    }
  }
})
