import { GoalManager } from '../../loop/GoalManager';
import { LoopController } from '../../loop/LoopController';
import { CommandExecutor } from '../../loop/CommandExecutor';
import { StructuredLogger } from '../../loop/StructuredLogger';

interface GoalCommandArgs {
  objective?: string;
  id?: string;
  list?: boolean;
  show?: string;
  pause?: string;
  resume?: string;
  delete?: string;
  maxIterations?: number;
  stopCondition?: string;
}

export async function goalCommand(
  args: GoalCommandArgs,
  context: {
    goalManager: GoalManager;
    loopController: LoopController;
    executor: CommandExecutor;
    logger: StructuredLogger;
  }
): Promise<string> {
  const { goalManager, logger } = context;
  const { objective, id, list, show, pause, resume, delete: deleteId, maxIterations, stopCondition } = args;

  try {
    if (list) {
      return await handleList(goalManager);
    }

    if (show) {
      return await handleShow(goalManager, show);
    }

    if (pause) {
      return await handlePause(goalManager, pause);
    }

    if (resume) {
      return await handleResume(goalManager, resume);
    }

    if (deleteId) {
      return await handleDelete(goalManager, deleteId);
    }

    if (objective) {
      return await handleCreate(goalManager, objective, {
        maxIterations: maxIterations || 10,
        stopCondition,
      });
    }

    if (id) {
      return await handleUpdate(goalManager, id, { maxIterations, stopCondition });
    }

    return 'Usage: /goal [objective] [--id <id>] [--list] [--show <id>] [--pause <id>] [--resume <id>] [--delete <id>] [--max-iterations <n>] [--stop-condition <type:value>]';
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Goal command failed: ${message}`);
    return `Error: ${message}`;
  }
}

async function handleList(goalManager: GoalManager): Promise<string> {
  const goals = await goalManager.list({ limit: 20 });
  
  if (goals.length === 0) {
    return 'No goals found. Create one with: /goal "your objective"';
  }

  let output = 'Goals:\n\n';
  for (const goal of goals) {
    const statusIcon = getStatusIcon(goal.status);
    const progressBar = createProgressBar(goal.progress);
    output += `${statusIcon} ${goal.id.slice(0, 8)} - ${goal.objective}\n`;
    output += `  ${progressBar} ${(goal.progress * 100).toFixed(0)}% | Iterations: ${goal.iterations}/${goal.maxIterations} | ${goal.status}\n\n`;
  }
  return output.trim();
}

async function handleShow(goalManager: GoalManager, id: string): Promise<string> {
  const goal = await goalManager.get(id);
  if (!goal) {
    return `Goal not found: ${id}`;
  }

  let output = `Goal: ${goal.id}\n`;
  output += `Objective: ${goal.objective}\n`;
  output += `Status: ${goal.status}\n`;
  output += `Progress: ${(goal.progress * 100).toFixed(1)}%\n`;
  output += `Iterations: ${goal.iterations}/${goal.maxIterations}\n`;
  output += `Created: ${goal.createdAt.toISOString()}\n`;
  output += `Updated: ${goal.updatedAt.toISOString()}\n`;
  
  if (goal.stopConditions.length > 0) {
    output += '\nStop Conditions:\n';
    for (const c of goal.stopConditions) {
      output += `  - ${c.type}: ${c.value}\n`;
    }
  }

  if (goal.subgoals.length > 0) {
    output += '\nSubgoals:\n';
    for (const sg of goal.subgoals) {
      output += `  [${sg.status}] ${sg.description}\n`;
    }
  }

  if (Object.keys(goal.metadata).length > 0) {
    output += `\nMetadata:\n${JSON.stringify(goal.metadata, null, 2)}`;
  }

  return output;
}

async function handleCreate(
  goalManager: GoalManager,
  objective: string,
  options: { maxIterations?: number; stopCondition?: string }
): Promise<string> {
  const stopConditions = options.stopCondition 
    ? parseStopConditions(options.stopCondition)
    : undefined;

  const goal = await goalManager.create(objective, {
    maxIterations: options.maxIterations,
    stopConditions,
  });

  return `Goal created: ${goal.id}\nObjective: ${goal.objective}\nMax iterations: ${goal.maxIterations}`;
}

async function handleUpdate(
  goalManager: GoalManager,
  id: string,
  options: { maxIterations?: number; stopCondition?: string }
): Promise<string> {
  const goal = await goalManager.get(id);
  if (!goal) {
    return `Goal not found: ${id}`;
  }

  if (options.maxIterations) {
    goal.maxIterations = options.maxIterations = options.maxIterations;
  }

  if (options.stopCondition) {
    goal.stopConditions = parseStopConditions(options.stopCondition);
  }

  await goalManager.save(goal);
  return `Goal ${id} updated`;
}

async function handlePause(goalManager: GoalManager, id: string): Promise<string> {
  const goal = await goalManager.pause(id);
  if (!goal) return `Goal not found: ${id}`;
  return `Goal ${id} paused`;
}

async function handleResume(goalManager: GoalManager, id: string): Promise<string> {
  const goal = await goalManager.resume(id);
  if (!goal) return `Goal not found: ${id}`;
  return `Goal ${id} resumed`;
}

async function handleDelete(goalManager: GoalManager, id: string): Promise<string> {
  const result = await goalManager.delete(id);
  if (!result) return `Goal not found: ${id}`;
  return `Goal ${id} deleted`;
}

function parseStopConditions(input: string): Array<{ type: string; value: string | number; evaluator?: string }> {
  return input.split(',').map(s => {
    const [type, ...rest] = s.trim().split(':');
    const value = rest.join(':').trim();
    const numValue = Number(value);
    return {
      type: type.trim(),
      value: isNaN(numValue) ? value : numValue,
    };
  });
}

function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    pending: '⏳',
    running: '🔄',
    paused: '⏸️',
    completed: '✅',
    failed: '❌',
  };
  return icons[status] || '❓';
}

function createProgressBar(progress: number, width = 20): string {
  const filled = Math.round(progress * width);
  const empty = width - filled;
  return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
}