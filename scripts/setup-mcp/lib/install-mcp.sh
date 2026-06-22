#!/usr/bin/env bash
# MCP Server Installation

source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

# Mandatory MCP servers (always installed)
if [[ -z "${MANDATORY_MCPS[0]:-}" ]]; then
    readonly MANDATORY_MCPS=(
        "engram-mcp:npx -y engram-mcp@latest:Engram persistent memory"
        "codebase-memory-mcp:uvx codebase-memory-mcp:Codebase memory graph"
        "searxng-mcp:npx -y @kevinwatt/mcp-server-searxng@latest:SearXNG meta search MCP"
    )
fi

# Optional MCP servers (installed on demand)
if [[ -z "${OPTIONAL_MCPS[0]:-}" ]]; then
    readonly OPTIONAL_MCPS=(
        "github:@missionsquad/mcp-github:GitHub API access"
        "postgres:mcp-postgres:PostgreSQL database operations"
        "sqlite:mcp-server-sqlite:SQLite database operations"
        "docker:docker-mcp:Docker container management"
        "kubernetes:k8s-mcp:Kubernetes cluster management"
    )
fi

install_mcp() {
    local name="$1"
    local cmd="$2"
    local description="$3"
    
    log_substep "Installing $name: $description"
    
    if [[ "${DRY_RUN:-false}" == "true" ]]; then
        log_info "$(dry_run_prefix)Would run: $cmd"
        return 0
    fi
    
    if run_cmd "$cmd" "Install $name"; then
        log_success "$name installed"
        return 0
    else
        log_warn "$name installation failed (continuing...)"
        return 1
    fi
}

install_mandatory_mcps() {
    log_step "Installing mandatory MCP servers..."
    
    local failed=0
    
    for mcp in "${MANDATORY_MCPS[@]}"; do
        IFS=':' read -r name cmd desc <<< "$mcp"
        if ! install_mcp "$name" "$cmd" "$desc"; then
            failed=$((failed + 1))
        fi
    done
    
    if [[ $failed -gt 0 ]]; then
        log_warn "$failed mandatory MCP server(s) failed to install"
    else
        log_success "All mandatory MCP servers installed"
    fi
    
    return 0  # Continue even if some fail
}

install_optional_mcps() {
    local to_install=("$@")
    
    if [[ ${#to_install[@]} -eq 0 ]]; then
        log_info "No optional MCP servers selected"
        return 0
    fi
    
    log_step "Installing optional MCP servers..."
    
    local failed=0
    
    for name in "${to_install[@]}"; do
        local found=false
        for mcp in "${OPTIONAL_MCPS[@]}"; do
            IFS=':' read -r mcp_name cmd desc <<< "$mcp"
            if [[ "$mcp_name" == "$name" ]]; then
                if ! install_mcp "$mcp_name" "npx -y $cmd@latest" "$desc"; then
                    failed=$((failed + 1))
                fi
                found=true
                break
            fi
        done
        
        if [[ "$found" == "false" ]]; then
            log_warn "Unknown optional MCP: $name"
        fi
    done
    
    if [[ $failed -gt 0 ]]; then
        log_warn "$failed optional MCP server(s) failed to install"
    else
        log_success "All selected optional MCP servers installed"
    fi
}

# Get list of optional MCP names
get_optional_mcp_names() {
    for mcp in "${OPTIONAL_MCPS[@]}"; do
        IFS=':' read -r name cmd desc <<< "$mcp"
        echo "$name"
    done
}

# Get list of optional MCP descriptions
get_optional_mcp_descriptions() {
    for mcp in "${OPTIONAL_MCPS[@]}"; do
        IFS=':' read -r name cmd desc <<< "$mcp"
        echo "$name:$desc"
    done
}

# Select optional MCPs interactively
select_optional_mcps_interactive() {
    if [[ "${INSTALL_ALL:-false}" == "true" ]]; then
        SELECTED_OPTIONAL_MCPS=($(get_optional_mcp_names))
        log_info "Installing all optional MCP servers (--all)"
        return
    fi
    
    if [[ "${ONLY_MANDATORY:-false}" == "true" ]]; then
        log_info "Installing only mandatory MCP servers (--only-mandatory)"
        SELECTED_OPTIONAL_MCPS=()
        return
    fi
    
    # Interactive selection
    local mcps=($(get_optional_mcp_descriptions))
    SELECTED_OPTIONAL_MCPS=()
    
    echo
    log_step "Select optional MCP servers to install:"
    
    for desc in "${mcps[@]}"; do
        IFS=':' read -r name description <<< "$desc"
        if confirm "  Install $name ($description)?"; then
            SELECTED_OPTIONAL_MCPS+=("$name")
        fi
    done
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    install_mandatory_mcps
fi