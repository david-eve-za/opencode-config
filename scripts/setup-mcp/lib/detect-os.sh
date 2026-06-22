#!/usr/bin/env bash
# OS Detection and Package Manager Identification

source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

# Global variables
OS=""
PACKAGE_MANAGER=""
ARCH=""
DISTRO=""
DISTRO_VERSION=""

detect_os() {
    log_step "Detecting operating system..."
    
    OS=$(get_os)
    ARCH=$(uname -m)
    
    case "$OS" in
        linux)
            detect_linux_distro
            PACKAGE_MANAGER=$(get_package_manager)
            ;;
        macos)
            PACKAGE_MANAGER="brew"
            ;;
        windows)
            PACKAGE_MANAGER="winget"
            ;;
        *)
            log_error "Unsupported operating system: $(uname -s)"
            exit 1
            ;;
    esac
    
    log_info "OS: $OS ($DISTRO $DISTRO_VERSION)"
    log_info "Architecture: $ARCH"
    log_info "Package manager: $PACKAGE_MANAGER"
    
    export OS PACKAGE_MANAGER ARCH DISTRO DISTRO_VERSION
}

detect_linux_distro() {
    if [[ -f /etc/os-release ]]; then
        # shellcheck source=/dev/null
        source /etc/os-release
        DISTRO="${ID:-unknown}"
        DISTRO_VERSION="${VERSION_ID:-unknown}"
    elif [[ -f /etc/lsb-release ]]; then
        # shellcheck source=/dev/null
        source /etc/lsb-release
        DISTRO="${DISTRIB_ID:-unknown}"
        DISTRO_VERSION="${DISTRIB_RELEASE:-unknown}"
    elif [[ -f /etc/redhat-release ]]; then
        DISTRO="rhel"
        DISTRO_VERSION=$(cat /etc/redhat-release | grep -oE '[0-9]+\.[0-9]+' | head -1)
    else
        DISTRO="unknown"
        DISTRO_VERSION="unknown"
    fi
}

# Check if running in WSL
is_wsl() {
    if [[ -f /proc/version ]] && grep -qi microsoft /proc/version; then
        return 0
    fi
    return 1
}

# Check if running in container
is_container() {
    if [[ -f /.dockerenv ]] || grep -qa container /proc/1/environ 2>/dev/null; then
        return 0
    fi
    return 1
}

# Get available memory in MB
get_memory_mb() {
    case "$OS" in
        linux)
            free -m | awk '/^Mem:/{print $2}'
            ;;
        macos)
            sysctl -n hw.memsize | awk '{print int($1/1024/1024)}'
            ;;
        windows)
            wmic computersystem get TotalPhysicalMemory /value 2>/dev/null | \
                awk -F= '/TotalPhysicalMemory/{print int($2/1024/1024)}'
            ;;
        *)
            echo "unknown"
            ;;
    esac
}

# Get CPU cores
get_cpu_cores() {
    case "$OS" in
        linux)
            nproc
            ;;
        macos)
            sysctl -n hw.ncpu
            ;;
        windows)
            wmic cpu get NumberOfLogicalProcessors /value 2>/dev/null | \
                awk -F= '/NumberOfLogicalProcessors/{print $2}'
            ;;
        *)
            echo "unknown"
            ;;
    esac
}

# Run detection if script executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    detect_os
    echo "OS: $OS"
    echo "Distro: $DISTRO $DISTRO_VERSION"
    echo "Arch: $ARCH"
    echo "Package Manager: $PACKAGE_MANAGER"
    echo "Memory: $(get_memory_mb) MB"
    echo "CPU Cores: $(get_cpu_cores)"
fi