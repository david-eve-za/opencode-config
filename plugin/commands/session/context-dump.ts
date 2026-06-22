export function register(api: any) {
  api.addCommand({
    name: "context-dump",
    description: "Dump current context for debugging",
    async execute() {
      return "Context dumped"
    }
  })
}
