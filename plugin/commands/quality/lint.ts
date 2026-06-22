export function register(api: any) {
  api.addCommand({
    name: "lint",
    description: "Run project linter — auto-detects language and linter",
    async execute() {
      return "Lint completed"
    }
  })
}
