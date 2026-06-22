#!/usr/bin/env bash
# Common functions for setup-mcp scripts

set -euo pipefail

# Colors (only set if not already defined)
if [[ -z "${RED:-}" ]]; then
    readonly RED='\033[0;31m'
    readonly GREEN='\033[0;32m'
    readonly YELLOW='\033[1;33m'
    readonly BLUE='\033[0;34m'
    readonly CYAN='\033[0;36m'
    readonly BOLD='\033[1m'
    readonly NC='\033[0m' # No Color
fi

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $*"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $*"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*" >&2
}

log_debug() {
    if [[ "${VERBOSE:-false}" == "true" ]]; then
        echo -e "${CYAN}[DEBUG]${NC} $*"
    fi
}

log_step() {
    echo -e "\n${BOLD}${BLUE}==>${NC} ${BOLD}$*${NC}"
}

log_substep() {
    echo -e "  ${CYAN}->${NC} $*"
}

# Dry-run prefix
dry_run_prefix() {
    if [[ "${DRY_RUN:-false}" == "true" ]]; then
        echo -e "${YELLOW}[DRY-RUN]${NC} "
    fi
}

# Execute command with dry-run support
run_cmd() {
    local cmd="$1"
    local description="${2:-}"
    
    if [[ "${DRY_RUN:-false}" == "true" ]]; then
        log_info "$(dry_run_prefix)Would run: $cmd"
        if [[ -n "$description" ]]; then
            log_substep "$description"
        fi
        return 0
    fi
    
    if [[ -n "$description" ]]; then
        log_substep "$description"
    fi
    
    log_debug "Executing: $cmd"
    eval "$cmd"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Get OS info
get_os() {
    case "$(uname -s)" in
        Linux*)     echo "linux" ;;
        Darwin*)    echo "macos" ;;
        CYGWIN*|MINGW*|MSYS*) echo "windows" ;;
        *)          echo "unknown" ;;
    esac
}

# Get package manager for Linux
get_package_manager() {
    if command_exists apt-get; then
        echo "apt"
    elif command_exists dnf; then
        echo "dnf"
    elif command_exists yum; then
        echo "yum"
    elif command_exists pacman; then
        echo "pacman"
    elif command_exists zypper; then
        echo "zypper"
    elif command_exists apk; then
        echo "apk"
    else
        echo "unknown"
    fi
}

# Version comparison
version_ge() {
    # Returns 0 if $1 >= $2
    # BusyBox sort doesn't support -C, use awk instead
    local v1="$1"
    local v2="$2"
    # Simple version comparison using awk
    awk -v v1="$v1" -v v2="$v2" '
    BEGIN {
        split(v1, a, ".");
        split(v2, b, ".");
        for (i = 1; i <= 3; i++) {
            if (a[i] > b[i]) exit 0;
            if (a[i] < b[i]) exit 1;
        }
        exit 0;
    }'
}

# Get version number from command output
get_version() {
    local cmd="$1"
    local regex="${2:-([0-9]+\.[0-9]+\.[0-9]+)}"
    
    if command_exists "$(echo "$cmd" | awk '{print $1}')"; then
        eval "$cmd" 2>/dev/null | grep -oE "$regex" | head -1 || echo "unknown"
    else
        echo "not_installed"
    fi
}

# Find free port starting from base
find_free_port() {
    local base_port="${1:-8080}"
    local port="$base_port"
    
    while true; do
        if ! (echo >/dev/tcp/localhost/"$port") 2>/dev/null; then
            # Port is free, but double-check with ss/netstat/lsof
            if ! ss -ltn 2>/dev/null | grep -q ":$port " && \
               ! netstat -ltn 2>/dev/null | grep -q ":$port " && \
               ! lsof -i:"$port" 2>/dev/null | grep -q LISTEN; then
                echo "$port"
                return 0
            fi
        fi
        port=$((port + 1))
        if [[ $port -gt $((base_port + 100)) ]]; then
            log_error "Could not find free port after 100 attempts"
            return 1
        fi
    done
}

# Check if port is in use
port_in_use() {
    local port="$1"
    (echo >/dev/tcp/localhost/"$port") 2>/dev/null || \
    ss -ltn 2>/dev/null | grep -q ":$port " || \
    netstat -ltn 2>/dev/null | grep -q ":$port " || \
    lsof -i:"$port" 2>/dev/null | grep -q LISTEN
}

# Wait for service to be healthy
wait_for_health() {
    local url="$1"
    local max_attempts="${2:-30}"
    local interval="${3:-2}"
    local attempt=1
    
    log_substep "Waiting for service at $url..."
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -sf "$url" >/dev/null 2>&1; then
            log_success "Service is healthy"
            return 0
        fi
        
        if [[ $((attempt % 5)) -eq 0 ]]; then
            log_substep "Attempt $attempt/$max_attempts..."
        fi
        
        sleep "$interval"
        attempt=$((attempt + 1))
    done
    
    log_error "Service did not become healthy after $max_attempts attempts"
    return 1
}

# Parse command line arguments
parse_args() {
    DRY_RUN=false
    INSTALL_ALL=false
    ONLY_MANDATORY=false
    VERBOSE=false
    SKIP_SEARXNG=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                DRY_RUN=true
                ;;
            --all)
                INSTALL_ALL=true
                ;;
            --only-mandatory)
                ONLY_MANDATORY=true
                ;;
            --verbose)
                VERBOSE=true
                ;;
            --no-searxng)
                SKIP_SEARXNG=true
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
        shift
    done
    
    export DRY_RUN INSTALL_ALL ONLY_MANDATORY VERBOSE SKIP_SEARXNG
}

show_help() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS]

Cross-platform MCP server setup for opencode.

