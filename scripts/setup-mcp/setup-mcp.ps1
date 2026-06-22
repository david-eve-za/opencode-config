<# 
.SYNOPSIS
    Cross-platform MCP server setup for OpenCode (Windows PowerShell)

.DESCRIPTION
    Installs mandatory and optional MCP servers, configures OpenCode,
    sets up SearXNG Docker container, and generates environment template.

.PARAMETER DryRun
    Show what would be done without executing

.PARAMETER All
    Install all optional MCP servers without prompting

.PARAMETER OnlyMandatory
    Install only mandatory MCP servers

.PARAMETER Verbose
    Enable verbose output

.PARAMETER NoSearXNG
    Skip SearXNG installation

.PARAMETER Help
    Show help message

.EXAMPLE
    .\setup-mcp.ps1

.EXAMPLE
    .\setup-mcp.ps1 --DryRun --All
#>

param(
    [switch]$DryRun,
    [switch]$All,
    [switch]$OnlyMandatory,
    [switch]$Verbose,
    [switch]$NoSearXNG,
    [switch]$Help
)

# Global variables
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$libDir = Join-Path $scriptDir "lib"

# Colors
$RED = [Console]::ForegroundColor = 'Red'
$GREEN = [Console]::ForegroundColor = 'Green'
$YELLOW = [Console]::ForegroundColor = 'Yellow'
$BLUE = [Console]::ForegroundColor = 'Blue'
$CYAN = [Console]::ForegroundColor = 'Cyan'
$RESET = [Console]::ResetColor()

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "HH:mm:ss"
    switch ($Level) {
        "INFO"  { Write-Host "[$timestamp] [INFO]  $Message" -ForegroundColor Cyan }
        "SUCCESS" { Write-Host "[$timestamp] [OK]    $Message" -ForegroundColor Green }
        "WARN"  { Write-Host "[$timestamp] [WARN]  $Message" -ForegroundColor Yellow }
        "ERROR" { Write-Host "[$timestamp] [ERROR] $Message" -ForegroundColor Red }
        "DEBUG" { if ($Verbose) { Write-Host "[$timestamp] [DEBUG] $Message" -ForegroundColor Gray } }
    }
}

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Blue
}

function Confirm-Action {
    param([string]$Prompt, [string]$Default = "N")
    if ($DryRun -or $All) { return $true }
    $choices = New-Object System.Collections.ObjectModel.Collection[System.Management.Automation.Host.ChoiceDescription]
    $choices.Add((New-Object System.Management.Automation.Host.ChoiceDescription -ArgumentList "&Yes"))
    $choices.Add((New-Object System.Management.Automation.Host.ChoiceDescription -ArgumentList "&No"))
    $defaultChoice = if ($Default -eq "Y") { 0 } else { 1 }
    $result = $Host.UI.PromptForChoice("Confirm", $Prompt, $choices, $defaultChoice)
    return $result -eq 0
}

# Mandatory MCP servers
$mandatoryMcps = @(
    @{Name="engram-mcp"; Command="npx -y engram-mcp@latest"; Description="Engram persistent memory"},
    @{Name="codebase-memory-mcp"; Command="curl -fsSL https://raw.githubusercontent.com/DeusData/codebase-memory-mcp/main/install.sh | bash"; Description="Codebase memory graph"},
    @{Name="searxng-mcp"; Command="npx -y @kevinwatt/mcp-server-searxng@latest"; Description="SearXNG meta search MCP"}
)

# Optional MCP servers
$optionalMcps = @(
    @{Name="github"; Command="npx -y @missionsquad/mcp-github@latest"; Description="GitHub API access"},
    @{Name="postgres"; Command="npx -y mcp-postgres@latest"; Description="PostgreSQL database operations"},
    @{Name="sqlite"; Command="npx -y mcp-server-sqlite@latest"; Description="SQLite database operations"},
    @{Name="docker"; Command="npx -y docker-mcp@latest"; Description="Docker container management"},
    @{Name="kubernetes"; Command="npx -y k8s-mcp@latest"; Description="Kubernetes cluster management"}
)

