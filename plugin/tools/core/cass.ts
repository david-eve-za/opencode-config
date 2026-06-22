export function register(api: any) {
  api.addTool({
    name: "cass",
    description: "Cross-Agent Session Search — search across all previous agent sessions",
    args: {
      query: api.schema.string().describe("Search query"),
      limit: api.schema.number().optional().describe("Max results (default: 10)"),
    },
    async execute({ query, limit = 10 }) {
      return `cass: searching for "${query}" (limit: ${limit})`
    }
  })
}
