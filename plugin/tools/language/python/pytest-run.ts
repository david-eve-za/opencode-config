export function register(api: any) {
  api.addTool({
    name: "pytest-run",
    description: "Run pytest — Python test framework with coverage",
    args: {
      path: api.schema.string().optional().describe("Test path (default: .)"),
      keyword: api.schema.string().optional().describe("Run only tests matching keyword"),
      verbose: api.schema.boolean().optional().describe("Verbose output (default: true)"),
      coverage: api.schema.boolean().optional().describe("Enable coverage report (default: true)"),
    },
    async execute({ path = ".", keyword, verbose = true, coverage = true }) {
      return `pytest-run: testing ${path}${keyword ? ` -k ${keyword}` : ""} (cov: ${coverage})`
    }
  })
}
