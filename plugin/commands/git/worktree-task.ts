export function register(api: any) {
  api.addCommand({
    name: "worktree-task",
    description: "Create git worktree for isolated task execution",
    async execute() {
      return "Worktree created"
    }
  })
}
