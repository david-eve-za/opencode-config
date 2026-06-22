import { tool } from "@opencode-ai/plugin"
import { runCommand, truncateOutput, withTimeout } from "../../core/tool-utils"

export default tool({
  description: "Run Ruff — fast Python linter and formatter check",
  args: {
    path: tool.schema.string().optional().describe("Path to check (default: .)"),
    fix: tool.schema.boolean().optional().describe("Auto-fix issues (default: false)"),
    config: tool.schema.string().optional().describe("Path to ruff.toml or pyproject.toml"),
  },
  async execute({ path = ".", fix = false, config }) {
    const controller = new AbortController()
    
    const args = ["ruff", "check"]
    if (fix) args.push("--fix")
    if (config) args.push("--config", config)
    args.push(path)

    try {
      const result = await withTimeout(
        runCommand(args, { signal: controller.signal }),
        30_000,
        controller.signal
      )
      return truncateOutput(result)
    } catch (error) {
      return `ruff check failed: ${error instanceof Error ? error.message : String(error)}`
    }
  }
})
