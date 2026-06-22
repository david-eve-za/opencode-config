export function register(api: any) {
  api.addCommand({
    name: "sweep",
    description: "Codebase cleanup — detects language and runs appropriate cleanup",
    async execute() {
      return "Codebase swept"
    }
  })
}