function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Get-Version {
    param([string]$Command, [string]$Regex = '(\d+\.\d+\.\d+)')
    if (Test-Command $Command) {
        $output = & $Command --version 2>$null
        if ($output -match $Regex) {
            return $matches[1]
        }
    }
    return "unknown"
}

function Version-GE {
    param([string]$Version1, [string]$Version2)
    try {
        $v1 = [System.Version]::new($Version1)
        $v2 = [System.Version]::new($Version2)
        return $v1 -ge $v2
    } catch {
        return $false
    }
}

function Check-Prerequisites {
    Write-Step "Checking prerequisites..."
    
    $allOk = $true
    
    # Node.js
    if (Test-Command "node") {
        $version = Get-Version "node" 'v?(\d+\.\d+\.\d+)'
        if (Version-GE $version "18.0.0") {
            Write-Log "Node.js $version (>= 18.0.0)" "SUCCESS"
        } else {
            Write-Log "Node.js $version is too old (need >= 18.0.0)" "ERROR"
            $allOk = $false
        }
    } else {
        Write-Log "Node.js not found (need >= 18.0.0)" "ERROR"
        $allOk = $false
    }
    
    # npm
    if (Test-Command "npm") {
        $version = Get-Version "npm"
        if (Version-GE $version "9.0.0") {
            Write-Log "npm $version (>= 9.0.0)" "SUCCESS"
        } else {
            Write-Log "npm $version is too old (need >= 9.0.0)" "ERROR"
            $allOk = $false
        }
    } else {
        Write-Log "npm not found (need >= 9.0.0)" "ERROR"
        $allOk = $false
    }
    
    # uv
    if (Test-Command "uv") {
        $version = Get-Version "uv" '(\d+\.\d+\.\d+)'
        if (Version-GE $version "0.4.0") {
            Write-Log "uv $version (>= 0.4.0)" "SUCCESS"
        } else {
            Write-Log "uv $version is old (need >= 0.4.0), will still work" "WARN"
        }
    } else {
        Write-Log "uv not found - will install automatically" "WARN"
    }
    
    # Docker
    if (Test-Command "docker") {
        $version = Get-Version "docker"
        if (Version-GE $version "24.0.0") {
            Write-Log "Docker $version (>= 24.0.0)" "SUCCESS"
            # Check Docker daemon
            try {
                docker info 2>$null | Out-Null
                Write-Log "Docker daemon is running" "SUCCESS"
            } catch {
                Write-Log "Docker daemon not running - will attempt to start" "WARN"
            }
        } else {
            Write-Log "Docker $version is too old (need >= 24.0.0)" "ERROR"
            $allOk = $false
        }
    } else {
        Write-Log "Docker not found (need >= 24.0.0)" "ERROR"
        $allOk = $false
    }
    
    return $allOk
}

function Install-UV {
    Write-Step "Installing uv..."
    
    if (Test-Command "uv") {
        $version = Get-Version "uv" '(\d+\.\d+\.\d+)'
        Write-Log "uv already installed: $version"
        return
    }
    
    # Check Python and pip
    $pythonCmd = if (Test-Command "python3") { "python3" } elseif (Test-Command "python") { "python" } else { $null }
    $pipCmd = if (Test-Command "pip3") { "pip3" } elseif (Test-Command "pip") { "pip" } else { $null }
    
    if (-not $pythonCmd) {
        Write-Log "Python 3.8+ required for uv installation" "ERROR"
        exit 1
    }
    
    if (-not $pipCmd) {
        Write-Log "pip required for uv installation" "ERROR"
        exit 1
    }
    
    Write-Log "Installing uv via pip..."
    if ($DryRun) {
        Write-Log "[DRY-RUN] Would run: $pipCmd install --user uv" "INFO"
        return
    }
    
    & $pipCmd install --user uv
    
    # Add to PATH for current session
    $env:PATH = "$env:USERPROFILE\.local\bin;$env:PATH"
    
    if (Test-Command "uv") {
        $version = Get-Version "uv" '(\d+\.\d+\.\d+)'
        Write-Log "uv installed successfully: $version" "SUCCESS"
    } else {
        Write-Log "uv installation failed" "ERROR"
        exit 1
    }
}

