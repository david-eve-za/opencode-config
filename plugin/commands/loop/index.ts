import { goalCommand } from '../../../command/loop/goal';
import { loopCommand } from '../../../command/loop/loop';
import { GoalManager } from '../../../loop/GoalManager';
import { LoopController } from '../../../loop/LoopController';
import { CommandExecutor } from '../../../loop/CommandExecutor';
import { StructuredLogger } from '../../../loop/StructuredLogger';

export function registerLoopCommands(api: any) {
  const logger = new StructuredLogger();
  const executor = new (require('../../../loop/CommandExecutor').CommandExecutor)();
  const goalManager = new (require('../../../loop/GoalManager').GoalManager)({
    memSave: async (params: any) => {
      return api.memSave?.(params) || { id: Date.now() };
    },
    memSearch: async (params: any) => {
      return api.memSearch?.(params) || [];
    },
    memGetObservation: async (params: any) => {
      return api.memGetObservation?.(params) || { content: '{}' };
    },
    memCompare: async (params: any) => {
      return api.memCompare?.(params) || {};
    },
  });
  const executorInstance = new CommandExecutor();
  const evaluator = new (require('../../../loop/ConditionEvaluator').ConditionEvaluator)(executorInstance);
  const loopController = new (require('../../../loop/LoopController').LoopController)(
    goalManager,
    new (require('../../../loop/ConditionEvaluator').ConditionEvaluator)(executorInstance),
    executorInstance,
    new StructuredLogger()
  );

  api.addCommand({
    name: 'goal',
    description: 'Manage goals - create, list, show, update, pause, resume, delete',
    args: {
      objective: { type: 'string', description: 'Goal objective' },
      id: { type: 'string', description: 'Goal ID' },
      list: { type: 'boolean', description: 'List all goals' },
      show: { type: 'string', description: 'Show goal details' },
      pause: { type: 'string', description: 'Pause goal' },
      resume: { type: 'string', description: 'Resume goal' },
      delete: { type: 'string', description: 'Delete goal' },
      maxIterations: { type: 'number', description: 'Max iterations' },
      stopCondition: { type: 'string', description: 'Stop condition (type:value,...)' },
    },
    async execute(args: any) {
      const { goalCommand } = require('../../../command/loop/goal');
      return goalCommand(args, {
        goalManager: new (require('../../../loop/GoalManager').GoalManager)({
          memSave: async (params: any) => api.memSave?.(params) || { id: Date.now() },
          memSearch: async (params: any) => api.memSearch?.(params) || [],
          memGetObservation: async (params: any) => api.memGetObservation?.(params) || { content: '{}' },
          memCompare: async (params: any) => api.memCompare?.(params) || {},
        }),
        loopController: new (require('../../../loop/LoopController').LoopController)(
          new (require('../../../loop/GoalManager').GoalManager)({
            memSave: async (params: any) => api.memSave?.(params) || { id: Date.now() },
            memSearch: async (params: any) => api.memSearch?.(params) || [],
            memGetObservation: async (params: any) => api.memGetObservation?.(params) || { content: '{}' },
            memCompare: async (params: any) => api.memCompare?.(params) || {},
          }),
          new (require('../../../loop/ConditionEvaluator').ConditionEvaluator)(new CommandExecutor()),
          new CommandExecutor(),
          new StructuredLogger()
        ),
        executor: new CommandExecutor(),
        logger: new StructuredLogger(),
      });
    },
  });

  api.addCommand({
    name: 'loop',
    description: 'Execute autonomous loop until goal achieved',
    args: {
      goalId: { type: 'string', description: 'Goal ID to execute' },
      maxIterations: { type: 'number', description: 'Maximum iterations' },
      timeout: { type: 'string', description: 'Timeout (e.g. 30m, 1h)' },
      stopCondition: { type: 'string', description: 'Stop condition (type:value,...)' },
      autoPlan: { type: 'boolean', description: 'Auto-generate plan' },
      delegateToSwarm: { type: 'boolean', description: 'Delegate to swarm' },
      confirmDestructive: { type: 'boolean', description: 'Confirm destructive actions' },
      verbose: { type: 'boolean', description: 'Verbose output' },
      pause: { type: 'boolean', description: 'Pause loop' },
      resume: { type: 'boolean', description: 'Resume loop' },
      stop: { type: 'boolean', description: 'Stop loop' },
      status: { type: 'boolean', description: 'Show loop status' },
    },
    async execute(args: any) {
      const { loopCommand } = require('../../../command/loop/loop');
      return loopCommand(args, {
        loopController: new (require('../../../loop/LoopController').LoopController)(
          new (require('../../../loop/GoalManager').GoalManager)({
            memSave: async (params: any) => api.memSave?.(params) || { id: Date.now() },
            memSearch: async (params: any) => api.memSearch?.(params) || [],
            memGetObservation: async (params: any) => api.memGetObservation?.(params) || { content: '{}' },
            memCompare: async (params: any) => api.memCompare?.(params) || {},
          }),
          new (require('../../../loop/ConditionEvaluator').ConditionEvaluator)(new CommandExecutor()),
          new CommandExecutor(),
          new StructuredLogger()
        ),
        goalManager: new (require('../../../loop/GoalManager').GoalManager)({
          memSave: async (params: any) => api.memSave?.(params) || { id: Date.now() },
          memSearch: async (params: any) => api.memSearch?.(params) || [],
          memGetObservation: async (params: any) => api.memGetObservation?.(params) || { content: '{}' },
          memCompare: async (params: any) => api.memCompare?.(params) || {},
        }),
        logger: new StructuredLogger(),
      });
    },
  });
}