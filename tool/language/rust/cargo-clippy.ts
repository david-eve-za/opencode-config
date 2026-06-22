import { tool } from "@opencode-ai/plugin"
import { runCommand, truncateOutput, withTimeout } from "../../core/tool-utils"

export default tool({
  description: "Run Clippy — Rust linter with pedantic suggestions",
  args: {
    severity: tool.schema.enum(["warn", "deny"]).optional().describe("Minimum severity (default: warn)"),
    fix: tool.schema.boolean().optional().describe("Auto-fix where possible (default: false)"),
  },
  async execute({ severity = "warn", fix = false }) {
    const controller = new AbortController()
    
    const args = ["cargo", "clippy", "--", "-W", `clippy::${severity}`]
    if (fix) args.push("--fix")

    try {
      const result = await withTimeout(
        runCommand(args, { signal: controller.signal }),
        60_000,
        controller.signal
      )
      return truncateOutput(result)
    } catch (error) {
      return `cargo clippy failed: ${error instanceof Error ? error.message : String(error)}`
    }
  }
})
