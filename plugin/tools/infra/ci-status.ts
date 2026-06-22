export function register(api: any) {
  api.addTool({
    name: "ci-status",
    description: "Check CI/CD pipeline status — GitHub Actions, GitLab CI, etc.",
    args: {
      platform: api.schema.enum(["github", "gitlab", "circleci"]).optional().describe("CI platform (default: auto-detect)"),
      branch: api.schema.string().optional().describe("Branch to check (default: current)"),
    },
    async execute({ platform, branch }) {
      return `ci-status: checking ${platform || "auto"} for branch ${branch || "current"}`
    }
  })
}
