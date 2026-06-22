#!/usr/bin/env python3
import json
import re
import sys
import subprocess
import os

def strip_jsonc_comments(content):
    """Strip // and /* */ comments from JSONC content (outside strings)"""
    result = []
    in_string = False
    escaped = False
    i = 0
    while i < len(content):
        ch = content[i]
        next_ch = content[i+1] if i+1 < len(content) else ''
        if not in_string and ch == '/' and next_ch == '/':
            # Skip to end of line
            while i < len(content) and content[i] != '\n':
                i += 1
            continue
        if not in_string and ch == '/' and next_ch == '*':
            # Skip block comment
            i += 2
            while i < len(content) - 1:
                if content[i] == '*' and content[i+1] == '/':
                    i += 2
                    break
                i += 1
            continue
        if ch == '"' and not escaped:
            in_string = not in_string
        escaped = (ch == '\\' and not escaped)
        result.append(ch)
        i += 1
    return ''.join(result)

def run_validation():
    with open('/workspace/opencode.jsonc', 'r') as f:
        content = f.read()
    
    # Strip comments
    cleaned = strip_jsonc_comments(content)
    
    # Parse JSON
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        print(f"JSONC Validation FAILED: {e}")
        # Debug: show the problematic area
        lines = cleaned.split('\n')
        start = max(0, e.lineno - 3)
        end = min(len(lines), e.lineno + 2)
        print(f"Error at line {e.lineno}:")
        for i in range(start, end):
            print(f"  {i+1}: {lines[i]}")
        return False
    
    print("opencode.jsonc: VALID JSONC")
    print(f"  Model: {data.get('model')}")
    print(f"  Small model: {data.get('small_model')}")
    print(f"  Agent overrides: {len(data.get('agent', {}))}")
    print(f"  MCP servers: {len(data.get('mcp', {}))}")
    print(f"  MCP profiles: {len(data.get('mcp_profiles', {}))}")
    print(f"  Model routing providers: {list(data.get('model_routing', {}).get('providers', {}).keys())}")
    
    # Agent overrides
    agents = data.get('agent', {})
    print(f"\nTotal agents: {len(agents)}")
    for name, cfg in agents.items():
        model = cfg.get('model', 'default')
        temp = cfg.get('temperature', 'N/A')
        tools = cfg.get('tools', {})
        perms = cfg.get('permission', {})
        write_perm = tools.get('write', 'allow')
        perm_keys = list(perms.keys())[:3]
        print(f"  {name}: model={model}, temp={temp}, write={write_perm}, perms_keys={list(perms.keys())[:3]}")
    
    # MCP servers
    mcp = data.get('mcp', {})
    print(f"\nMCP Servers: {len(mcp)}")
    for name, cfg in mcp.items():
        print(f"  {name}: type={cfg.get('type')}, command={cfg.get('command')}")
    
    # MCP profiles
    profiles = data.get('mcp_profiles', {})
    print(f"\nMCP Profiles: {len(profiles)}")
    for name, cfg in profiles.items():
        print(f"  {name}: includes={cfg.get('includes')}, excludes={cfg.get('excludes')}")
    
    # Model routing
    routing = data.get('model_routing', {})
    print(f"\nModel routing providers: {list(routing.get('providers', {}).keys())}")
    print(f"  Routing rules: {list(routing.get('routing_rules', {}).keys())}")
    
    return True

def check_prerequisites():
    checks = [
        ("Node", ["node", "--version"]),
        ("npm", ["npm", "--version"]),
        ("Docker", ["docker", "--version"]),
        ("Git", ["git", "--version"]),
        ("uv", ["/root/.local/bin/uv", "--version"]),
        ("opencode (lildax)", ["/usr/local/lib/node_modules/@opencode-ai/cli/bin/lildax", "--version"]),
    ]
    
    print("=== 1. Prerequisites Check ===")
    all_ok = True
    for name, cmd in checks:
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                print(f"{name}: OK ({result.stdout.strip()})")
            else:
                print(f"{name}: FAIL")
                return False
        except Exception as e:
            print(f"{name}: FAIL ({e})")
            return False
    return True

def check_agent_files():
    print("\n=== 4. Agent Files Validation ===")
    agent_dir = '/workspace/agent'
    if not os.path.exists(agent_dir):
        print("Agent directory not found!")
        return False
    
    agent_files = []
    for root, dirs, files in os.walk(agent_dir):
        for f in files:
            if f.endswith('.md'):
                agent_files.append(os.path.join(root, f))
    
    print(f"Total agent files: {len(agent_files)}")
    for f in sorted(agent_files):
        print(f"  {f}")
    return len(agent_files) >= 18  # 18 agents implemented

