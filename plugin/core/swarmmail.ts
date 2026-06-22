export function registerSwarmMail(api: any) {
  // SwarmMail messaging
  api.addTool({
    name: "swarmmail_init",
    description: "Initialize swarmmail for inter-agent communication",
    args: {},
    async execute() { return "SwarmMail initialized" }
  })

  api.addTool({
    name: "swarmmail_reserve",
    description: "Reserve files for swarm worker",
    args: {
      files: api.schema.array(api.schema.string()).describe("Files to reserve"),
      task_id: api.schema.string().describe("Task ID")
    },
    async execute({ files, task_id }) {
      return `Reserved ${files.length} files for task ${task_id}`
    }
  })

  api.addTool({
    name: "swarmmail_send",
    description: "Send message between swarm agents",
    args: {
      from: api.schema.string().describe("Sender agent"),
      to: api.schema.string().describe("Recipient agent"),
      message: api.schema.string().describe("Message content"),
      importance: api.schema.enum(["low", "normal", "high"]).optional().describe("Message importance")
    },
    async execute({ from, to, message, importance = "normal" }) {
      return `Message sent from ${from} to ${to} (${importance})`
    }
  })
}
