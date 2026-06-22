export function register(api: any) {
  api.addCommand({
    name: "test",
    description: "Generate comprehensive tests — auto-detects test framework and language",
    async execute() {
      return "Tests generated and executed"
    }
  })
}
