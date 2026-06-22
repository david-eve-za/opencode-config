export function register(api: any) {
  api.addCommand({
    name: "swarm",
    description: "Initialize and run a swarm for complex multi-file tasks",
    async execute(args: any) {
      return "Swarm initialized"
    }
  })
}
