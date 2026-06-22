#!/usr/bin/env bash
# Backup utilities

source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

# Backup a file with timestamp
backup_file() {
    local file="$1"
    local backup_dir="${2:-$(dirname "$file")}"
    
    if [[ ! -f "$file" ]]; then
        log_debug "File does not exist, no backup needed: $file"
        return 0
    fi
    
    local timestamp
    timestamp=$(date +%Y%m%d-%H%M%S)
    local basename
    basename=$(basename "$file")
    local backup="${backup_dir}/${basename}.backup.${timestamp}"
    
    if [[ "${DRY_RUN:-false}" == "true" ]]; then
        log_info "$(dry_run_prefix)Would backup $file to $backup"
        echo "$backup"
        return 0
    fi
    
    if cp "$file" "$backup"; then
        log_success "Backed up $file to $backup"
        echo "$backup"
    else
        log_error "Failed to backup $file"
        return 1
    fi
}

# Backup directory
backup_dir() {
    local dir="$1"
    local backup_parent="${2:-$(dirname "$dir")}"
    
    if [[ ! -d "$dir" ]]; then
        log_debug "Directory does not exist, no backup needed: $dir"
        return 0
    fi
    
    local timestamp
    timestamp=$(date +%Y%m%d-%H%M%S)
    local basename
    basename=$(basename "$dir")
    local backup="${backup_parent}/${basename}.backup.${timestamp}"
    
    if [[ "${DRY_RUN:-false}" == "true" ]]; then
        log_info "$(dry_run_prefix)Would backup $dir to $backup"
        echo "$backup"
        return 0
    fi
    
    if cp -r "$dir" "$backup"; then
        log_success "Backed up $dir to $backup"
        echo "$backup"
    else
        log_error "Failed to backup $dir"
        return 1
    fi
}

# List backups for a file
list_backups() {
    local file="$1"
    local backup_dir="${2:-$(dirname "$file")}"
    local basename
    basename=$(basename "$file")
    
    find "$backup_dir" -maxdepth 1 -name "${basename}.backup.*" -type f 2>/dev/null | sort -r
}

# Restore from backup
restore_backup() {
    local file="$1"
    local backup_file="$2"
    
    if [[ ! -f "$backup_file" ]]; then
        log_error "Backup file not found: $backup_file"
        return 1
    fi
    
    if [[ "${DRY_RUN:-false}" == "true" ]]; then
        log_info "$(dry_run_prefix)Would restore $file from $backup_file"
        return 0
    fi
    
    if cp "$backup_file" "$file"; then
        log_success "Restored $file from $backup_file"
    else
        log_error "Failed to restore $file"
        return 1
    fi
}

# Clean old backups (keep N most recent)
clean_old_backups() {
    local file="$1"
    local keep="${2:-5}"
    local backup_dir="${3:-$(dirname "$file")}"
    local basename
    basename=$(basename "$file")
    
    local backups
    mapfile -t backups < <(find "$backup_dir" -maxdepth 1 -name "${basename}.backup.*" -type f 2>/dev/null | sort -r)
    
    if [[ ${#backups[@]} -le $keep ]]; then
        log_debug "No old backups to clean (${#backups[@]}/$keep)"
        return 0
    fi
    
    local to_remove=("${backups[@]:$keep}")
    
    if [[ "${DRY_RUN:-false}" == "true" ]]; then
        for b in "${to_remove[@]}"; do
            log_info "$(dry_run_prefix)Would remove old backup: $b"
        done
        return 0
    fi
    
    for b in "${to_remove[@]}"; do
        rm -f "$b"
        log_debug "Removed old backup: $b"
    done
    
    log_success "Cleaned ${#to_remove[@]} old backups (kept $keep)"
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    # Test backup
    echo "Testing backup..."
    echo "test content" > /tmp/test_backup.txt
    backup_file /tmp/test_backup.txt
    list_backups /tmp/test_backup.txt
    clean_old_backups /tmp/test_backup.txt 2
fi