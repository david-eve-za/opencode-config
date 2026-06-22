# setup-mcp — Cross-Platform MCP Server Setup for OpenCode

Automated installation and configuration of MCP (Model Context Protocol) servers for OpenCode, including mandatory servers, optional servers, SearXNG meta-search with Docker, and environment configuration.

## Features

- **Cross-platform**: Linux/macOS (bash) and Windows (PowerShell)
- **Mandatory MCP servers** (always installed):
  - `engram-mcp` — Persistent memory for AI
  - `codebase-memory-mcp` — Codebase knowledge graph
  - `@kevinwatt/mcp-server-searxng` — SearXNG meta-search MCP
  - **SearXNG Docker container** — Privacy-focused meta search engine
- **Optional MCP servers** (interactive or `--all`):
  - `@missionsquad/mcp-github` — GitHub API access
  - `mcp-postgres` — PostgreSQL database operations
  - `mcp-server-sqlite` — SQLite database operations
  - `docker-mcp` — Docker container management
  - `k8s-mcp` — Kubernetes cluster management
- **Auto-configuration**:
  - Updates `~/.config/opencode/opencode.jsonc`
  - Generates `~/.config/opencode/.env.example` and `.env`
  - Creates `~/.config/searxng/settings.yml`
- **Safety features**:
  - Backup of existing `opencode.jsonc` with timestamp
  - Dry-run mode (`--dry-run`)
  - Automatic uv installation if missing
  - SearXNG health check before completion
  - Auto-detect free port for SearXNG (8080, 8081, 8082...)

## Quick Start

### Linux/macOS
```bash
# Make executable
chmod +x scripts/setup-mcp/setup-mcp.sh

# Run interactively
./scripts/setup-mcp/setup-mcp.sh

# Install all optional MCPs without prompting
./scripts/setup-mcp/setup-mcp.sh --all

# Dry run to see what would happen
./scripts/setup-mcp/setup-mcp.sh --dry-run

# Install only mandatory MCPs
./scripts/setup-mcp/setup-mcp.sh --only-mandatory
```

### Windows (PowerShell)
```powershell
# Run interactively
.\scripts\setup-mcp\setup-mcp.ps1

# Install all optional MCPs without prompting
.\scripts\setup-mcp\setup-mcp.ps1 -All

# Dry run to see what would happen
.\scripts\setup-mcp\setup-mcp.ps1 -DryRun

# Install only mandatory MCPs
.\scripts\setup-mcp\setup-mcp.ps1 -OnlyMandatory
```

## Prerequisites

| Tool | Minimum Version | Auto-Install |
|------|----------------|--------------|
| Node.js | ≥18.0.0 | No |
| npm | ≥9.0.0 | No |
| uv | ≥0.4.0 | **Yes** (via pip) |
| Docker | ≥24.0.0 | No |
| Docker Compose | ≥2.0.0 | No |

### Install Prerequisites

