#!/bin/bash
set -e

echo "=== 1. Prerequisites Check ==="
node --version && echo "Node: OK"
npm --version && echo "npm: OK"
docker --version && echo "Docker: OK"
git --version && echo "Git: OK"
/root/.local/bin/uv --version && echo "uv: OK"
/usr/local/lib/node_modules/@opencode-ai/cli/bin/lildax --version && echo "opencode (lildax): OK"

echo ""
echo "=== 2. JSONC Validation (using jsonc-parser) ==="
node -e "
const fs = require('fs');
const content = fs.readFileSync('/workspace/opencode.jsonc', 'utf8');
// Use jsonc-parser if available, otherwise use a simple regex approach
// For now, just validate it parses with a lenient JSON parser
try {
  // Use a simple regex to strip // comments (crude but works for this file)
  let cleaned = content.replace(/\\/\\/.*$/gm, '');
  // Also strip /* */ comments
  cleaned = cleaned.replace(/\\/\\*[\\s\\S]*?\\*\\//g, '');
  const data = JSON.parse(cleaned);
  console.log('opencode.jsonc: VALID JSONC');
  console.log('  Model:', data.model);
  console.log('  Small model:', data.small_model);
  console.log('  Agent overrides:', Object.keys(data.agent || {}).length);
  console.log('  MCP servers:', Object.keys(data.mcp || {}).length);
  console.log('  MCP profiles:', Object.keys(data.mcp_profiles || {}).length);
  console.log('  Model routing providers:', Object.keys(data.model_routing?.providers || {}));
} catch (e) {
  console.log('JSONC Validation FAILED:', e.message);
  process.exit(1);
}
"
echo ""
echo "=== 3. Agent Overrides Validation ==="
python3 << 'PYEOF'
import json, re
with open('/workspace/opencode.jsonc') as f: content = f.read()
# Strip comments using regex
cleaned = re.sub(r'//.*$', '', content, flags=re.MULTILINE)
cleaned = re.sub(r'/\*.*?\*/', '', cleaned, flags=re.DOTALL)
data = json.loads(cleaned)
agents = data.get('agent', {})
print(f'Total agents: {len(agents)}')
for name, cfg in agents.items():
    model = cfg.get('model', 'default')
    temp = cfg.get('temperature', 'N/A')
    tools = cfg.get('tools', {})
    perms = cfg.get('permission', {})
    write_perm = tools.get('write', 'allow')
    perm_keys = list(perms.keys())[:3]
    print(f'  {name}: model={model}, temp={temp}, write={write_perm}, perms_keys={list(perms.keys())[:3]}')
PYEOF