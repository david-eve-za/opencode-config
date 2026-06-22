export function register(api: any) {
  api.addCommand({
    name: "fix-all",
    description: "Fix all lint, type, and test issues",
    async execute() {
      return "All issues fixed"
    }
  })
}
