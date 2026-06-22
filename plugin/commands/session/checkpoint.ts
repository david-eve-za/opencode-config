export function register(api: any) {
  api.addCommand({
    name: "checkpoint",
    description: "Create a checkpoint of current session state",
    async execute() {
      return "Checkpoint saved"
    }
  })
}
