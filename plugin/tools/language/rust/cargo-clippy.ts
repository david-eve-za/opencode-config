export function register(api: any) {
  api.addTool({
    name: "cargo-clippy",
    description: "Run Clippy — Rust linter with pedantic suggestions",
    args: {
      severity: api.schema.enum(["warn", "deny"]).optional().describe("Minimum severity (default: warn)"),
      fix: api.schema.boolean().optional().describe("Auto-fix where possible (default: false)"),
    },
    async execute({ severity = "warn", fix = false }) {
      return `cargo-clippy: linting (severity: ${severity}, fix: ${fix})`
    }
  })
}
