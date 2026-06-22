import { Goal, StopCondition, Subgoal } from './types';
import { GoalManager } from './GoalManager';
import { ConditionEvaluator } from './ConditionEvaluator';
import { CommandExecutor, ExecOptions } from './CommandExecutor';
import { StructuredLogger } from './StructuredLogger';

export interface LoopOptions {
  maxIterations?: number;
  timeout?: number;
  stopConditions?: StopCondition[];
  goalId?: string;
  autoPlan?: boolean;
  delegateToSwarm?: boolean;
  confirmDestructive?: boolean;
  verbose?: boolean;
}

export interface LoopResult {
  goal: Goal;
  success: boolean;
  iterations: number;
  duration: number;
  error?: string;
}

export interface LoopProgressEvent {
  type: 'iteration_start' | 'action_executed' | 'reflection' | 'iteration_complete' | 'loop_complete' | 'loop_error';
  iteration: number;
  goalId: string;
  timestamp: Date;
  data?: any;
}

export class LoopController {
  private goalManager: GoalManager;
  private evaluator: ConditionEvaluator;
  private executor: CommandExecutor;
  private logger: StructuredLogger;
  
  private currentGoal: Goal | null = null;
  private abortController: AbortController | null = null;
  private startTime: number = 0;
  private interrupted: boolean = false;
  private maxIterations: number = 10;
  private timeoutMs: number = 30 * 60 * 1000; // 30 minutes default
  private confirmDestructive: boolean = true;
  private verbose: boolean = false;
  private eventListeners: Map<string, ((event: LoopProgressEvent) => void)[]> = new Map();

  constructor(
    goalManager: GoalManager,
    evaluator: ConditionEvaluator,
    executor: CommandExecutor,
    logger: StructuredLogger
  ) {
    this.goalManager = goalManager;
    this.evaluator = evaluator;
    this.executor = executor;
    this.executor;
    this.logger = logger;
  }

  on(event: string, listener: (event: LoopProgressEvent) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  off(event: string, listener: (event: LoopProgressEvent) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    }
  }

