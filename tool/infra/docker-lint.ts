import { tool } from "@opencode-ai/plugin"
import { runCommand, truncateOutput, withTimeout } from "../core/tool-utils"

export default tool({
  description: "Lint Dockerfile — best practices, security, size optimization",
  args: {
    path: tool.schema.string().optional().describe("Dockerfile path (default: ./Dockerfile)"),
    strict: tool.schema.boolean().optional().describe("Strict mode (no exceptions)"),
  },
  async execute({ path = "./Dockerfile", strict = false }) {
    const controller = new AbortController()
    
    // Try hadolint first, fallback to docker run
    let args = ["hadolint"]
    if (strict) args.push("--strict")
    args.push(path)

    try {
      const result = await withTimeout(
        runCommand(args, { signal: controller.signal }),
        30_000,
        controller.signal
      )
      return truncateOutput(result)
    } catch (error) {
      // Fallback: docker run hadolint
      try {
        const dockerArgs = ["docker", "run", "--rm", "-i", "hadolint/hadolint"]
        if (strict) dockerArgs.push("--strict")
        dockerArgs.push("-")
        
        const dockerResult = await withTimeout(
          runCommand(dockerArgs, { signal: controller.signal }),
          30_000,
          controller.signal
        )
        return truncateOutput(dockerResult)
      } catch (dockerError) {
        return `Dockerfile lint failed: ${dockerError instanceof Error ? dockerError.message : String(dockerError)}`
      }
    }
  }
})
