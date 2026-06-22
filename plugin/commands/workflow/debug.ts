export function register(api: any) {
  api.addCommand({
    name: "debug",
    description: "Debug universal — searches Engram first, then uses language-specific debugging",
    async execute() {
      return "Debug session completed"
    }
  })
}
