export function registerAgents(api: any) {
  // Agent definitions are loaded from agent/ directory
  // This registry ensures they're properly registered with the plugin
  
  const agents = [
    // Swarm agents
    "swarm/planner",
    "swarm/worker", 
    "swarm/researcher",
    // Code agents
    "code/explore",
    "code/archaeologist",
    "code/reviewer",
    "code/refactorer",
    // Backend agents
    "backend/go",
    "backend/rust",
    "backend/python",
    // Frontend agents
    "frontend/react",
    "frontend/vue",
    "frontend/svelte",
    // Infra agents
    "infra/devops",
    "infra/data",
    "infra/security",
    // Mobile agents
    "mobile/swift",
    "mobile/kotlin",
    // Existing agents (defined in opencode.jsonc)
    "build",
    "plan",
    "security",
    "test-writer",
    "docs"
  ]

  // Agents areg agents.forEach(agentName => {
    api.addAgent({
      name: agentName,
      description: `Agent: ${agentName}`,
      mode: "subagent"
    })
  })
}
