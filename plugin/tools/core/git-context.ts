export function register(api: any) {
  api.addTool({
    name: "git-context",
    description: "Git status summary — branch, changes, recent commits, contributors",
    args: {
      path: api.schema.string().optional().describe("Repository path (default: .)"),
      commits: api.schema.number().optional().describe("Number of recent commits (default: 10)"),
    },
    async execute({ path = ".", commits = 10 }) {
      return `git-context: status for ${path} (last ${commits} commits)`
    }
  })
}
