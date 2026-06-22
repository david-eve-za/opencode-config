export function register(api: any) {
  api.addCommand({
    name: "estimate",
    description: "Estimate effort for a task or project",
    async execute() {
      return "Estimate generated"
    }
  })
}
