export function register(api: any) {
  api.addTool({
    name: "find-exports",
    description: "Find where a symbol is exported from in the codebase (multi-language)",
    args: {
      name: api.schema.string().describe("Symbol name to find"),
      language: api.schema.enum(["typescript", "go", "rust", "python", "java", "csharp", "auto"]).optional().describe("Language (default: auto-detect from extension)"),
      dir: api.schema.string().optional().describe("Directory to search (default: .)"),
    },
    async execute({ name, language = "auto", dir = "." }) {
      return `find-exports: searching for ${name} in ${dir} (${language})`
    }
  })
}
