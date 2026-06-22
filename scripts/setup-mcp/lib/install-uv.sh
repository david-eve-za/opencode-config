#!/usr/bin/env bash
# Automatic uv installation

source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
source "$(dirname "${BASH_SOURCE[0]}")/detect-os.sh"
source "$(dirname "${BASH_SOURCE[0]}")/check-prereqs.sh"

install_uv() {
    log_step "Installing uv (Python package manager)..."
    
    if command_exists uv; then
        local version
        version=$(uv --version | awk '{print $2}')
        log_info "uv already installed: $version"
        return 0
    fi
    
    # Check Python and pip
    check_python || {
        log_error "Python 3.8+ required for uv installation"
        return 1
    }
    
    check_pip || {
        log_error "pip required for uv installation"
        return 1
    }
    
    log_info "Installing uv via pip..."
    
    if [[ "${DRY_RUN:-false}" == "true" ]]; then
        log_info "$(dry_run_prefix)Would run: pip install uv"
        return 0
    fi
    
    # Try pip3 first, then pip
    if command_exists pip3; then
        run_cmd "pip3 install --user uv" "Install uv via pip3"
    elif command_exists pip; then
        run_cmd "pip install --user uv" "Install uv via pip"
    else
        log_error "No pip found"
        return 1
    fi
    
    # Add to PATH for current session
    export PATH="$HOME/.local/bin:$PATH"
    
    # Verify installation
    if command_exists uv; then
        local version
        version=$(uv --version | awk '{print $2}')
        log_success "uv installed successfully: $version"
        return 0
    else
        log_warn "uv installed but not in PATH, trying alternative..."
        
        # Try with python -m uv
        if python3 -m uv --version >/dev/null 2>&1; then
            log_success "uv available via python -m uv"
            return 0
        fi
        
        log_error "uv installation failed"
        return 1
    fi
}

# Install uv via official installer (alternative method)
install_uv_official() {
    log_info "Trying official uv installer..."
    
    if [[ "${DRY_RUN:-false}" == "true" ]]; then
        log_info "$(dry_run_prefix)Would run: curl -LsSf https://astral.sh/uv/install.sh | sh"
        return 0
    fi
    
    run_cmd "curl -LsSf https://astral.sh/uv/install.sh | sh" "Install uv via official installer"
    
    export PATH="$HOME/.cargo/bin:$PATH"
    
    if command_exists uv; then
        local version
        version=$(uv --version | awk '{print $2}')
        log_success "uv installed via official installer: $version"
        return 0
    fi
    
    return 1
}

# Main uv installation with fallback
ensure_uv() {
    if command_exists uv; then
        return 0
    fi
    
    log_warn "uv not found, attempting installation..."
    
    # Try pip first
    if install_uv; then
        return 0
    fi
    
    # Try official installer as fallback
    log_info "Trying official installer as fallback..."
    if install_uv_official; then
        return 0
    fi
    
    log_error "Failed to install uv automatically"
    return 1
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    detect_os
    ensure_uv
fi