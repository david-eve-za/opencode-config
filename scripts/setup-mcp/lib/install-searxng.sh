#!/usr/bin/env bash
# SearXNG Docker Installation and Health Check using pre-bundled docker-compose

source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

# SearXNG configuration
if [[ -z "${SEARXNG_IMAGE:-}" ]]; then
    readonly SEARXNG_IMAGE="searxng/searxng"
    readonly SEARXNG_CONTAINER_NAME="searxng-core"
    readonly SEARXNG_BASE_PORT=1012
    readonly SEARXNG_CONFIG_DIR="${HOME}/.config/searxng"
    readonly SEARXNG_HEALTH_ENDPOINT="/search?q=test&format=json"
    readonly SEARXNG_HEALTH_TIMEOUT=120
    readonly SEARXNG_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../searxng" && pwd)"
    readonly SEARXNG_COMPOSE_FILE="${SEARXNG_SCRIPT_DIR}/docker-compose.yml"
    readonly SEARXNG_ENV_FILE="${SEARXNG_SCRIPT_DIR}/.env"
fi

# Detect docker compose command (v2: "docker compose", v1: "docker-compose")
detect_docker_compose() {
    if docker compose version >/dev/null 2>&1; then
        echo "docker compose"
    elif command -v docker-compose >/dev/null 2>&1; then
        echo "docker-compose"
    else
        echo "docker compose"  # default fallback
    fi
}

# Get the docker compose command
DOCKER_COMPOSE_CMD=$(detect_docker_compose)
readonly DOCKER_COMPOSE_CMD

install_searxng() {
    log_step "Installing SearXNG with docker-compose..."
    
    # Find free port
    local port
    port=$(find_free_port "$SEARXNG_BASE_PORT")
    
    if [[ -z "$port" ]]; then
        log_error "Could not find free port for SearXNG"
        return 1
    fi
    
    log_info "Using port $port for SearXNG"
    
    # Check if compose file exists
    if [[ ! -f "$SEARXNG_COMPOSE_FILE" ]]; then
        log_error "docker-compose.yml not found at $SEARXNG_COMPOSE_FILE"
        return 1
    fi
    
    # Check if .env exists, create from example if not
    if [[ ! -f "$SEARXNG_SCRIPT_DIR/.env" ]]; then
        if [[ -f "$SEARXNG_SCRIPT_DIR/.env.example" ]]; then
            cp "$SEARXNG_SCRIPT_DIR/.env.example" "$SEARXNG_SCRIPT_DIR/.env"
            log_info "Created .env from example"
        else
            log_error ".env.example not found"
            return 1
        fi
    fi
    
    # Update .env with the selected port
    if [[ "${DRY_RUN:-false}" != "true" ]]; then
        sed -i "s/^SEARXNG_PORT=.*/SEARXNG_PORT=$port/" "$SEARXNG_SCRIPT_DIR/.env"
    fi
    
    # Pull images
    pull_searxng_images
    
    # Stop existing compose if exists
    stop_existing_searxng
    
    # Run docker-compose
    run_searxng_compose "$port"
    
    # Health check
    if wait_for_searxng_health "$port"; then
        log_success "SearXNG is running on port $port"
        export SEARXNG_PORT="$port"
        export SEARXNG_INSTANCES="http://localhost:$port"
        return 0
    else
        log_error "SearXNG health check failed"
        return 1
    fi
}

pull_searxng_images() {
    log_substep "Pulling SearXNG and Valkey Docker images..."
    
    if [[ "${DRY_RUN:-false}" == "true" ]]; then
        log_info "$(dry_run_prefix)Would run: ${DOCKER_COMPOSE_CMD} -f ${SEARXNG_COMPOSE_FILE} pull"
        return 0
    fi
    
    run_cmd "${DOCKER_COMPOSE_CMD} -f ${SEARXNG_COMPOSE_FILE} pull" "Pull SearXNG and Valkey images"
}

stop_existing_searxng() {
    log_substep "Stopping existing SearXNG containers..."
    
    if [[ "${DRY_RUN:-false}" == "true" ]]; then
        log_info "$(dry_run_prefix)Would run: ${DOCKER_COMPOSE_CMD} -f ${SEARXNG_COMPOSE_FILE} down -v"
        return 0
    fi
    
    run_cmd "${DOCKER_COMPOSE_CMD} -f ${SEARXNG_COMPOSE_FILE} down -v" "Stop and remove existing SearXNG containers"
}

run_searxng_compose() {
    local port="$1"
    
    log_substep "Starting SearXNG with docker-compose on port $port..."
    
    if [[ "${DRY_RUN:-false}" == "true" ]]; then
        log_info "$(dry_run_prefix)Would run: ${DOCKER_COMPOSE_CMD} -f ${SEARXNG_COMPOSE_FILE} up -d"
        return 0
    fi
    
    # Update port in .env
    sed -i "s/^SEARXNG_PORT=.*/SEARXNG_PORT=$port/" "${SEARXNG_SCRIPT_DIR}/.env"
    
    run_cmd "${DOCKER_COMPOSE_CMD} -f ${SEARXNG_COMPOSE_FILE} up -d" "Start SearXNG with docker-compose"
}

wait_for_searxng_health() {
    local port="$1"
    local url="http://localhost:$port/search?q=test&format=json"
    
    log_substep "Waiting for SearXNG to be healthy on port $port..."
    
    if [[ "${DRY_RUN:-false}" == "true" ]]; then
        log_info "$(dry_run_prefix)Would wait for health check at $url"
        return 0
    fi
    
    local attempt=1
    local max_attempts=$((SEARXNG_HEALTH_TIMEOUT / 2))
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -sf "http://localhost:$port/search?q=test&format=json" >/dev/null 2>&1; then
            log_success "SearXNG is healthy and responding"
            return 0
        fi
        
        if [[ $((attempt % 5)) -eq 0 ]]; then
            log_substep "Health check attempt $attempt/$max_attempts..."
        fi
        
        sleep 2
        attempt=$((attempt + 1))
    done
    
    # Show container logs for debugging
    log_error "SearXNG health check failed after ${SEARXNG_HEALTH_TIMEOUT}s"
    log_substep "Container logs:"
    ${DOCKER_COMPOSE_CMD} -f "${SEARXNG_COMPOSE_FILE}" logs --tail 50 2>/dev/null || true
    
    return 1
}

# Get SearXNG status
searxng_status() {
    if ${DOCKER_COMPOSE_CMD} -f "${SEARXNG_COMPOSE_FILE}" ps --format '{{.Names}}' | grep -q "^searxng-core$"; then
        local port
        port=$(${DOCKER_COMPOSE_CMD} -f "${SEARXNG_COMPOSE_FILE}" port searxng-core 2>/dev/null | grep '8080/tcp' | cut -d: -f2 | head -1)
        echo "running:${port}"
    else
        echo "stopped"
    fi
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    install_searxng
fi