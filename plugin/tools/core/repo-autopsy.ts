export function register(api: any) {
  api.addTool({
    name: "repo-autopsy",
    description: "Deep repository analysis — structure, dependencies, complexity, history",
    args: {
      path: api.schema.string().optional().describe("Repository path (default: .)"),
      depth: api.schema.enum(["shallow", "medium", "deep"]).optional().describe("Analysis depth"),
    },
    async execute({ path = ".", depth = "medium" }) {
      return `repo-autopsy: analyzing ${path} at ${depth} depth`
    }
  })
}
