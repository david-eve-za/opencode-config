export interface Goal {
  id: string;
  objective: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  iterations: number;
  maxIterations: number;
  stopConditions: StopCondition[];
  subgoals: Subgoal[];
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

export interface StopCondition {
  type: 'max_iterations' | 'tests_pass' | 'build_success' | 'custom';
  value: string | number;
  evaluator?: string;
}

export interface Subgoal {
  id: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  assignedAgent?: string;
  result?: any;
}

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
}

export interface LoopState {
  currentGoalId?: string;
  isRunning: boolean;
  interrupted: boolean;
  startTime: Date;
}

export interface SubgoalPlan {
  subgoals: Subgoal[];
  estimatedIterations: number;
}