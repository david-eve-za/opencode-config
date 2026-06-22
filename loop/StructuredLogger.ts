export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
}

export class StructuredLogger {
  private logs: LogEntry[] = [];
  private minLevel: LogLevel = 'info';
  private maxLogs: number = 10000;
  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  setLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.minLevel];
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    const prefix = `[${level.toUpperCase()}]`;
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    console.log(`${new Date().toISOString()} ${prefix} ${message}${contextStr}`);
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, any>): void {
    this.log('error', message, context);
  }

  getLogs(level?: LogLevel, limit?: number): LogEntry[] {
    let filtered = this.logs;
    if (level) {
      filtered = filtered.filter(l => this.levelPriority[l.level] >= this.levelPriority[level]);
    }
    if (limit) {
      filtered = filtered.slice(-limit);
    }
    return filtered;
  }

  clear(): void {
    this.logs = [];
  }

  export(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}