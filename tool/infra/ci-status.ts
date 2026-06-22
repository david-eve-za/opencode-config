import { tool } from "@opencode-ai/plugin"
import { runCommand, truncateOutput, withTimeout } from "../core/tool-utils"

export default tool({
  description: "Check CI/CD pipeline status — GitHub Actions, GitLab CI, etc.",
  args: {
    platform: tool.schema.enum(["github", "gitlab", "circleci"]).optional().describe("CI platform (default: auto-detect)"),
    branch: tool.schema.string().optional().describe("Branch to check (default: current)"),
  },
  async execute({ platform, branch }) {
    const controller = new AbortController()
    
    let args: string[]
    if (platform === "github") {
      args = ["gh", "run", "list", "--branch", branch || ""]
    } else if (platform === "gitlab") {
      args = ["glab", "ci", "status", "--branch", branch || ""]
    } else if (platform === "circleci") {
      args = ["circleci", "status", "--branch", branch || ""]
    } else {
      // Auto-detect
      try {
        await Bun.$`gh auth status`.quiet()
        args = ["gh", "run", "list", "--branch", branch || ""]
      } catch {
        try {
          await Bun.$`glab auth status`.quiet()
          args = ["glab", "ci", "status", "--branch", branch || ""]
        } catch {
          return "No CI platform detected or authenticated"
        }
      }
    }

    try {
      const result = await withTimeout(
        runCommand(args, { signal: controller.signal }),
        30_000,
        controller.signal
      )
      return truncateOutput(result)
    } catch (error) {
      return `CI status check failed: ${error instanceof Error ? error.message : String(error)}`
    }
  }
})
