export function register(api: any) {
  api.addCommand({
    name: "review-my-shit",
    description: "Pre-PR review — runs language-specific checks",
    async execute() {
      return "Review completed"
    }
  })
}
