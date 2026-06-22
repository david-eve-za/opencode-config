import { tool } from "@opencode-ai/plugin"

/**
 * Truncate output to prevent context bloat
 */
export function truncateOutput(output: string, maxLines: number = 100): string {
  const lines = output.split('\n')
  if (lines.length <= maxLines) return output
  return lines.slice(0, maxLines).join('\n') + `\n... (${lines.length - maxLines} more lines truncated)`
}

/**
 * Format error for consistent error handling
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n${error.stack ?? ''}`
  }
  return String(error)
}

/**
 * Execute command with timeout and abort signal handling
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  signal?: AbortSignal
): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  if (signal) {
    signal.addEventListener('abort', () => controller.abort())
  }

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(new Error('Operation timed out or was aborted'))
        })
      })
    ])
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Run a shell command with proper error handling
 */
export async function runCommand(
  args: string[],
  options: { cwd?: string; timeout?: number; signal?: AbortSignal } = {}
): Promise<string> {
  const { cwd = process.cwd(), timeout = 30_000, signal } = options

  return withTimeout(
    new Promise((resolve, reject) => {
      const proc = Bun.spawn(args, {
        cwd,
        stdout: 'pipe',
        stderr: 'pipe'
      })

      let stdout = ''
      let stderr = ''

      proc.stdout?.on('data', (data) => {
        stdout += new TextDecoder().decode(data)
      })

      proc.stderr?.on('data', (data) => {
        stderr += new TextDecoder().decode(data)
      })

      proc.exited.then((code) => {
        if (code === 0) {
          resolve(stdout || stderr)
        } else {
          reject(new Error(`Command failed (exit ${code}): ${args.join(' ')}\n${stderr}`))
        }
      })
    }),
    timeout,
    signal
  )
}

/**
 * Detect project language from file system
 */
export async function detectProjectLanguage(cwd: string = process.cwd()): Promise<string[]> {
  const languages: string[] = []

  const checks = [
    { file: 'go.mod', lang: 'go' },
    { file: 'Cargo.toml', lang: 'rust' },
    { file: 'pyproject.toml', lang: 'python' },
    { file: 'package.json', lang: 'typescript' },
    { file: 'pom.xml', lang: 'java' },
    { file: 'build.gradle', lang: 'java' },
    { file: '*.csproj', lang: 'csharp' },
    { file: 'Dockerfile', lang: 'docker' },
    { file: '*.tf', lang: 'terraform' },
    { file: '*.sql', lang: 'sql' }
  ]

  for (const { file, lang } of checks) {
    try {
      const matches = await Bun.$`find ${cwd} -name "${file}" -maxdepth 3 2>/dev/null | head -1`.text()
      if (matches.trim()) {
        languages.push(lang)
      }
    } catch {
      // ignore
    }
  }

  return languages
}

/**
 * Parse pkg-scripts from various config files
 */
export async function parsePackageScripts(cwd: string = process.cwd()): Promise<Record<string, string>> {
  const scripts: Record<string, string> = {}

  // package.json (Node.js)
  try {
    const pkg = await Bun.file(`${cwd}/package.json`).json()
    if (pkg.scripts) {
      Object.assign(scripts, pkg.scripts)
    }
  } catch {}

  // Makefile (Go, etc.)
  try {
    const makefile = await Bun.file(`${cwd}/Makefile`).text()
    const matches = makefile.matchAll(/^(\w+):/gm)
    for (const match of matches) {
      scripts[`make:${match[1]}`] = `make ${match[1]}`
    }
  } catch {}

  // Cargo.toml (Rust)
  try {
    const cargo = await Bun.file(`${cwd}/Cargo.toml`).text()
    // Parse [workspace] and [profile] sections for common commands
    scripts['cargo:build'] = 'cargo build'
    scripts['cargo:test'] = 'cargo test'
    scripts['cargo:check'] = 'cargo check'
    scripts['cargo:clippy'] = 'cargo clippy'
  } catch {}

  // pyproject.toml (Python)
  try {
    const pyproject = await Bun.file(`${cwd}/pyproject.toml`).text()
    if (pyproject.includes('[tool.poe]') || pyproject.includes('[project.scripts]')) {
      scripts['python:run'] = 'python -m'
      scripts['python:test'] = 'pytest'
      scripts['python:lint'] = 'ruff check'
    }
  } catch {}

  return scripts
}
