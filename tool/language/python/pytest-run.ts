import { tool } from "@opencode-ai/plugin"
import { runCommand, truncateOutput, withTimeout } from "../../core/tool-utils"

export default tool({
  description: "Run pytest — Python test framework with coverage",
  args: {
    path: tool.schema.string().optional().describe("Test path (default: .)"),
    keyword: tool.schema.string().optional().describe("Run only tests matching keyword"),
    verbose: tool.schema.boolean().optional().describe("Verbose output (default: true)"),
    coverage: tool.schema.boolean().optional().describe("Enable coverage report (default: true)"),
  },
  async execute({ path = ".", keyword, verbose = true, coverage = true }) {
    const controller = new AbortController()
    
    const args = ["pytest"]
    if (verbose) args.push("-v")
    if (keyword) args.push("-k", keyword)
    if (coverage) args.push("--cov")
    args.push(path)

    try {
      const result = await withTimeout(
        runCommand(args, { signal: controller.signal }),
        120_000,
        controller.signal
      )
      return truncateOutput(result)
    } catch (error) {
      return `pytest failed: ${error instanceof Error ? error.message : String(error)}`
    }
  }
})
