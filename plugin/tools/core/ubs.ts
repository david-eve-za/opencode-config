export function register(api: any) {
  api.addTool({
    name: "ubs",
    description: "Ultimate Bug Scanner — multi-language static analysis for common bug patterns",
    args: {
      path: api.schema.string().optional().describe("Path to scan (default: .)"),
      categories: api.schema.array(api.schema.string()).optional().describe("Bug categories to check (default: all)"),
    },
    async execute({ path = ".", categories }) {
      return `ubs: scanning ${path} for ${categories?.join(", ") || "all categories"}`
    }
  })
}