function Install-MCP {
    param([string]$Name, [string]$Command, [string]$Description)
    Write-Log "Installing $Name: $Description"
    
    if ($DryRun) {
        Write-Log "[DRY-RUN] Would run: $Command" "INFO"
        return
    }
    
    try {
        if ($Name -eq "codebase-memory-mcp") {
            # Special handling for codebase-memory-mcp - use official installer
            $cmd = "curl -fsSL https://raw.githubusercontent.com/DeusData/codebase-memory-mcp/main/install.sh | bash"
            Write-Log "Installing $Name via official installer..." "INFO"
            Invoke-Expression $cmd
            Write-Log "$Name installed" "SUCCESS"
        } else {
            Invoke-Expression $Command
            Write-Log "$Name installed" "SUCCESS"
        }
    } catch {
        Write-Log "$Name installation failed: $_" "WARN"
    }
}

function Install-MandatoryMCPs {
    Write-Step "Installing mandatory MCP servers..."
    foreach ($mcp in $mandatoryMcps) {
        Install-MCP $mcp.Name $mcp.Command $mcp.Description
    }
    Write-Log "All mandatory MCP servers installed" "SUCCESS"
}

function Install-OptionalMCPs {
    param([string[]]$ToInstall)
    
    if ($ToInstall.Count -eq 0) {
        Write-Log "No optional MCP servers selected"
        return
    }
    
    Write-Step "Installing optional MCP servers..."
    foreach ($name in $ToInstall) {
        $mcp = $optionalMcps | Where-Object { $_.Name -eq $name }
        if ($mcp) {
            Install-MCP $mcp.Name ("npx -y " + $mcp.Command + "@latest") $mcp.Description
        } else {
            Write-Log "Unknown optional MCP: $name" "WARN"
        }
    }
    Write-Log "Selected optional MCP servers installed" "SUCCESS"
}

function Select-OptionalMCPs {
    if ($All) {
        $script:SelectedOptional = $optionalMcps | ForEach-Object { $_.Name }
        Write-Log "Installing all optional MCP servers (--All)"
        return
    }
    
    if ($OnlyMandatory) {
        Write-Log "Installing only mandatory MCP servers (--OnlyMandatory)"
        $script:SelectedOptional = @()
        return
    }
    
    $script:SelectedOptional = @()
    Write-Step "Select optional MCP servers to install:"
    
    foreach ($mcp in $optionalMcps) {
        if (Confirm-Action "Install $($mcp.Name) ($($mcp.Description))?") {
            $script:SelectedOptional += $mcp.Name
        }
    }
}

