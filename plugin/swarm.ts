import { registerHive } from "./core/hive"
import { registerSwarm } from "./core/swarm"
import { registerSwarmMail } from "./core/swarmmail"
import { registerStructuredLogging } from "./core/structured-logging"
import { registerBead } from "./core/bead"
import { registerAgents } from "./agents"
import { registerTools } from "./tools"
import { registerCommands } from "./commands"

export default function plugin(api: any) {
  registerHive(api)
  registerSwarm(api)
  registerSwarmMail(api)
  registerStructuredLogging(api)
  registerBead(api)
  registerAgents(api)
  registerTools(api)
  registerCommands(api)
}
