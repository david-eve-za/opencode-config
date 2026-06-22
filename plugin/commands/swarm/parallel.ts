export function register(api: any) {
  api.addCommand({
    name: "parallel",
    description: "Run independent tasks in parallel",
    async execute() {
      return "Parallel tasks executed"
    }
  })
}
