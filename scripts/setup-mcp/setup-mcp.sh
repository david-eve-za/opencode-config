#!/usr/bin/env bash
# setup-mcp.sh - Cross-platform MCP server setup for OpenCode
# 
# Installs mandatory and optional MCP servers, configures OpenCode,
# sets up SearXNG Docker container, and generates environment template.
#
# Usage: ./setup-mcp.sh [--dry-run] [--all] [--only-mandatory] [--verbose] [--help]

set -euo pipefail

# Script directory
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly LIB_DIR="${SCRIPT_DIR}/lib"

# Source libraries
source "${LIB_DIR}/common.sh"
source "${LIB_DIR}/detect-os.sh"
source "${LIB_DIR}/check-prereqs.sh"
source "${LIB_DIR}/install-uv.sh"
source "${LIB_DIR}/install-mcp.sh"
source "${LIB_DIR}/install-searxng.sh"
source "${LIB_DIR}/config-opencode.sh"
source "${LIB_DIR}/env-template.sh"
source "${LIB_DIR}/backup.sh"

# Global state
SELECTED_OPTIONAL_MCPS=()
SEARXNG_PORT=0

main() {
    # Parse command line arguments
    parse_args "$@"
    
    # Show banner
    show_banner
    
    # Detect OS
    detect_os
    
    # Check sudo for Docker on Linux
    check_sudo_docker
    
    # Dry-run mode
    if [[ "${DRY_RUN:-false}" == "true" ]]; then
        log_warn "DRY-RUN MODE - No changes will be made"
    fi
    
    # Check prerequisites
    if ! check_all_prereqs; then
        log_error "Prerequisites check failed"
        exit 1
    fi
    
    # Ensure uv is installed
    if ! ensure_uv; then
        log_error "Failed to ensure uv installation"
        exit 1
    fi
    
    # Select optional MCPs
    select_optional_mcps_interactive
    
    # Show installation plan
    show_installation_plan
    
    # Confirm before proceeding
    if ! confirm "Proceed with installation?"; then
        log_info "Installation cancelled"
        exit 0
    fi
    
    # Install mandatory MCPs
    install_mandatory_mcps
    
    # Install SearXNG (mandatory)
    if [[ "${SKIP_SEARXNG:-false}" != "true" ]]; then
        if ! install_searxng; then
            log_error "SearXNG installation failed"
            exit 1
        fi
        SEARXNG_PORT="${SEARXNG_PORT:-8080}"
    else
        log_warn "Skipping SearXNG installation (--no-searxng)"
        SEARXNG_PORT=8080
    fi
    
    # Install optional MCPs
    if [[ "${ONLY_MANDATORY:-false}" != "true" ]]; then
        install_optional_mcps "${SELECTED_OPTIONAL_MCPS[@]}"
    fi
    
    # Update OpenCode configuration
    update_opencode_config "$SEARXNG_PORT" "${SELECTED_OPTIONAL_MCPS[@]}"
    
    # Generate environment template
    generate_env_example "$SEARXNG_PORT" \
        "$(contains github "${SELECTED_OPTIONAL_MCPS[@]}" && echo true || echo false)" \
        "$(contains postgres "${SELECTED_OPTIONAL_MCPS[@]}" && echo true || echo false)" \
        "$(contains sqlite "${SELECTED_OPTIONAL_MCPS[@]}" && echo true || echo false)" \
        "$(contains docker "${SELECTED_OPTIONAL_MCPS[@]}" && echo true || echo false)" \
        "$(contains kubernetes "${SELECTED_OPTIONAL_MCPS[@]}" && echo true || echo false)"
    
    # Show summary
    show_summary
}

