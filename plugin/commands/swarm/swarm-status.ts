export function register(api: any) {
  api.addCommand({
    name: "swarm-status",
    description: "Check swarm progress",
    async execute() {
      return "Swarm status retrieved"
    }
  })
}
