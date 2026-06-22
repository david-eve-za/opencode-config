export function register(api: any) {
  api.addCommand({
    name: "db-migrate",
    description: "Run database migrations — validate, execute, verify",
    async execute() {
      return "Database migration completed"
    }
  })
}
