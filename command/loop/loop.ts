import { LoopController } from '../../loop/LoopController';
import { GoalManager } from '../../loop/GoalManager';
import { StructuredLogger } from '../../loop/StructuredLogger';

interface LoopCommandArgs {
  goalId?: string;
  maxIterations?: number;
  timeout?: number;
  stopCondition?: string;
  autoPlan?: boolean;
  delegateToSwarm?: boolean;
  confirmDestructive?: boolean;
  verbose?: boolean;
  pause?: boolean;
  resume?: boolean;
  stop?: boolean;
  status?: boolean;
}

export async function loopCommand(
  args: LoopCommandArgs,
  context: {
    loopController: LoopController;
    goalManager: GoalManager;
    logger: StructuredLogger;
  }
): Promise<string> {
  const { loopController, goalManager, logger } = context;
  const { 
    goalId, 
    maxIterations, 
    timeout, 
    stopCondition,
    autoPlan,
    delegateToSwarm,
    confirmDestructive,
    verbose,
    pause,
    resume,
    stop,
    status,
  } = args;

  try {
    if (status) {
      return await handleStatus(loopController, goalManager);
    }

    if (pause) {
      loopController.pause();
      return 'Loop paused';
    }

    if (resume) {
      loopController.resume();
      return 'Loop resumed';
    }

    if (stop) {
      loopController.interrupt();
      return 'Loop stopped';
    }

    const options = {
      goalId,
      maxIterations: maxIterations || 10,
      timeout: parseTimeout(timeout),
      stopCondition: parseStopConditions(stopCondition),
      autoPlan,
      delegateToSwarm,
      confirmDestructive: confirmDestructive !== false,
      verbose: verbose || false,
    };

    const result = await loopController.execute(goalId || '', options);
    
    return formatResult(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Loop command failed: ${message}`);
    return `Error: ${message}`;
  }
}

async function handleStatus(loopController: LoopController, goalManager: GoalManager): Promise<string> {
  const currentGoal = loopController.getCurrentGoal();
  
  if (!currentGoal) {
    return 'No active loop';
  }

  const isRunning = loopController.isRunning();
  let output = `Loop Status: ${isRunning ? 'Running' : 'Paused'}\n`;
  output += `Goal: ${currentGoal.objective}\n`;
  output += `Progress: ${(currentGoal.progress * 100).toFixed(1)}%\n`;
  output += `Iteration: ${currentGoal.iterations}/${currentGoal.maxIterations}\n`;
  
  return output;
}

function parseTimeout(timeout?: string): number | undefined {
  if (!timeout) return undefined;
  
  const match = timeout.match(/^(\d+)([smh]?)$/);
  if (!match) return undefined;
  
  const value = parseInt(match[1], 10);
  const unit = match[2] || 's';
  
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    default: return value * 1000;
  }
}

function parseStopConditions(input?: string): Array<{ type: string; value: string | number; evaluator?: string }> {
  if (!input) return [];
  
  return input.split(',').map(s => {
    const [type, ...rest] = s.trim().split(':');
    const value = rest.join(':').trim();
    const numValue = Number(value);
    return {
      type: type.trim(),
      value: isNaN(Number(value)) ? value : Number(value),
    };
  });
}

function formatResult(result: any): string {
  if (!result.goal) {
    return 'Loop completed with no goal';
  }

  let output = '';
  if (result.success) {
    output += '✅ Loop completed successfully\n';
  } else {
    output += `❌ Loop ${result.error ? 'failed' : 'paused'}\n`;
    if (result.error) output += `Error: ${result.error}\n`;
  }

  output += `Goal: ${result.goal.objective}\n`;
  output += `Iterations: ${result.iterations}\n`;
  output += `Duration: ${formatDuration(result.duration)}\n`;
  output += `Final Status: ${result.goal.status}\n`;
  output += `Progress: ${(result.goal.progress * 100).toFixed(1)}%\n`;

  return output;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}