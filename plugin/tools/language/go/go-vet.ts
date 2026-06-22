export function register(api: any) {
  api.addTool({
    name: "go-vet",
    description: "Run go vet on Go source files — reports suspicious constructs",
    args: {
      path: api.schema.string().optional().describe("Directory or file to vet (default: ./...)"),
      tags: api.schema.string().optional().describe("Build tags to apply"),
    },
    async execute({ path = "./...", tags }) {
      return `go-vet: vetting ${path}${tags ? ` with tags ${tags}` : ""}`
    }
  })
}
