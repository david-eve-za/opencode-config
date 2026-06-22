---
name: test
description: "Generate comprehensive tests — auto-detects test framework and language"
---

## Detection Matrix

| File Found | Framework | Agent |
|---|---|---|
| vitest.config.* | Vitest | test-writer (TS) |
| jest.config.* | Jest | test-writer (TS/JS) |
| *_test.go | go test | backend/go |
| Cargo.toml + tests/ | cargo test | backend/rust |
| pytest.ini / conftest.py | pytest | backend/python |
| pom.xml + *Test.java | JUnit | (build) |
| *.csproj + *Tests.csproj | xUnit/NUnit | (build) |

## Flow

1. Detect project language and test framework
2. Search Engram: `mem_search(query="testing patterns [language] [framework]")`
3. Spawn appropriate agent with test generation instructions
4. Run tests to verify they pass
5. Save learnings to Engram
