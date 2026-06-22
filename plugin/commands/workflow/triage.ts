export function register(api: any) {
  api.addCommand({
    name: "triage",
    description: "Triage and route tasks to appropriate agents",
    async execute() {
      return "Task triaged and routed"
    }
  })
}