function Install-SearXNG {
    Write-Step "Installing SearXNG with docker-compose..."
    
    # Create config directory
    $configDir = Join-Path $env:USERPROFILE ".config\searxng"
    if (-not (Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    }
    
    $composeDir = $configDir
    $composeFile = Join-Path $composeDir "docker-compose.yml"
    $envFile = Join-Path $composeDir ".env"
    $configSubDir = Join-Path $composeDir "core-config"
    $settingsFile = Join-Path $configSubDir "settings.yml"
    $envFile = Join-Path $composeDir ".env"
    
    # Create docker-compose.yml
    Write-Log "Creating docker-compose.yml for SearXNG..." "INFO"
    if ($DryRun) {
        Write-Log "[DRY-RUN] Would create $composeFile" "INFO"
    } else {
        if (-not (Test-Path $composeDir)) {
            New-Item -ItemType Directory -Path $composeDir -Force | Out-Null
        }
        
        @"
# SearXNG with Valkey (Redis-compatible) - Docker Compose
# Based on https://docs.searxng.org/admin/installation-docker.html
# Generated by setup-mcp script

services:
  core:
    container_name: searxng-core
    image: docker.io/searxng/searxng:\${SEARXNG_VERSION:-latest}
    restart: always
    ports:
      - "\${SEARXNG_HOST:+\${SEARXNG_HOST}:}\${SEARXNG_PORT:-1012}:\${SEARXNG_PORT:-8080}"
    env_file: .env
    volumes:
      - ./core-config/:/etc/searxng/:Z
      - core-data:/var/cache/searxng/
    depends_on:
      valkey:
        condition: service_healthy

  valkey:
    container_name: searxng-valkey
    image: docker.io/valkey/valkey:9-alpine
    command: valkey-server --save 30 1 --loglevel warning
    restart: always
    healthcheck:
      test: ["CMD", "valkey-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    volumes:
      - valkey-data:/data/

volumes:
  core-data:
  valkey-data:
"@ | Out-File -FilePath $composeFile -Encoding UTF8
        Write-Log "docker-compose.yml created at $composeFile" "SUCCESS"
    }
    
    # Create SearXNG config
    Write-Log "Creating SearXNG configuration..." "INFO"
    if ($DryRun) {
        Write-Log "[DRY-RUN] Would create $configSubDir/settings.yml" "INFO"
    } else {
        if (-not (Test-Path $configSubDir)) {
            New-Item -ItemType Directory -Path $configSubDir -Force | Out-Null
        }
        
        @"
# SearXNG Configuration - Basic Setup
# Generated by setup-mcp script

general:
  debug: false
  instance_name: "SearXNG MCP"
  contact_url: false
  enable_metrics: false

server:
  port: 8080
  bind_address: "0.0.0.0"
  secret_key: "changeme"
  limiter: false
  image_proxy: true

ui:
  static_use_hash: true
  default_theme: simple
  default_locale: ""
  center_alignment: false

search:
  safe_search: 1
  autocomplete: ""
  default_lang: "all"
  formats:
    - html
    - json
  categories:
    - general
  language_cookies_expire: 30

engines:
  - name: google
    engine: google
    shortcut: g
    tokens: [google]
    disabled: false
  - name: duckduckgo
    engine: duckduckgo
    shortcut: d
    tokens: [duckduckgo]
    disabled: false
  - name: bing
    engine: bing
    shortcut: b
    tokens: [bing]
    disabled: false

redis:
  enabled: true
  host: valkey
  port: 6379

database:
  enabled: false
"@ | Out-File -FilePath $settingsFile -Encoding UTF8
        Write-Log "SearXNG config created at $settingsFile" "SUCCESS"
    }
    
    # Create .env file
    Write-Log "Creating .env file for SearXNG..." "INFO"
    if ($DryRun) {
        Write-Log "[DRY-RUN] Would create $envFile" "INFO"
    } else {
        @"
# SearXNG Environment Variables
# Generated by setup-mcp script

# General
SEARXNG_VERSION=latest
SEARXNG_HOST=
SEARXNG_PORT=1012

# Redis/Valkey
REDIS_HOST=valkey
REDIS_PORT=6379

# SearXNG Settings
SEARXNG_SECRET_KEY=changeme
SEARXNG_LIMITER=false
SEARXNG_IMAGE_PROXY=true
SEARXNG_SAFE_SEARCH=1
SEARXNG_DEFAULT_LANG=all
"@ | Out-File -FilePath $envFile -Encoding UTF8
        Write-Log ".env file created at $envFile" "SUCCESS"
    }
    
    # Pull images
    Write-Log "Pulling SearXNG and Valkey Docker images..." "INFO"
    if (-not $DryRun) {
        docker compose -f $composeFile pull
    }
    
    # Stop existing compose if exists
    Write-Log "Stopping existing SearXNG containers..." "INFO"
    if (-not $DryRun) {
        docker compose -f $composeFile down -v
    }
    
    # Run docker-compose
    Write-Log "Starting SearXNG with docker-compose..." "INFO"
    if ($DryRun) {
        Write-Log "[DRY-RUN] Would run: docker compose -f $composeFile up -d" "INFO"
    } else {
        docker compose -f $composeFile up -d
    }
    
    # Health check
    Write-Log "Waiting for SearXNG to be healthy on port 1012..." "INFO"
    $url = "http://localhost:1012/search?q=test&format=json"
    $attempts = 0
    $maxAttempts = 60
    
    while ($attempts -lt $maxAttempts) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:1012/search?q=test&format=json" -Method GET -TimeoutSec 5 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Log "SearXNG is healthy and responding" "SUCCESS"
                $script:SearXNGPort = 1012
                return
            }
        } catch {
            # Not ready yet
        }
        $attempts++
        if ($attempts % 5 -eq 0) {
            Write-Log "Health check attempt $attempts/$maxAttempts..."
        }
        Start-Sleep -Seconds 2
    }
    
    Write-Log "SearXNG health check failed" "ERROR"
    docker compose -f $composeFile logs --tail 50 2>$null
    exit 1
}

