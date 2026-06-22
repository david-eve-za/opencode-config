// Command registry - imports and registers all commands

// Swarm commands
import { register as swarmCmd } from "./swarm/swarm"
import { register as swarmStatus } from "./swarm/swarm-status"
import { register as swarmCollect } from "./swarm/swarm-collect"
import { register as parallel } from "./swarm/parallel"

// Workflow commands
import { register as test } from "./workflow/test"
import { register as debug } from "./workflow/debug"
import { register as iterate } from "./workflow/iterate"
import { register as fixAll } from "./workflow/fix-all"
import { register as sweep } from "./workflow/sweep"
import { register as focus } from "./workflow/focus"
import { register as rmslop } from "./workflow/rmslop"
import { register as triage } from "./workflow/triage"

// Git commands
import { register as commit } from "./git/commit"
import { register as prCreate } from "./git/pr-create"
import { register as worktreeTask } from "./git/worktree-task"

// Session commands
import { register as handoff } from "./session/handoff"
import { register as checkpoint } from "./session/checkpoint"
import { register as contextDump } from "./session/context-dump"

// Quality commands
import { register as reviewMyShit } from "./quality/review-my-shit"
import { register as lint } from "./quality/lint"
import { register as securityScan } from "./quality/security-scan"

// Infra commands
import { register as deployCheck } from "./infra/deploy-check"
import { register as infraPlan } from "./infra/infra-plan"
import { register as dbMigrate } from "./infra/db-migrate"

// Meta commands
import { register as retro } from "./meta/retro"
import { register as estimate } from "./meta/estimate"
import { register as standup } from "./meta/standup"
import { register as migrate } from "./meta/migrate"
import { register as repoDive } from "./meta/repo-dive"

export function registerCommands(api: any) {
  // Swarm
  swarmCmd(api)
  swarmStatus(api)
  swarmCollect(api)
  parallel(api)

  // Workflow
  test(api)
  debug(api)
  iterate(api)
  fixAll(api)
  sweep(api)
  focus(api)
  rmslop(api)
  triage(api)

  // Git
  commit(api)
  prCreate(api)
  worktreeTask(api)

  // Session
  handoff(api)
  checkpoint(api)
  contextDump(api)

  // Quality
  reviewMyShit(api)
  lint(api)
  securityScan(api)

  // Infra
  deployCheck(api)
  infraPlan(api)
  dbMigrate(api)

  // Meta
  retro(api)
  estimate(api)
  standup(api)
  migrate(api)
  repoDive(api)
}
