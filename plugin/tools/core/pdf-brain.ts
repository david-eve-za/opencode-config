export function register(api: any) {
  api.addTool({
    name: "pdf-brain",
    description: "PDF knowledge base — extract, search, and index PDF documents",
    args: {
      action: api.schema.enum(["index", "search", "extract"]).describe("Action to perform"),
      path: api.schema.string().optional().describe("PDF file or directory path"),
      query: api.schema.string().optional().describe("Search query (for 'search' action)"),
    },
    async execute({ action, path = ".", query }) {
      return `pdf-brain: ${action} on ${path}${query ? ` (query: ${query})` : ""}`
    }
  })
}