def check_command_files():
    print("\n=== 5. Command Files Validation ===")
    cmd_dir = '/workspace/command'
    if not os.path.exists(cmd_dir):
        print("Command directory not found!")
        return False
    
    cmd_files = []
    for root, dirs, files in os.walk(cmd_dir):
        for f in files:
            if f.endswith('.md'):
                cmd_files.append(os.path.join(root, f))
    
    print(f"Total command files: {len(cmd_files)}")
    for f in sorted(cmd_files):
        print(f"  {f}")
    return len(cmd_files) >= 28  # 28 commands implemented

def check_loop_files():
    print("\n=== 6. Loop Files Validation ===")
    loop_dir = '/workspace/loop'
    if not os.path.exists(loop_dir):
        print("Loop directory not found!")
        return False
    
    loop_files = [f for f in os.listdir(loop_dir) if f.endswith('.ts')]
    print(f"Loop core files: {len(loop_files)}")
    for f in sorted(loop_files):
        print(f"  {f}")
    return len(loop_files) >= 7

def check_command_loop():
    print("\n=== 7. Loop Commands Validation ===")
    cmd_loop_dir = '/workspace/command/loop'
    if not os.path.exists(cmd_loop_dir):
        print("Command loop directory not found!")
        return False
    
    files = [f for f in os.listdir(cmd_loop_dir) if f.endswith('.ts')]
    print(f"Loop command files: {len(files)}")
    for f in sorted(files):
        print(f"  {f}")
    return len(files) >= 3

def check_syntax():
    print("\n=== 8. Syntax Checks (TypeScript) ===")
    ts_files = []
    for root, dirs, files in os.walk('/workspace'):
        for f in files:
            if f.endswith('.ts'):
                ts_files.append(os.path.join(root, f))
    
    print(f"TypeScript files to check: {len(ts_files)}")
    
    # Use tsc --noEmit for syntax checking
    try:
        # Check if tsc is available
        result = subprocess.run(["which", "tsc"], capture_output=True, text=True)
        if result.returncode != 0:
            print("  TypeScript syntax check: SKIP (tsc not found)")
            return True
        
        result = subprocess.run(["tsc", "--noEmit", "--skipLibCheck"], 
                              capture_output=True, text=True, timeout=120, cwd="/workspace")
        if result.returncode == 0:
            print("  TypeScript syntax check: PASS")
            return True
        else:
            print(f"  TypeScript syntax check: FAIL")
            print(result.stderr[:1000])
            return False
    except FileNotFoundError:
        print("  TypeScript syntax check: SKIP (tsc not found)")
        return True
    except Exception as e:
        print(f"  TypeScript syntax check: FAIL ({e})")
        return False

def run_setup_dry_run():
    print("\n=== 9. Setup Script Dry Run ===")
    try:
        result = subprocess.run([
            "/workspace/scripts/setup-mcp/setup-mcp.sh", 
            "--dry-run", "--all"
        ], capture_output=True, text=True, timeout=60, cwd="/workspace")
        if result.returncode == 0:
            print("Setup script dry-run: OK")
            return True
        else:
            print(f"Setup script dry-run: FAIL")
            print(result.stderr[:500])
            return False
    except Exception as e:
        print(f"Setup script dry-run: FAIL ({e})")
        return False

def main():
    print("=" * 60)
    print("OPENCODE-CONFIG VALIDATION REPORT")
    print("=" * 60)
    
    all_checks = []
    
    all_checks.append(("Prerequisites", check_prerequisites()))
    all_checks.append(("JSONC Validation", run_validation()))
    all_checks.append(("Agent Files", check_agent_files()))
    all_checks.append(("Command Files", check_command_files()))
    all_checks.append(("Loop Files", check_loop_files()))
    all_checks.append(("Loop Commands", check_command_loop()))
    all_checks.append(("Syntax Checks (TS)", check_syntax()))
    all_checks.append(("Setup Dry Run", run_setup_dry_run()))
    
    print("\n" + "=" * 60)
    print("VALIDATION SUMMARY")
    print("=" * 60)
    
    all_passed = True
    for name, result in all_checks:
        status = "PASS" if result else "FAIL"
        print(f"  {name}: {status}")
        if not result:
            all_passed = False
    
    print("=" * 60)
    if all_passed:
        print("ALL VALIDATIONS PASSED!")
        return 0
    else:
        print("SOME VALIDATIONS FAILED!")
        return 1

if __name__ == "__main__":
    sys.exit(main())