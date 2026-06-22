#!/usr/bin/env bash
# Prerequisites checking for MCP setup

source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
source "$(dirname "${BASH_SOURCE[0]}")/detect-os.sh"

# Minimum required versions
if [[ -z "${MIN_NODE_VERSION:-}" ]]; then
    readonly MIN_NODE_VERSION="18.0.0"
    readonly MIN_NPM_VERSION="9.0.0"
    readonly MIN_UV_VERSION="0.4.0"
    readonly MIN_DOCKER_VERSION="24.0.0"
    readonly MIN_DOCKER_COMPOSE_VERSION="2.0.0"
fi

check_all_prereqs() {
    log_step "Checking prerequisites..."
    
    local all_ok=true
    
    check_node || all_ok=false
    check_npm || all_ok=false
    check_uv || all_ok=false
    check_docker || all_ok=false
    check_docker_compose || all_ok=false
    
    if [[ "$all_ok" == "true" ]]; then
        log_success "All prerequisites satisfied"
        return 0
    else
        log_error "Some prerequisites are missing"
        return 1
    fi
}

check_node() {
    if command_exists node; then
        local version
        version=$(node --version | sed 's/^v//')
        log_debug "Found node $version"
        
        if version_ge "$version" "$MIN_NODE_VERSION"; then
            log_success "Node.js $version (>= $MIN_NODE_VERSION)"
            return 0
        else
            log_error "Node.js $version is too old (need >= $MIN_NODE_VERSION)"
            return 1
        fi
    else
        log_error "Node.js not found (need >= $MIN_NODE_VERSION)"
        return 1
    fi
}

check_npm() {
    if command_exists npm; then
        local version
        version=$(npm --version)
        log_debug "Found npm $version"
        
        if version_ge "$version" "$MIN_NPM_VERSION"; then
            log_success "npm $version (>= $MIN_NPM_VERSION)"
            return 0
        else
            log_error "npm $version is too old (need >= $MIN_NPM_VERSION)"
            return 1
        fi
    else
        log_error "npm not found (need >= $MIN_NPM_VERSION)"
        return 1
    fi
}

check_uv() {
    if command_exists uv; then
        local version
        version=$(uv --version | awk '{print $2}')
        log_debug "Found uv $version"
        
        if version_ge "$version" "$MIN_UV_VERSION"; then
            log_success "uv $version (>= $MIN_UV_VERSION)"
            return 0
        else
            log_warn "uv $version is old (need >= $MIN_UV_VERSION), will still work"
            return 0
        fi
    else
        log_warn "uv not found - will install automatically"
        return 1
    fi
}

check_docker() {
    if command_exists docker; then
        local version
        version=$(docker --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
        log_debug "Found docker $version"
        
        if version_ge "$version" "$MIN_DOCKER_VERSION"; then
            log_success "Docker $version (>= $MIN_DOCKER_VERSION)"
            
            # Check if Docker daemon is running
            if docker info >/dev/null 2>&1 || (docker_cmd info >/dev/null 2>&1); then
                log_success "Docker daemon is running"
            else
                log_warn "Docker daemon not running - will attempt to start"
            fi
            return 0
        else
            log_error "Docker $version is too old (need >= $MIN_DOCKER_VERSION)"
            return 1
        fi
    else
        log_error "Docker not found (need >= $MIN_DOCKER_VERSION)"
        return 1
    fi
}

check_docker_compose() {
    if docker compose version >/dev/null 2>&1 || docker_cmd compose version >/dev/null 2>&1; then
        local version
        version=$(docker compose version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1 || \
                  docker_cmd compose version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
        log_debug "Found docker compose $version"
        
        if version_ge "$version" "$MIN_DOCKER_COMPOSE_VERSION"; then
            log_success "Docker Compose $version (>= $MIN_DOCKER_COMPOSE_VERSION)"
            return 0
        else
            log_warn "Docker Compose $version is old (need >= $MIN_DOCKER_COMPOSE_VERSION)"
            return 0
        fi
    elif command_exists docker-compose; then
        local version
        version=$(docker-compose --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
        log_debug "Found docker-compose (standalone) $version"
        
        if version_ge "$version" "$MIN_DOCKER_COMPOSE_VERSION"; then
            log_success "docker-compose $version (>= $MIN_DOCKER_COMPOSE_VERSION)"
            return 0
        else
            log_warn "docker-compose $version is old (need >= $MIN_DOCKER_COMPOSE_VERSION)"
            return 0
        fi
    else
        log_warn "Docker Compose not found - some features may not work"
        return 0
    fi
}

# Check Python for uv installation
check_python() {
    if command_exists python3; then
        local version
        version=$(python3 --version | awk '{print $2}')
        log_debug "Found Python $version"
        if version_ge "$version" "3.8.0"; then
            log_success "Python $version (>= 3.8.0)"
            return 0
        fi
    elif command_exists python; then
        local version
        version=$(python --version | awk '{print $2}')
        log_debug "Found Python $version"
        if version_ge "$version" "3.8.0"; then
            log_success "Python $version (>= 3.8.0)"
            return 0
        fi
    fi
    
    log_warn "Python 3.8+ not found - uv installation may fail"
    return 1
}

# Check pip for uv installation
check_pip() {
    if command_exists pip3; then
        log_success "pip3 found"
        return 0
    elif command_exists pip; then
        log_success "pip found"
        return 0
    fi
    
    log_warn "pip not found - uv installation may fail"
    return 1
}

# Run all checks if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    detect_os
    check_all_prereqs
fi