show_banner() {
    echo -e "${BOLD}${BLUE}"
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════╗
║                    setup-mcp.sh                               ║
║         Cross-Platform MCP Server Setup for OpenCode          ║
╚══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

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

contains() {
    local item="$1"
    shift
    for x in "$@"; do
        if [[ "$x" == "$item" ]]; then
            return 0
        fi
    done
    return 1
}

show_installation_plan() {
    log_step "Installation Plan"
    
    echo -e "\n${BOLD}Mandatory MCP Servers:${NC}"
    for mcp in "${MANDATORY_MCPS[@]}"; do
        IFS=':' read -r name cmd desc <<< "$mcp"
        echo -e "  ${GREEN}✓${NC} $name - $desc"
    done
    echo -e "  ${GREEN}✓${NC} SearXNG Docker Container"
    
    if [[ ${#SELECTED_OPTIONAL_MCPS[@]} -gt 0 ]]; then
        echo -e "\n${BOLD}Optional MCP Servers:${NC}"
        for name in "${SELECTED_OPTIONAL_MCPS[@]}"; do
            for mcp in "${OPTIONAL_MCPS[@]}"; do
                IFS=':' read -r mcp_name cmd desc <<< "$mcp"
                if [[ "$mcp_name" == "$name" ]]; then
                    echo -e "  ${GREEN}✓${NC} $name - $desc"
                    break
                fi
            done
        done
    else
        echo -e "\n${BOLD}Optional MCP Servers:${NC} None selected"
    fi
    
    echo -e "\n${BOLD}Configuration:${NC}"
    echo -e "  ${CYAN}→${NC} OpenCode config: ~/.config/opencode/opencode.jsonc"
    echo -e "  ${CYAN}→${NC} Environment: ~/.config/opencode/.env"
    echo -e "  ${CYAN}→${NC} SearXNG port: ${SEARXNG_PORT:-auto-detect}"
    
    if [[ "${DRY_RUN:-false}" == "true" ]]; then
        echo -e "\n${YELLOW}[DRY-RUN] No changes will be made${NC}"
    fi
}

show_summary() {
    echo -e "\n${BOLD}${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${GREEN}  Installation Complete!${NC}"
    echo -e "${BOLD}${GREEN}═══════════════════════════════════════════════════════════════${NC}\n"
    
    echo -e "${BOLD}Installed MCP Servers:${NC}"
    echo -e "  ${GREEN}✓${NC} engram-mcp"
    echo -e "  ${GREEN}✓${NC} codebase-memory-mcp"
    echo -e "  ${GREEN}✓${NC} @kevinwatt/mcp-server-searxng"
    echo -e "  ${GREEN}✓${NC} SearXNG (port $SEARXNG_PORT)"
    
    for name in "${SELECTED_OPTIONAL_MCPS[@]}"; do
        echo -e "  ${GREEN}✓${NC} $name"
    done
    
    echo -e "\n${BOLD}Configuration Files:${NC}"
    echo -e "  ${CYAN}→${NC} ~/.config/opencode/opencode.jsonc (updated)"
    echo -e "  ${CYAN}→${NC} ~/.config/opencode/.env.example (generated)"
    echo -e "  ${CYAN}→${NC} ~/.config/opencode/.env (created from template)"
    echo -e "  ${CYAN}→${NC} ~/.config/searxng/settings.yml"
    
    echo -e "\n${BOLD}Next Steps:${NC}"
    echo -e "  1. Edit ~/.config/opencode/.env with your API keys:"
    echo -e "     ${YELLOW}nano ~/.config/opencode/.env${NC}"
    echo -e "  2. Start OpenCode:"
    echo -e "     ${YELLOW}opencode${NC}"
    echo -e "  3. Test MCP servers:"
    echo -e "     ${YELLOW}opencode mcp list${NC}"
    echo -e "  4. Test SearXNG:"
    echo -e "     ${YELLOW}curl http://localhost:$SEARXNG_PORT/search?q=test&format=json${NC}"
    
    if [[ "${DRY_RUN:-false}" == "true" ]]; then
        echo -e "\n${YELLOW}[DRY-RUN] This was a dry run - no changes were made${NC}"
    fi
}

# Run main if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi