export function register(api: any) {
  api.addCommand({
    name: "retro",
    description: "Run a retrospective on completed work",
    async execute() {
      return "Retrospective completed"
    }
  })
}