  private emit(event: LoopProgressEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(event);
        } catch (error) {
          this.logger.error(`Error in event listener: ${error}`);
        }
      }
    }
  }

  async execute(goalIdOrObjective: string, options: LoopOptions = {}): Promise<LoopResult> {
    this.startTime = Date.now();
    this.maxIterations = options.maxIterations || 10;
    this.timeoutMs = options.timeout || 30 * 60 * 1000;
    this.confirmDestructive = options.confirmDestructive !== false;
    this.verbose = options.verbose || false;
    this.interrupted = false;

    this.abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      this.abortController.abort();
      this.interrupted = true;
    }, this.timeoutMs);

    try {
      let goal: Goal;
      
      if (options.goalId) {
        const existing = await this.goalManager.get(options.goalId);
        if (!existing) throw new Error(`Goal not found: ${options.goalId}`);
        goal = existing;
      } else {
        goal = await this.goalManager.create(goalIdOrObjective, {
          maxIterations: options.maxIterations,
          stopConditions: options.stopConditions,
        });
      }

      this.currentGoal = goal;
      goal.status = 'running';
      goal.maxIterations = this.maxIterations;
      if (options.stopConditions) {
        goal.stopConditions = options.stopConditions;
      }
      await this.goalManager.save(goal);

      this.emit({
        type: 'loop_complete',
        iteration: 0,
        goalId: goal.id,
        timestamp: new Date(),
        data: { action: 'started', objective: goal.objective },
      });

      const result = await this.runLoop(goal);

      const duration = Date.now() - this.startTime;
      return {
        goal: result.goal,
        success: result.success,
        iterations: result.goal.iterations,
        duration,
        error: result.error,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const duration = Date.now() - this.startTime;
      
      if (this.currentGoal) {
        this.currentGoal.status = 'failed';
        await this.goalManager.save(this.currentGoal);
      }

      this.emit({
        type: 'loop_error',
        iteration: this.currentGoal?.iterations || 0,
        goalId: this.currentGoal?.id || '',
        timestamp: new Date(),
        data: { error: errorMessage },
      });

      return {
        goal: this.currentGoal!,
        success: false,
        iterations: this.currentGoal?.iterations || 0,
        duration,
        error: errorMessage,
      };
    } finally {
      clearTimeout(this.timeoutId);
      this.currentGoal = null;
    }
  }

  private async runLoop(goal: Goal): Promise<{ goal: Goal; success: boolean; error?: string }> {
    for (let i = 0; i < this.maxIterations; i++) {
      if (this.interrupted || this.abortController.signal.aborted) {
        goal.status = 'paused';
        return { goal, success: false, error: 'Interrupted' };
      }

      goal.iterations = i + 1;

      this.emit({
        type: 'iteration_start',
        iteration: i + 1,
        goalId: goal.id,
        timestamp: new Date(),
        data: { progress: goal.progress },
      });

      const shouldStop = await this.evaluator.evaluate(goal);
      if (shouldStop.shouldStop) {
        goal.status = 'completed';
        goal.progress = 1.0;
        await this.goalManager.save(goal);
        return { goal, success: true };
      }

      const action = await this.planNextAction(goal);
      
      if (!action) {
        goal.status = 'failed';
        return { goal, success: false, error: 'No action planned' };
      }

      const result = await this.executeAction(action, goal);
      
      await this.reflect(goal, result);
      
      await this.goalManager.save(goal);

      this.emit({
        type: 'iteration_complete',
        iteration: i + 1,
        goalId: goal.id,
        timestamp: new Date(),
        data: { progress: goal.progress, result: result.success },
      });
    }

    goal.status = 'paused';
    return { goal, success: false, error: 'Max iterations reached' };
  }

  private async planNextAction(goal: Goal): Promise<{ command: string; args: string[]; description: string } | null> {
    if (goal.subgoals.length > 0) {
      const pendingSubgoal = goal.subgoals.find(sg => sg.status === 'pending');
      if (pendingSubgoal) {
        pendingSubgoal.status = 'running';
        return {
          command: 'subgoal',
          args: [pendingSubgoal.id],
          description: `Execute subgoal: ${pendingSubgoal.description}`,
        };
      }
    }

    if (this.shouldDelegateToSwarm()) {
      return {
        command: 'swarm',
        args: ['decompose', goal.objective],
        description: 'Delegate to swarm for parallel execution',
      };
    }

    return {
      command: 'analyze',
      args: ['next-action', goal.objective],
      description: 'Analyze and determine next action',
    };
  }

  private shouldDelegateToSwarm(): boolean {
    return false; // Could be enhanced with complexity detection
  }

  private async executeAction(
    action: { command: string; args: string[]; description: string },
    goal: Goal
  ): Promise<{ success: boolean; output: string; error?: string }> {
    this.emit({
      type: 'action_executed',
      iteration: goal.iterations,
      goalId: goal.id,
      timestamp: new Date(),
      data: { action: action.description },
    });

    try {
      const options: ExecOptions = {
        timeout: 120000,
        signal: this.abortController.signal,
      };

      const result = await this.executor.execute([action.command, ...action.args], {
        timeout: 120000,
        signal: this.abortController.signal,
      });

      if (result.exitCode === 0) {
        return { success: true, output: result.stdout };
      } else {
        return { success: false, output: result.stdout, error: result.stderr };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, output: '', error: errorMessage };
    }
  }

  private async reflect(goal: Goal, result: { success: boolean; output: string; error?: string }): Promise<void> {
    this.emit({
      type: 'reflection',
      iteration: goal.iterations,
      goalId: goal.id,
      timestamp: new Date(),
      data: { success: result.success, progress: goal.progress },
    });

    if (result.success) {
      goal.progress = Math.min(1.0, goal.progress + 0.1);
    }
  }

  interrupt(): void {
    this.interrupted = true;
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  pause(): void {
    this.interrupted = true;
  }

  resume(): void {
    this.interrupted = false;
    this.abortController = new AbortController();
  }

  getCurrentGoal(): Goal | null {
    return this.currentGoal;
  }

  isRunning(): boolean {
    return this.currentGoal !== null && !this.interrupted;
  }
}