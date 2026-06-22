export function register(api: any) {
  api.addCommand({
    name: "iterate",
    description: "Iterate on a task until success criteria met",
    async execute() {
      return "Iteration completed"
    }
  })
}
