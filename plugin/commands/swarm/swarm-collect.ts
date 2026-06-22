export function register(api: any) {
  api.addCommand({
    name: "swarm-collect",
    description: "Collect swarm results",
    async execute() {
      return "Swarm results collected"
    }
  })
}
