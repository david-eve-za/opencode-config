---
name: swarm
description: "Initialize and run a swarm for complex multi-file tasks"
---

## Usage

```
/swarm "task description"
```

## Flow

1. Analyze task complexity
2. If 3+ files/features → spawn swarm planner
3. Planner decomposes into subtasks
4. Workers execute in parallel
5. Coordinator collects and integrates
6. Save outcome to Engram

## Swarm Commands

- `/swarm` — Initialize swarm
- `/swarm-status` — Check swarm progress
- `/swarm-collect` — Collect results
- `/parallel` — Run independent tasks in parallel
