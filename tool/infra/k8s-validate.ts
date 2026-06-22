import { tool } from "@opencode-ai/plugin"
import { runCommand, truncateOutput, withTimeout } from "../core/tool-utils"

export default tool({
  description: "Validate Kubernetes manifests — schema, best practices, security",
  args: {
    path: tool.schema.string().optional().describe("Manifest file or directory (default: .)"),
    strict: tool.schema.boolean().optional().describe("Strict validation (default: false)"),
  },
  async execute({ path = ".", strict = false }) {
    const controller = new AbortController()
    
    // Try kubeval first
    let args = ["kubeval"]
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
      // Fallback: kubectl --dry-run=client
      try {
        const kubectlArgs = ["kubectl", "apply", "--dry-run=client", "-f", path]
        const kubectlResult = await withTimeout(
          runCommand(kubectlArgs, { signal: controller.signal }),
          30_000,
          controller.signal
        )
        return truncateOutput(kubectlResult)
      } catch (kubectlError) {
        return `K8s validation failed: ${kubectlError instanceof Error ? kubectlError.message : String(kubectlError)}`
      }
    }
  }
})
