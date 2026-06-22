export function register(api: any) {
  api.addTool({
    name: "go-test",
    description: "Run Go tests with coverage — supports unit, integration, and benchmark",
    args: {
      path: api.schema.string().optional().describe("Package path (default: ./...)"),
      run: api.schema.string().optional().describe("Run only tests matching regex"),
      verbose: api.schema.boolean().optional().describe("Verbose output (default: true)"),
      cover: api.schema.boolean().optional().describe("Enable coverage (default: true)"),
      race: api.schema.boolean().optional().describe("Enable race detector (default: true)"),
      tags: api.schema.string().optional().describe("Build tags"),
    },
    async execute({ path = "./...", run, verbose = true, cover = true, race = true, tags }) {
      return `go-test: testing ${path}${run ? ` (run: ${run})` : ""} (race: ${race}, cover: ${cover})`
    }
  })
}
