#!/usr/bin/env bash
# OpenCode Configuration Management

source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

# OpenCode config file path
if [[ -z "${OPENCODE_CONFIG_DIR:-}" ]]; then
    readonly OPENCODE_CONFIG_DIR="${HOME}/.config/opencode"
    readonly OPENCODE_CONFIG_FILE="${OPENCODE_CONFIG_DIR}/opencode.jsonc"
fi

# MCP configurations
generate_mcp_config() {
    local searxng_port="${1:-8080}"
    local install_github="${2:-false}"
    local install_postgres="${3:-false}"
    local install_sqlite="${4:-false}"
    local install_docker="${5:-false}"
    local install_k8s="${6:-false}"
    
    cat << EOF
{
  "engram": {
    "type": "local",
    "command": ["npx", "-y", "engram-mcp@latest"],
    "env": { "ENGRAM_DB_PATH": "\${ENGRAM_DB_PATH}" }
  },
  "codebase-memory": {
    "type": "local",
    "command": ["uvx", "codebase-memory-mcp"],
    "env": { "CODEBASE_MEMORY_DB": "\${CODEBASE_MEMORY_DB}" }
  },
  "searxng": {
    "type": "local",
    "command": ["npx", "-y", "@kevinwatt/mcp-server-searxng@latest"],
    "env": {
      "SEARXNG_INSTANCES": "\${SEARXNG_INSTANCES}",
      "SEARXNG_USER_AGENT": "\${SEARXNG_USER_AGENT}"
    }
  }$(
    if [[ "$install_github" == "true" ]]; then
        cat << 'GITHUB'
  ,
  "github": {
    "type": "local",
    "command": ["npx", "-y", "@missionsquad/mcp-github@latest"],
    "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "\${GITHUB_PERSONAL_ACCESS_TOKEN}" }
  }
GITHUB
    fi
  )$(
    if [[ "$install_postgres" == "true" ]]; then
        cat << 'POSTGRES'
  ,
  "postgres": {
    "type": "local",
    "command": ["npx", "-y", "mcp-postgres@latest"],
    "env": { "POSTGRES_URL": "\${POSTGRES_URL}" }
  }
POSTGRES
    fi
  )$(
    if [[ "$install_sqlite" == "true" ]]; then
        cat << 'SQLITE'
  ,
  "sqlite": {
    "type": "local",
    "command": ["npx", "-y", "mcp-server-sqlite@latest"]
  }
SQLITE
    fi
  )$(
    if [[ "$install_docker" == "true" ]]; then
        cat << 'DOCKER'
  ,
  "docker": {
    "type": "local",
    "command": ["npx", "-y", "docker-mcp@latest"]
  }
DOCKER
    fi
  )$(
    if [[ "$install_k8s" == "true" ]]; then
        cat << 'K8S'
  ,
  "kubernetes": {
    "type": "local",
    "command": ["npx", "-y", "k8s-mcp@latest"]
  }
K8S
    fi
  )
}
EOF
}

# Update opencode.jsonc with MCP config
update_opencode_config() {
    local searxng_port="${1:-8080}"
    shift
    local optional_mcps=("$@")
    
    log_step "Updating OpenCode configuration..."
    
    # Determine which optional MCPs are installed
    local install_github=false
    local install_postgres=false
    local install_sqlite=false
    local install_docker=false
    local install_k8s=false
    
    for mcp in "${optional_mcps[@]}"; do
        case "$mcp" in
            github) install_github=true ;;
            postgres) install_postgres=true ;;
            sqlite) install_sqlite=true ;;
            docker) install_docker=true ;;
            kubernetes) install_k8s=true ;;
        esac
    done
    
    # Generate MCP config JSON
    local mcp_json
    mcp_json=$(generate_mcp_config "$searxng_port" "$install_github" "$install_postgres" "$install_sqlite" "$install_docker" "$install_k8s")
    
    if [[ "${DRY_RUN:-false}" == "true" ]]; then
        log_info "$(dry_run_prefix)Would update $OPENCODE_CONFIG_FILE"
        log_debug "MCP config: $mcp_json"
        return 0
    fi
    
    # Create config directory
    mkdir -p "$OPENCODE_CONFIG_DIR"
    
    # Backup existing config
    backup_file "$OPENCODE_CONFIG_FILE"
    
    # Update config using merge_jsonc from common.sh
    merge_jsonc "$OPENCODE_CONFIG_FILE" "$mcp_json"
    
    log_success "OpenCode configuration updated at $OPENCODE_CONFIG_FILE"
}

# Validate opencode.jsonc syntax
validate_opencode_config() {
    if [[ ! -f "$OPENCODE_CONFIG_FILE" ]]; then
        log_warn "OpenCode config not found: $OPENCODE_CONFIG_FILE"
        return 1
    fi
    
    if command_exists jq; then
        if jq empty "$OPENCODE_CONFIG_FILE" 2>/dev/null; then
            log_success "OpenCode config syntax is valid"
            return 0
        else
            log_error "OpenCode config has invalid JSON syntax"
            return 1
        fi
    else
        log_warn "jq not available, skipping syntax validation"
        return 0
    fi
}

# Show current MCP config
show_mcp_config() {
    if [[ ! -f "$OPENCODE_CONFIG_FILE" ]]; then
        log_warn "OpenCode config not found"
        return 1
    fi
    
    if command_exists jq; then
        jq '.mcp // {}' "$OPENCODE_CONFIG_FILE"
    else
        cat "$OPENCODE_CONFIG_FILE"
    fi
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    update_opencode_config 8080
fi