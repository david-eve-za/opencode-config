# opencode-config

> Full-stack OpenCode configuration with Agent Loop Engineering, multi-language support, and autonomous workflows.

## Overview

This configuration transforms OpenCode into a full-stack development environment with:

- **20 specialized agents** — backend (Go/Rust/Python), frontend (React/Vue/Svelte), infra (DevOps/Data/Security), mobile (Swift/Kotlin), swarm orchestration
- **35 commands** — universal workflows (test, lint, debug, migrate, deploy-check, swarm, etc.)
- **30 tools** — multi-language (Go/Rust/Python), infra (Docker/K8s/Terraform), data (DB schema/query/migration)
- **13 MCP servers** — context7, fetch, engram, codebase-memory, nvidia-nim, github, postgres, sqlite, docker, k8s, searxng
- **Agent Loop Engineering** — `/goal` + `/loop` for autonomous workflow execution
- **Engram memory** — persistent semantic memory with topic keys
- **Least-privilege security** — .env deny, agent-specific permissions

## Quick Start

```bash
# Clone
git clone https://github.com/david-eve-za/opencode-config.git ~/.config/opencode
cd ~/.config/opencode

# Install prerequisites
# Node.js >=18, Docker, Ollama (optional for local models)

# Run setup (installs MCP servers, configures environment)
./scripts/setup-mcp/setup-mcp.sh --all

# Start OpenCode
opencode
```

## Key Commands

| Command | Description |
|---------|-------------|
| `/goal "objective"` | Create/update goal with Engram persistence |
| `/loop --max-iterations=20 --until="tests pass"` | Execute autonomous loop |
| `/test` | Auto-detect framework (go test, cargo test, pytest, vitest) |
| `/lint` | Auto-detect linter (go vet, cargo clippy, ruff, tsc) |
| `/review-my-shit` | Pre-PR review with language-specific checks |
| `/security-scan` | SAST, SCA, secret detection, container scan |
| `/deploy-check` | Pre-deployment validation |
| `/swarm "task"` | Parallel task execution with swarm planner/worker |

## Architecture

```
opencode-config/
├── agent/           # 20 specialized agents (swarm, code, backend, frontend, infra, mobile)
├── command/         # 35 universal commands (workflow, quality, infra, git, session, meta)
├── loop/            # Agent Loop Engineering core (GoalManager, LoopController, ConditionEvaluator)
├── plugin/          # Plugin core with registry pattern (agents, tools, commands)
├── tool/            # 30 tools (core, language-specific, infra, data)
├── skill/           # 12 internal skills + registry
├── scripts/         # Cross-platform setup scripts
├── opencode.jsonc   # Main config (models, routing, agents, permissions, MCP)
├── AGENTS.md        # Agent instructions, routing, philosophy
└── .gitignore       # Strict ignore rules
```

## Agent Loop Engineering (`/goal` + `/loop`)

```bash
# Set objective
/goal "Migrar autenticación a JWT" --max-iterations 20

# Execute autonomous loop
/loop --goal=<id> --max-iterations=20 --until="tests pass" --delegate-to-swarm

# Monitor
/loop --status
/loop --pause / --resume / --stop
```

**Features:**
- Goal persistence in Engram (memSave/memSearch)
- Stop conditions: max_iterations, tests_pass, build_success, custom, timeout
- Swarm delegation for complex tasks
- Safety: max-iterations, timeout, Ctrl+C graceful stop, destructive confirmations
- Event system: iteration_start, action_executed, reflection, iteration_complete

## Models & Routing

| Provider | Models | Use Case |
|----------|--------|----------|
| **NVIDIA NIM** | nemotron-3-ultra, glm-5.1, kimi-k2.6 | Primary cloud models |
| **Ollama** | deepseek-coder:6.7b, qwen3.5:4b, gemma4:e4b | Local fallback |

**Agent Routing** — Auto-detects language from project files:
- `go.mod` → `backend/go`
- `Cargo.toml` → `backend/rust`
- `pyproject.toml` → `backend/python`
- `package.json` + `.tsx` → `frontend/react`
- `Dockerfile` → `infra/devops`
- `*.tf` → `infra/devops`

## MCP Servers (13)

| Category | Servers |
|----------|---------|
| Universal | context7, fetch, engram, codebase-memory, nvidia-nim |
| Web | next-devtools, chrome-devtools, playwright |
| Backend | mcp-postgres, mcp-server-sqlite |
| Infra | docker-mcp, k8s-mcp |
| Data | @missionsquad/mcp-github |

**Profiles:** web, backend, infra, fullstack, minimal

## Security (Least Privilege)

- `.env` reads **denied** (only `.env.example` allowed)
- Destructive commands: **denied** (rm -rf, sudo, terraform destroy)
- Sensitive commands: **ask** (git push, terraform apply, kubectl delete)
- **11 agent overrides** with minimal permissions (read-only plan/security, test-writer only test files, docs only .md)

## Setup Script

```bash
# Interactive (prompts for optional MCPs)
./scripts/setup-mcp/setup-mcp.sh

# All optional MCPs
./scripts/setup-mcp/setup-mcp.sh --all

# Dry run
./scripts/setup-mcp/setup-mcp.sh --dry-run --all
```

**Features:** Auto-installs uv, verifies prerequisites, SearXNG health check, auto-port detection, opencode.jsonc merge, .env generation.

## Prerequisites

| Tool | Minimum | Auto-Install |
|------|---------|--------------|
| Node.js | ≥18.0.0 | No |
| npm | ≥9.0.0 | No |
| uv | ≥0.4.0 | **Yes** (pip) |
| Docker | ≥24.0.0 | No |
| Ollama | Latest | Optional |

## Environment Variables

```bash
# ~/.config/opencode/.env
NVIDIA_API_KEY=nvapi-xxxx          # Required for NVIDIA NIM
OLLAMA_HOST=http://localhost:11434 # Optional local models
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxxx
POSTGRES_URL=postgresql://user:pass@host:5432/db
ENGRAM_DB_PATH=~/.engram/engram.db
CODEBASE_MEMORY_DB=~/.codebase-memory/graph.db
SEARXNG_INSTANCES=http://localhost:8080
```

## Documentation

See `docs/plans/00-MASTER-INDEX.md` for the complete implementation plan and `docs/plans/ref/` for reference catalogs.

## License

MIT
