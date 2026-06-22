import { tool } from "@opencode-ai/plugin"
import { runCommand, truncateOutput, withTimeout } from "../../core/tool-utils"

export default tool({
  description: "Run Rust tests — unit, integration, doc tests",
  args: {
    test: tool.schema.string().optional().describe("Run only tests matching pattern"),
    nocapture: tool.schema.boolean().optional().describe("Show println! output (default: false)"),
    release: tool.schema.boolean().optional().describe("Run in release mode (default: false)"),
  },
  async execute({ test, nocapture = false, release = false }) {
    const controller = new AbortController()
    
    const args = ["cargo", "test"]
    if (test) args.push("--test", test)
    if (release) args.push("--release")
    if (nocapture) args.push("--", "--nocapture")

    try {
      const result = await withTimeout(
        runCommand(args, { signal: controller.signal }),
        120_000,
        controller.signal
      )
      return truncateOutput(result)
    } catch (error) {
      return `cargo test failed: ${error instanceof Error ? error.message : String(error)}`
    }
  }
})
