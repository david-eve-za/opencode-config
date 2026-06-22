export function register(api: any) {
  api.addCommand({
    name: "repo-dive",
    description: "Deep repository analysis and documentation",
    async execute() {
      return "Repo dive completed"
    }
  })
}