**Node.js**: Use [fnm](https://github.com/Schniz/fnm), [nvm](https://github.com/nvm-sh/nvm), or download from [nodejs.org](https://nodejs.org/)

**Docker**: 
- Linux: `curl -fsSL https://get.docker.com | sh`
- macOS: [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Windows: [Docker Desktop](https://www.docker.com/products/docker-desktop/)

**uv** (auto-installed):
```bash
pip install uv
# or
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## Command Line Options

| Option | Description |
|--------|-------------|
| `--dry-run` / `-DryRun` | Show what would be done without executing |
| `--all` / `-All` | Install all optional MCP servers without prompting |
| `--only-mandatory` / `-OnlyMandatory` | Install only mandatory MCP servers |
| `--verbose` / `-Verbose` | Enable verbose output |
| `--no-searxng` / `-NoSearXNG` | Skip SearXNG installation |
| `--help` / `-Help` | Show help message |

## What Gets Installed

### Mandatory MCP Servers

| Server | Purpose | Installation Method |
|--------|---------|---------------------|
| `engram-mcp` | Persistent memory across sessions | `npx -y engram-mcp@latest` |
| `codebase-memory-mcp` | Codebase knowledge graph | `uvx codebase-memory-mcp` |
| `@kevinwatt/mcp-server-searxng` | SearXNG search MCP | `npx -y @kevinwatt/mcp-server-searxng@latest` |
| **SearXNG** | Meta-search engine (Docker) | `docker run searxng/searxng` |

### Optional MCP Servers

| Server | Purpose | Installation Method |
|--------|---------|---------------------|
| `@missionsquad/mcp-github` | GitHub API (repos, issues, PRs) | `npx -y @missionsquad/mcp-github@latest` |
| `mcp-postgres` | PostgreSQL queries & schema | `npx -y mcp-postgres@latest` |
| `mcp-server-sqlite` | SQLite database operations | `npx -y mcp-server-sqlite@latest` |
| `docker-mcp` | Docker container management | `npx -y docker-mcp@latest` |
| `k8s-mcp` | Kubernetes cluster operations | `npx -y k8s-mcp@latest` |

## Configuration Files Created/Updated

| File | Purpose |
|------|---------|
| `~/.config/opencode/opencode.jsonc` | MCP server configuration (updated) |
| `~/.config/opencode/.env.example` | Environment template (generated) |
| `~/.config/opencode/.env` | Environment file (copied from template) |
| `~/.config/searxng/settings.yml` | SearXNG configuration |

## Environment Variables

### Mandatory
```bash
ENGRAM_DB_PATH=~/.engram/engram.db
CODEBASE_MEMORY_DB=~/.codebase-memory/graph.db
SEARXNG_INSTANCES=http://localhost:8080
SEARXNG_USER_AGENT=MCP-SearXNG/1.0
```

### Optional (based on installed MCPs)
```bash
# GitHub
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxxx

# PostgreSQL
POSTGRES_URL=postgresql://user:pass@host:5432/db

# AI Models
NVIDIA_API_KEY=nvapi_xxxx
OLLAMA_HOST=http://localhost:11434
```

## SearXNG Details

- **Default port**: 8080 (auto-detects free port if busy)
- **Search engines**: Google, DuckDuckGo, Bing
- **Categories**: General, News, Science, Files, Images, Videos
- **Health check**: Verifies `/search?q=test&format=json` responds
- **Auto-restart**: `--restart always` flag on container

### Test SearXNG
```bash
# Get port from docker
docker port searxng 8080/tcp

# Test search
curl "http://localhost:8080/search?q=openai&format=json" | jq
```

## Post-Installation

1. **Edit environment variables**:
   ```bash
   nano ~/.config/opencode/.env
   ```

2. **Start OpenCode**:
   ```bash
   opencode
   ```

3. **Verify MCP servers**:
   ```bash
   opencode mcp list
   ```

4. **Test SearXNG**:
   ```bash
   curl "http://localhost:8080/search?q=test&format=json"
   ```

## Troubleshooting

### uv not found
```bash
# Manual installation
pip install uv
# or
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Docker permission denied (Linux)
```bash
sudo usermod -aG docker $USER
# Log out and back in, or:
newgrp docker
```

### Port 8080 in use
Script auto-detects free port (8081, 8082...). Check with:
```bash
docker port searxng 8080/tcp
```

### SearXNG not responding
```bash
# Check logs
docker logs searxng --tail 50

# Restart container
docker restart searxng
```

### OpenCode config not loading
```bash
# Validate JSON syntax
jq empty ~/.config/opencode/opencode.jsonc

# Check MCP servers
opencode mcp list
```

## Backup & Restore

The script automatically backs up `opencode.jsonc` before modification:
```bash
~/.config/opencode/opencode.jsonc.backup.20260620-143000
```

To restore:
```bash
cp ~/.config/opencode/opencode.jsonc.backup.YYYYMMDD-HHMMSS ~/.config/opencode/opencode.jsonc
```

## Uninstall

To remove all installed components:
```bash
# Remove MCP servers (npm packages are global, use npm uninstall)
npm uninstall -g engram-mcp @kevinwatt/mcp-server-searxng @missionsquad/mcp-github mcp-postgres mcp-server-sqlite docker-mcp k8s-mcp

# Remove SearXNG
docker stop searxng && docker rm searxng
docker rmi searxng/searxng

# Remove configs
rm -rf ~/.config/opencode ~/.config/searxng ~/.engram ~/.codebase-memory

# Remove uv
pip uninstall uv
```

## License

MIT License — See LICENSE file for details.