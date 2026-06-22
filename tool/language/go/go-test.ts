import { tool } from "@opencode-ai/plugin"
import { runCommand, truncateOutput, withTimeout } from "../../core/tool-utils"

export default tool({
  description: "Run Go tests with coverage — supports unit, integration, and benchmark",
  args: {
    path: tool.schema.string().optional().describe("Package path (default: ./...)"),
    run: tool.schema.string().optional().describe("Run only tests matching regex"),
    verbose: tool.schema.boolean().optional().describe("Verbose output (default: true)"),
    cover: tool.schema.boolean().optional().describe("Enable coverage (default: true)"),
    race: tool.schema.boolean().optional().describe("Enable race detector (default: true)"),
    tags: tool.schema.string().optional().describe("Build tags"),
  },
  async execute({ path = "./...", run, verbose = true, cover = true, race = true, tags }) {
    const controller = new AbortController()
    
    const args = ["go", "test"]
    if (verbose) args.push("-v")
    if (cover) args.push("-cover")
    if (race) args.push("-race")
    if (run) args.push("-run", run)
    if (tags) args.push("-tags", tags)
    args.push(path)

    try {
      const result = await withTimeout(
        runCommand(args, { signal: controller.signal }),
        120_000,
        controller.signal
      )
      return truncateOutput(result)
    } catch (error) {
      return `go test failed: ${error instanceof Error ? error.message : String(error)}`
    }
  }
})
