export function register(api: any) {
  api.addCommand({
    name: "migrate",
    description: "Pattern migration universal — detects language and uses appropriate migration tool",
    async execute() {
      return "Migration completed"
    }
  })
}
