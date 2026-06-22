import { tool } from "@opencode-ai/plugin"
import { runCommand, truncateOutput, withTimeout } from "../../core/tool-utils"

export default tool({
  description: "Run go vet on Go source files — reports suspicious constructs",
  args: {
    path: tool.schema.string().optional().describe("Directory or file to vet (default: ./...)"),
    tags: tool.schema.string().optional().describe("Build tags to apply"),
  },
  async execute({ path = "./...", tags }) {
    const controller = new AbortController()
    
    const args = ["go", "vet"]
    if (tags) args.push("-tags", tags)
    args.push(path)

    try {
      const result = await withTimeout(
        runCommand(args, { signal: controller.signal }),
        30_000,
        controller.signal
      )
      return truncateOutput(result)
    } catch (error) {
      return `go vet failed: ${error instanceof Error ? error.message : String(error)}`
    }
  }
})
