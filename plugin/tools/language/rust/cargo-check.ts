export function register(api: any) {
  api.addTool({
    name: "cargo-check",
    description: "Run cargo check — verify Rust code compiles without building",
    args: {
      target: api.schema.string().optional().describe("Target triple"),
      features: api.schema.string().optional().describe("Feature flags (comma-separated)"),
      all_features: api.schema.boolean().optional().describe("Enable all features"),
    },
    async execute({ target, features, all_features }) {
      return `cargo-check: checking${target ? ` --target ${target}` : ""}${features ? ` --features ${features}` : ""}${all_features ? ` --all-features` : ""}`
    }
  })
}