function Update-OpenCodeConfig {
    param([int]$SearXNGPort, [string[]]$OptionalMCPs)
    
    Write-Step "Updating OpenCode configuration..."
    
    $configDir = Join-Path $env:USERPROFILE ".config\opencode"
    $configFile = Join-Path $configDir "opencode.jsonc"
    
    # Determine optional MCPs
    $installGithub = $OptionalMCPs -contains "github"
    $installPostgres = $OptionalMCPs -contains "postgres"
    $installSqlite = $OptionalMCPs -contains "sqlite"
    $installDocker = $OptionalMCPs -contains "docker"
    $installK8s = $OptionalMCPs -contains "kubernetes"
    
    # Build MCP config JSON
    $mcpConfig = @{
        "engram" = @{
            "type" = "local"
            "command" = @("npx", "-y", "engram-mcp@latest")
            "env" = @{ "ENGRAM_DB_PATH" = '${ENGRAM_DB_PATH}' }
        }
        "codebase-memory" = @{
            "type" = "local"
            "command" = @("codebase-memory-mcp")
            "env" = @{ "CODEBASE_MEMORY_DB" = '${CODEBASE_MEMORY_DB}' }
        }
        "searxng" = @{
            "type" = "local"
            "command" = @("npx", "-y", "@kevinwatt/mcp-server-searxng")
            "environment" = @{
                "SEARXNG_URL" = "http://localhost:1012"
            },
            "enabled" = $true
        }
    }
    
    if ($installGithub) {
        $mcpConfig["github"] = @{
            "type" = "local"
            "command" = @("npx", "-y", "@missionsquad/mcp-github@latest")
            "env" = @{ "GITHUB_PERSONAL_ACCESS_TOKEN" = '${GITHUB_PERSONAL_ACCESS_TOKEN}' }
        }
    }
    
    if ($installPostgres) {
        $mcpConfig["postgres"] = @{
            "type" = "local"
            "command" = @("npx", "-y", "mcp-postgres@latest")
            "env" = @{ "POSTGRES_URL" = '${POSTGRES_URL}' }
        }
    }
    
    if ($installSqlite) {
        $mcpConfig["sqlite"] = @{
            "type" = "local"
            "command" = @("npx", "-y", "mcp-server-sqlite@latest")
        }
    }
    
    if ($installDocker) {
        $mcpConfig["docker"] = @{
            "type" = "local"
            "command" = @("npx", "-y", "docker-mcp@latest")
        }
    }
    
    if ($installK8s) {
        $mcpConfig["kubernetes"] = @{
            "type" = "local"
            "command" = @("npx", "-y", "k8s-mcp@latest")
        }
    }
    
    $fullConfig = @{ "mcp" = $mcpConfig }
    
    if ($DryRun) {
        Write-Log "[DRY-RUN] Would update $configFile" "INFO"
        return
    }
    
    # Create config directory
    if (-not (Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    }
    
    # Backup existing config
    if (Test-Path $configFile) {
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $backup = "$configFile.backup.$timestamp"
        Copy-Item $configFile $backup
        Write-Log "Backed up $configFile to $backup" "SUCCESS"
    }
    
    # Write config
    $fullConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath $configFile -Encoding UTF8
    Write-Log "OpenCode configuration updated at $configFile" "SUCCESS"
}

function Generate-EnvExample {
    param([int]$SearXNGPort, [string[]]$OptionalMCPs)
    
    Write-Step "Generating environment template..."
    
    $configDir = Join-Path $env:USERPROFILE ".config\opencode"
    $envExampleFile = Join-Path $configDir ".env.example"
    
    if (-not (Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    }
    
    $installGithub = $OptionalMCPs -contains "github"
    $installPostgres = $OptionalMCPs -contains "postgres"
    
    $content = @"
# ===========================================
# OpenCode MCP Environment Variables
# Generated by setup-mcp on $(Get-Date)
# Copy to .env and fill in your values
# ===========================================

# === MANDATORY ===
# Engram persistent memory database
ENGRAM_DB_PATH=~/.engram/engram.db

# Codebase memory graph database
CODEBASE_MEMORY_DB=~/.codebase-memory/graph.db

# SearXNG meta search instance
SEARXNG_INSTANCES=http://localhost:$SearXNGPort
SEARXNG_USER_AGENT=MCP-SearXNG/1.0

# === OPTIONAL - Set based on installed MCP servers ===
"@
    
    if ($installGithub) {
        $content += @"

# GitHub API access (required for @missionsquad/mcp-github)
# Create token at: https://github.com/settings/tokens
# Required scopes: repo, read:org, read:user
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxxx
"
    }
    
    if ($installPostgres) {
        $content += @"

# PostgreSQL connection (required for mcp-postgres)
# Format: postgresql://user:password@host:port/database
POSTGRES_URL=postgresql://user:pass@localhost:5432/mydb
"
    }
    
    $content += @"

# === AI MODEL CONFIGURATION ===
# NVIDIA NIM API Key (for cloud models)
# Get from: https://build.nvidia.com/
NVIDIA_API_KEY=nvapi_xxxx

# Ollama local models
# Default: http://localhost:11434
OLLAMA_HOST=http://localhost:11434

# === ADVANCED ===
# NODE_TLS_REJECT_UNAUTHORIZED=0  # Disable SSL verify (dev only)
"
    
    if ($DryRun) {
        Write-Log "[DRY-RUN] Would generate $envExampleFile" "INFO"
        return
    }
    
    $content | Out-File -FilePath $envExampleFile -Encoding UTF8
    Write-Log "Environment template generated: $envExampleFile" "SUCCESS"
    
    # Create .env from template if not exists
    $envFile = Join-Path $configDir ".env"
    if (-not (Test-Path $envFile)) {
        Copy-Item $envExampleFile $envFile
        Write-Log "Created .env from template" "INFO"
    }
}

function Show-Summary {
    param([int]$SearXNGPort, [string[]]$OptionalMCPs)
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "  Installation Complete!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Installed MCP Servers:" -ForegroundColor Cyan
    Write-Host "  ✓ engram-mcp" -ForegroundColor Green
    Write-Host "  ✓ codebase-memory-mcp" -ForegroundColor Green
    Write-Host "  ✓ @kevinwatt/mcp-server-searxng" -ForegroundColor Green
    Write-Host "  ✓ SearXNG (port $SearXNGPort)" -ForegroundColor Green
    
    foreach ($name in $OptionalMCPs) {
        Write-Host "  ✓ $name" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Configuration Files:" -ForegroundColor Cyan
    Write-Host "  → ~/.config/opencode/opencode.jsonc (updated)" -ForegroundColor Cyan
    Write-Host "  → ~/.config/opencode/.env.example (generated)" -ForegroundColor Cyan
    Write-Host "  → ~/.config/opencode/.env (created from template)" -ForegroundColor Cyan
    Write-Host "  → ~/.config/searxng/settings.yml" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Edit ~/.config/opencode/.env with your API keys:"
    Write-Host "     notepad ~/.config/opencode/.env" -ForegroundColor Yellow
    Write-Host "  2. Start OpenCode:"
    Write-Host "     opencode" -ForegroundColor Yellow
    Write-Host "  3. Test MCP servers:"
    Write-Host "     opencode mcp list" -ForegroundColor Yellow
    Write-Host "  4. Test SearXNG:"
    Write-Host "     curl http://localhost:$SearXNGPort/search?q=test&format=json" -ForegroundColor Yellow
    
    if ($DryRun) {
        Write-Host ""
        Write-Host "[DRY-RUN] This was a dry run - no changes were made" -ForegroundColor Yellow
    }
}

# Main execution
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║                    setup-mcp.ps1                              ║" -ForegroundColor Blue
Write-Host "║         Cross-Platform MCP Server Setup for OpenCode          ║" -ForegroundColor Blue
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

if ($Help) {
    Write-Host "Usage: .\setup-mcp.ps1 [--DryRun] [--All] [--OnlyMandatory] [--Verbose] [--NoSearXNG] [--Help]"
    exit 0
}

# Check prerequisites
if (-not (Check-Prerequisites)) {
    Write-Log "Prerequisites check failed" "ERROR"
    exit 1
}

# Install uv if needed
if (-not (Test-Command "uv")) {
    Install-UV
}

# Select optional MCPs
Select-OptionalMCPs

# Show plan
Write-Step "Installation Plan"
Write-Host "Mandatory MCP Servers:" -ForegroundColor Cyan
foreach ($mcp in $mandatoryMcps) {
    Write-Host "  ✓ $($mcp.Name) - $($mcp.Description)" -ForegroundColor Green
}
Write-Host "  ✓ SearXNG Docker Container" -ForegroundColor Green

if ($script:SelectedOptional.Count -gt 0) {
    Write-Host "Optional MCP Servers:" -ForegroundColor Cyan
    foreach ($name in $script:SelectedOptional) {
        $mcp = $optionalMcps | Where-Object { $_.Name -eq $name }
        Write-Host "  ✓ $($mcp.Name) - $($mcp.Description)" -ForegroundColor Green
    }
} else {
    Write-Host "Optional MCP Servers: None selected" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  → OpenCode config: ~/.config/opencode/opencode.jsonc" -ForegroundColor Cyan
Write-Host "  → Environment: ~/.config/opencode/.env" -ForegroundColor Cyan
Write-Host "  → SearXNG port: auto-detect" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host ""
    Write-Host "[DRY-RUN] No changes will be made" -ForegroundColor Yellow
}

if (-not (Confirm-Action "Proceed with installation?")) {
    Write-Log "Installation cancelled"
    exit 0
}

# Install
Install-MandatoryMCPs

if (-not $NoSearXNG) {
    Install-SearXNG
} else {
    Write-Log "Skipping SearXNG installation (--NoSearXNG)" "WARN"
    $script:SearXNGPort = 8080
}

if (-not $OnlyMandatory) {
    Install-OptionalMCPs $script:SelectedOptional
}

# Configure
Update-OpenCodeConfig $script:SearXNGPort $script:SelectedOptional
Generate-EnvExample $script:SearXNGPort $script:SelectedOptional

# Summary
Show-Summary $script:SearXNGPort $script:SelectedOptional
