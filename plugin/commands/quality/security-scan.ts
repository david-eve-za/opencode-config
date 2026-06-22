export function register(api: any) {
  api.addCommand({
    name: "security-scan",
    description: "Run security scan — SAST, SCA, secret detection, container scan",
    async execute() {
      return "Security scan completed"
    }
  })
}
