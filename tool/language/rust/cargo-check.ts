import { tool } from "@opencode-ai/plugin"
import { runCommand, truncateOutput, withTimeout } from "../../core/tool-utils"

export default tool({
  description: "Run cargo check — verify Rust code compiles without building",
  args: {
    target: tool.schema.string().optional().describe("Target triple"),
    features: tool.schema.string().optional().describe("Feature flags (comma-separated)"),
    all_features: tool.schema.boolean().optional().describe("Enable all features"),
  },
  async execute({ target, features, all_features }) {
    const controller = new AbortController()
    
    const args = ["cargo", "check"]
    if (target) args.push("--target", target)
    if (features) args.push("--features", features)
    if (all_features) args.push("--all-features")

    try {
      const result = await withTimeout(
        runCommand(args, { signal: controller.signal }),
        60_000,
        controller.signal
      )
      return truncateOutput(result)
    } catch (error) {
      return `cargo check failed: ${error instanceof Error ? error.message : String(error)}`
    }
  }
})
