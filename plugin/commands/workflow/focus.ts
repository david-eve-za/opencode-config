export function register(api: any) {
  api.addCommand({
    name: "focus",
    description: "Focus on a single task with minimal context",
    async execute() {
      return "Focused task completed"
    }
  })
}
