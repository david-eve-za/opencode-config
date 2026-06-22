export function register(api: any) {
  api.addTool({
    name: "repo-crawl",
    description: "GitHub API explorer — search repos, issues, PRs, code across GitHub",
    args: {
      query: api.schema.string().describe("Search query"),
      type: api.schema.enum(["repos", "issues", "prs", "code"]).optional().describe("Search type"),
      repo: api.schema.string().optional().describe("Specific repository (owner/name)"),
    },
    async execute({ query, type = "repos", repo }) {
      return `repo-crawl: searching ${type} for "${query}"${repo ? ` in ${repo}` : ""}`
    }
  })
}
