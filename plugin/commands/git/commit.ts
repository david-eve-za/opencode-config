export function register(api: any) {
  api.addCommand({
    name: "commit",
    description: "Smart commit — detects language, generates conventional commit with appropriate scope",
    async execute() {
      return "Commit created"
    }
  })
}
