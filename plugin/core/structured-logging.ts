export function registerStructuredLogging(api: any) {
  // Structured logging
  api.addTool({
    name: "structured_log",
    description: "Log structured event",
    args: {
      level: api.schema.enum(["debug", "info", "warn", "error"]).describe("Log level"),
      event: api.schema.string().describe("Event name"),
      data: api.schema.record(api.schema.string(), api.schema.unknown()).optional().describe("Event data")
    },
    async execute({ level, event, data }) {
      console.log(JSON.stringify({ level, event, data, timestamp: new Date().toISOString() }))
      return `Logged: ${event}`
    }
  })

  api.addTool({
    name: "structured_error",
    description: "Log structured error",
    args: {
      error: api.schema.string().describe("Error message"),
      context: api.schema.record(api.schema.string(), api.schema.unknown()).optional().describe("Error context"),
      stack: api.schema.string().optional().describe("Stack trace")
    },
    async execute({ error, context, stack }) {
      console.error(JSON.stringify({ error, context, stack, timestamp: new Date().toISOString() }))
      return `Error logged: ${error}`
    }
  })
}
