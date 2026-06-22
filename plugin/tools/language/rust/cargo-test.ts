export function register(api: any) {
  api.addTool({
    name: "cargo-test",
    description: "Run Rust tests — unit, integration, doc tests",
    args: {
      test: api.schema.string().optional().describe("Run only tests matching pattern"),
      nocapture: api.schema.boolean().optional().describe("Show println! output (default: false)"),
      release: api.schema.boolean().optional().describe("Run in release mode (default: false)"),
    },
    async execute({ test, nocapture = false, release = false }) {
      return `cargo-test: testing${test ? ` --test ${test}` : ""}${nocapture ? ` --nocapture` : ""}${release ? ` --release` : ""}`
    }
  })
}
