import { tool } from "@opencode-ai/plugin"
import { runCommand, truncateOutput, withTimeout } from "../core/tool-utils"

export default tool({
  description: "Run Terraform plan — preview infrastructure changes",
  args: {
    dir: tool.schema.string().optional().describe("Terraform directory (default: .)"),
    var_file: tool.schema.string().optional().describe("Variable file"),
    out: tool.schema.string().optional().describe("Plan output file"),
  },
  async execute({ dir = ".", var_file, out }) {
    const controller = new AbortController()
    
    const args = ["terraform", "plan"]
    if (var_file) args.push("-var-file", var_file)
    if (out) args.push("-out", out)
    args.push("-chdir", dir)

    try {
      const result = await withTimeout(
        runCommand(args, { signal: controller.signal }),
        60_000,
        controller.signal
      )
      return truncateOutput(result)
    } catch (error) {
      return `terraform plan failed: ${error instanceof Error ? error.message : String(error)}`
    }
  }
})
