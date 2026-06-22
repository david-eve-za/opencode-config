import { Goal, StopCondition } from './types';
import { CommandExecutor } from './CommandExecutor';

export class ConditionEvaluator {
  private executor: CommandExecutor;

  constructor(executor: CommandExecutor) {
    this.executor = executor;
  }

  async evaluate(goal: Goal): Promise<{ shouldStop: boolean; reason?: string }> {
    for (const condition of goal.stopConditions) {
      const result = await this.evaluateCondition(goal, condition);
      if (result.shouldStop) {
        return result;
      }
    }
    return { shouldStop: false };
  }

  private async evaluateCondition(goal: Goal, condition: StopCondition): Promise<{ shouldStop: boolean; reason?: string }> {
    switch (condition.type) {
      case 'max_iterations':
        if (goal.iterations >= (condition.value as number)) {
          return { shouldStop: true, reason: `Max iterations reached (${condition.value})` };
        }
        break;

      case 'tests_pass':
        const testResult = await this.runTestCommand();
        if (testResult.success) {
          return { shouldStop: true, reason: 'All tests passing' };
        }
        break;

      case 'build_success':
        const buildResult = await this.runBuildCommand();
        if (buildResult.success) {
          return { shouldStop: true, reason: 'Build successful' };
        }
        break;

      case 'custom':
        const customResult = await this.runCustomCommand(condition.value as string);
        if (customResult.success) {
          return { shouldStop: true, reason: `Custom condition met: ${condition.value}` };
        }
        break;

      case 'timeout':
        // Handled by LoopController timeout
        break;

      case 'goal_complete':
        if (goal.progress >= 1.0) {
          return { shouldStop: true, reason: 'Goal progress complete' };
        }
        break;

      case 'no_progress':
        // Could track if progress hasn't changed in N iterations
        break;

      case 'all_subgoals_complete':
        if (goal.subgoals.length > 0 && goal.subgoals.every(sg => sg.status === 'completed')) {
          return { shouldStop: true, reason: 'All subgoals completed' };
        }
        break;
    }
    return { shouldStop: false };
  }

  private async runTestCommand(): Promise<{ success: boolean; output: string }> {
    try {
      const result = await this.executor.execute(['test'], { timeout: 60000 });
      return { success: result.exitCode === 0, output: result.stdout };
    } catch (error) {
      return { success: false, output: String(error) };
    }
  }

  private async runBuildCommand(): Promise<{ success: boolean; output: string }> {
    try {
      const result = await this.executor.execute(['build'], { timeout: 60000 });
      return { success: result.exitCode === 0, output: result.stdout };
    } catch (error) {
      return { success: false, output: String(error) };
    }
  }

  private async runCustomCommand(command: string): Promise<{ success: boolean; output: string }> {
    try {
      const args = command.split(' ');
      const result = await this.executor.execute(args, { timeout: 120000 });
      return { success: result.exitCode === 0, output: result.stdout };
    } catch (error) {
      return { success: false, output: String(error) };
    }
  }
}