OPTIONS:
    --dry-run           Show what would be done without executing
    --all               Install all optional MCP servers without prompting
    --only-mandatory    Install only mandatory MCP servers
    --verbose           Enable verbose output
    --no-searxng        Skip SearXNG installation
    --help, -h          Show this help message

MANDATORY MCP SERVERS (always installed):
    - engram-mcp
    - codebase-memory-mcp
    - @kevinwatt/mcp-server-searxng
    - SearXNG Docker container

OPTIONAL MCP SERVERS (installed with --all or interactively):
    - @missionsquad/mcp-github
    - mcp-postgres
    - mcp-server-sqlite
    - docker-mcp
    - k8s-mcp

ENVIRONMENT VARIABLES:
    Configuration via ~/.config/opencode/.env
EOF
}

# Confirm action
confirm() {
    local prompt="${1:-Continue?}"
    local default="${2:-N}"
    
    if [[ "${DRY_RUN:-false}" == "true" ]] || [[ "${INSTALL_ALL:-false}" == "true" ]]; then
        return 0
    fi
    
    local yn
    if [[ "$default" =~ ^[Yy]$ ]]; then
        read -rp "$prompt [Y/n]: " yn
        yn=${yn:-Y}
    else
        read -rp "$prompt [y/N]: " yn
        yn=${yn:-N}
    fi
    
    [[ "$yn" =~ ^[Yy]$ ]]
}

# Select optional MCPs interactively
select_optional_mcps() {
    local mcps=(
        "@missionsquad/mcp-github:GitHub API access"
        "mcp-postgres:PostgreSQL database operations"
        "mcp-server-sqlite:SQLite database operations"
        "docker-mcp:Docker container management"
        "k8s-mcp:Kubernetes cluster management"
    )
    
    local selected=()
    
    echo
    log_step "Select optional MCP servers to install:"
    
    for i in "${!mcps[@]}"; do
        IFS=':' read -r name desc <<< "${mcps[i]}"
        if confirm "  Install $name ($desc)?"; then
            selected+=("$name")
        fi
    done
    
    echo "${selected[@]}"
}

# Backup file with timestamp
backup_file() {
    local file="$1"
    
    if [[ -f "$file" ]]; then
        local timestamp
        timestamp=$(date +%Y%m%d-%H%M%S)
        local backup="${file}.backup.${timestamp}"
        
        run_cmd "cp \"$file\" \"$backup\"" "Backup $file to $backup"
        echo "$backup"
    fi
}

# Merge JSONC config
merge_jsonc() {
    local target_file="$1"
    local new_mcp_config="$2"
    
    if [[ "${DRY_RUN:-false}" == "true" ]]; then
        log_info "$(dry_run_prefix)Would update $target_file with MCP config"
        return 0
    fi
    
    # Use jq to merge if available, otherwise replace
    if command_exists jq; then
        local temp_file
        temp_file=$(mktemp)
        
        if [[ -f "$target_file" ]]; then
            # Merge with existing config
            jq --argjson mcp "$new_mcp_config" '.mcp = $mcp' "$target_file" > "$temp_file" 2>/dev/null || \
            echo "{\"mcp\": $new_mcp_config}" > "$temp_file"
        else
            echo "{\"mcp\": $new_mcp_config}" > "$temp_file"
        fi
        
        mv "$temp_file" "$target_file"
        log_success "Updated $target_file"
    else
        log_warn "jq not found, writing full config"
        cat > "$target_file" << EOF
{
  "mcp": $new_mcp_config
}
EOF
    fi
}

# Generate .env.example
generate_env_example() {
    local output_file="$1"
    local searxng_port="${2:-8080}"
    
    if [[ "${DRY_RUN:-false}" == "true" ]]; then
        log_info "$(dry_run_prefix)Would generate $output_file"
        return 0
    fi
    
    cat > "$output_file" << EOF
# === MANDATORY ===
# Engram persistent memory
ENGRAM_DB_PATH=~/.engram/engram.db

# Codebase memory graph
CODEBASE_MEMORY_DB=~/.codebase-memory/graph.db

# SearXNG meta search
SEARXNG_INSTANCES=http://localhost:${searxng_port}
SEARXNG_USER_AGENT=MCP-SearXNG/1.0

# === OPTIONAL (set based on installed MCP servers) ===
# GitHub API access
# GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxxx

# PostgreSQL database
# POSTGRES_URL=postgresql://user:pass@host:5432/db

# NVIDIA NIM API (for cloud models)
# NVIDIA_API_KEY=nvapi-xxxx

# Ollama local models
# OLLAMA_HOST=http://localhost:11434
EOF
    
    log_success "Generated $output_file"
}

# Check if running with sudo (for Docker on Linux)
check_sudo_docker() {
    if [[ "$(get_os)" == "linux" ]]; then
        if ! groups | grep -q '\bdocker\b' && [[ $EUID -ne 0 ]]; then
            log_warn "User not in docker group, will use sudo for docker commands"
            export USE_SUDO_DOCKER=true
        else
            export USE_SUDO_DOCKER=false
        fi
    else
        export USE_SUDO_DOCKER=false
    fi
}

# Docker command wrapper
docker_cmd() {
    if [[ "${USE_SUDO_DOCKER:-false}" == "true" ]]; then
        sudo docker "$@"
    else
        docker "$@"
    fi
}

# Export all functions for use in other scripts
export -f log_info log_success log_warn log_error log_debug log_step log_substep
export -f dry_run_prefix run_cmd command_exists get_os get_package_manager
export -f version_ge get_version find_free_port port_in_use wait_for_health
export -f parse_args confirm select_optional_mcps backup_file merge_jsonc
export -f generate_env_example check_sudo_docker docker_cmd