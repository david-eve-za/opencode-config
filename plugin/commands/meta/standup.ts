export function register(api: any) {
  api.addCommand({
    name: "standup",
    description: "Generate daily standup summary",
    async execute() {
      return "Standup generated"
    }
  })
}
