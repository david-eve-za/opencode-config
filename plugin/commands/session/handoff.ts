export function register(api: any) {
  api.addCommand({
    name: "handoff",
    description: "Create session handoff for next agent",
    async execute() {
      return "Handoff created"
    }
  })
}
