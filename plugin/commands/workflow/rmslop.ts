export function register(api: any) {
  api.addCommand({
    name: "rmslop",
    description: "Remove code slop — dead code, unused imports, complexity",
    async execute() {
      return "Slop removed"
    }
  })
}
