export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface ExecOptions {
  timeout?: number;
  cwd?: string;
  env?: Record<string, string>;
  signal?: AbortSignal;
}

export class CommandExecutor {
  async execute(command: string | string[], options: ExecOptions = {}): Promise<ExecResult> {
    const args = Array.isArray(command) ? command : command.split(' ');
    const cmd = args[0];
    const cmdArgs = args.slice(1);

    const controller = new AbortController();
    const timeout = options.timeout || 30000;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    if (options.signal) {
      options.signal.addEventListener('abort', () => controller.abort());
    }

    try {
      const proc = Bun.spawn([cmd, ...cmdArgs], {
        cwd: options.cwd || process.cwd(),
        env: { ...process.env, ...options.env },
        stdout: 'pipe',
        stderr: 'pipe',
        signal: controller.signal,
      });

      const [stdout, stderr] = await Promise.all([
        this.readStream(proc.stdout),
        this.readStream(proc.stderr),
      ]);

      const exitCode = await proc.exited;
      clearTimeout(timeoutId);

      return {
        stdout,
        stderr,
        exitCode,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Command timed out after ${timeout}ms`);
      }
      throw error;
    }
  }

  private async readStream(stream: ReadableStream<Uint8Array>): Promise<string> {
    const reader = stream.getReader();
    let result = '';
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
    }
    result += decoder.decode();
    return result;
  }

  async executeWithRetry(
    command: string | string[],
    options: ExecOptions & { retries?: number; retryDelay?: number } = {}
  ): Promise<ExecResult> {
    const retries = options.retries || 0;
    const retryDelay = options.retryDelay || 1000;

    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await this.execute(command, options);
      } catch (error) {
        lastError = error as Error;
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }
    throw lastError;
  }
}