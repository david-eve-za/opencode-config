export function register(api: any) {
  api.addCommand({
    name: "pr-create",
    description: "Create pull request with generated description",
    async execute() {
      return "PR created"
    }
  })
}
