import { tool } from "@opencode-ai/plugin"
import { runCommand, truncateOutput, withTimeout } from "../../core/tool-utils"

export default tool({
  description: "List Python packages — installed, outdated, or from requirements",
  args: {
    action: tool.schema.enum(["list", "outdated", "tree"]).describe("Action: list (installed), outdated (needs update), tree (dependency tree)"),
    format: tool.schema.enum(["simple", "json"]).optional().describe("Output format (default: simple)"),
  },
  async execute({ action, format = "simple" }) {
    const controller = new AbortController()
    
    let args: string[]
    switch (action) {
      case "list":
        args = ["pip", "list", `--format=${format}`]
        break
      case "outdated":
        args = ["pip", "list", "--outdated", `--format=${format}`]
        break
      case "tree":
        args = ["pipdeptree"]
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
      return `pip ${action} failed: ${error instanceof Error ? error.message : String(error)}`
    }
  }
})
