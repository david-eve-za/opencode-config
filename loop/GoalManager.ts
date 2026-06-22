import { v4 as uuidv4 } from 'uuid';
import { Goal, Subgoal, StopCondition } from './types';

export interface MemSaveParams {
  title: string;
  type: string;
  topic_key: string;
  content: string;
  scope?: string;
  session_id?: string;
}

export interface MemSearchParams {
  query: string;
  limit?: number;
  type?: string;
  topic_key?: string;
}

export interface MemGetParams {
  id: number;
}

export interface EngramClient {
  memSave(params: MemSaveParams): Promise<{ id: number; sync_id?: string }>;
  memSearch(params: MemSearchParams): Promise<any[]>;
  memGetObservation(params: MemGetParams): Promise<any>;
  memCompare(params: { memory_id_a: number; memory_id_b: number; relation: string; confidence: number; reasoning: string }): Promise<any>;
}

export class GoalManager {
  private engram: EngramClient;
  private cache: Map<string, Goal> = new Map();
  private readonly TOPIC_PREFIX = 'goals/';

  constructor(engram: EngramClient) {
    this.engram = engram;
  }

  private getTopicKey(goalId: string): string {
    return `${this.TOPIC_PREFIX}${goalId}`;
  }

  private serializeGoal(goal: Goal): string {
    return JSON.stringify({
      ...goal,
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString(),
    });
  }

  private deserializeGoal(data: string): Goal {
    const parsed = JSON.parse(data);
    return {
      ...parsed,
      createdAt: new Date(parsed.createdAt),
      updatedAt: new Date(parsed.updatedAt),
      subgoals: parsed.subgoals?.map((sg: any) => ({
        ...sg,
        status: sg.status,
      })) || [],
      stopConditions: parsed.stopConditions || [],
    };
  }

  async create(objective: string, options: {
    maxIterations?: number;
    stopConditions?: StopCondition[];
    subgoals?: Subgoal[];
    metadata?: Record<string, any>;
  } = {}): Promise<Goal> {
    const id = uuidv4();
    const now = new Date();
    
    const defaultStopConditions: StopCondition[] = [
      { type: 'max_iterations', value: options.maxIterations || 10 },
    ];

    const goal: Goal = {
      id,
      objective,
      status: 'pending',
      progress: 0,
      iterations: 0,
      maxIterations: options.maxIterations || 10,
      stopConditions: options.stopConditions || defaultStopConditions,
      subgoals: options.subgoals || [],
      createdAt: now,
      updatedAt: now,
      metadata: options.metadata || {},
    };

    await this.save(goal);
    return goal;
  }

  async save(goal: Goal): Promise<void> {
    goal.updatedAt = new Date();
    this.cache.set(goal.id, goal);
    
    const content = this.serializeGoal(goal);
    const topicKey = this.getTopicKey(goal.id);
    
    await this.engram.memSave({
      title: `Goal: ${goal.objective}`,
      type: 'goal',
      topic_key: topicKey,
      content: `**Goal**: ${goal.objective}\n\n**Status**: ${goal.status}\n**Progress**: ${goal.progress}\n**Iterations**: ${goal.iterations}/${goal.maxIterations}\n\n**Stop Conditions**:\n${goal.stopConditions.map(c => `- ${c.type}: ${c.value}`).join('\n')}\n\n**Subgoals**:\n${goal.subgoals.map(sg => `- [${sg.status}] ${sg.description}`).join('\n')}\n\n**Metadata**:\n${JSON.stringify(goal.metadata, null, 2)}\n\n**Created**: ${goal.createdAt.toISOString()}\n**Updated**: ${goal.updatedAt.toISOString()}`,
      scope: 'project',
    });
  }

  async get(id: string): Promise<Goal | null> {
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }

    const topicKey = this.getTopicKey(id);
    const results = await this.engram.memSearch({
      query: `goal:${id}`,
      type: 'goal',
      topic_key: topicKey,
      limit: 1,
    });

    if (results.length === 0) {
      return null;
    }

    const observation = await this.engram.memGetObservation({ id: results[0].id });
    const goal = this.deserializeGoal(observation.content);
    this.cache.set(goal.id, goal);
    return goal;
  }

  async list(options: {
    status?: Goal['status'];
    limit?: number;
  } = {}): Promise<Goal[]> {
    const results = await this.engram.memSearch({
      query: 'type:goal',
      type: 'goal',
      limit: options.limit || 50,
    });

    const goals: Goal[] = [];
    for (const result of results) {
      try {
        const observation = await this.engram.memGetObservation({ id: result.id });
        const goal = this.deserializeGoal(observation.content);
        
        if (!options.status || goal.status === options.status) {
          goals.push(goal);
        }
      } catch {
        // Skip corrupted entries
      }
    }

    return goals.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async update(id: string, updates: Partial<Goal>): Promise<Goal | null> {
    const goal = await this.get(id);
    if (!goal) return null;

    Object.assign(goal, updates);
    goal.updatedAt = new Date();
    await this.save(goal);
    return goal;
  }

  async delete(id: string): Promise<boolean> {
    this.cache.delete(id);
    // Note: Engram doesn't have a direct delete, we'd mark as deleted in metadata
    const goal = await this.get(id);
    if (goal) {
      goal.metadata.deleted = true;
      goal.updatedAt = new Date();
      await this.save(goal);
      return true;
    }
    return false;
  }

  async pause(id: string): Promise<Goal | null> {
    return this.update(id, { status: 'paused' });
  }

  async resume(id: string): Promise<Goal | null> {
    return this.update(id, { status: 'running' });
  }

  async getActive(): Promise<Goal | null> {
    const goals = await this.list({ status: 'running' });
    return goals[0] || null;
  }

  async getPending(): Promise<Goal[]> {
    return this.list({ status: 'pending' });
  }

  async getCompleted(limit = 10): Promise<Goal[]> {
    return this.list({ status: 'completed', limit });
  }

  clearCache(): void {
    this.cache.clear();
  }
}