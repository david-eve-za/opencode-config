# Testing Patterns Skill

## Description
Comprehensive testing patterns for multiple languages and frameworks.

## Triggers
- "test", "testing", "vitest", "pytest", "go test", "cargo test", "jest"

## Patterns

### TypeScript/JavaScript (Vitest/Jest)
- Unit tests with `describe`/`it` blocks
- Mock external dependencies with `vi.mock`/`jest.mock`
- Test async code with `await` and `act()`
- Use `beforeEach`/`afterEach` for setup/teardown
- Snapshot testing for UI components
- Property-based testing with `fast-check`

### Go
- Table-driven tests with `t.Run()` subtests
- Use `testing.T` methods: `Errorf`, `Fatalf`, `Helper()`
- Test fixtures in `testdata/` directories
- Benchmark tests with `testing.B`
- Integration tests with build tags: `//go:build integration`
- Mock interfaces with `testify/mock` or manual mocks

### Rust
- Unit tests in `#[cfg(test)] mod tests`
- Integration tests in `tests/` directory
- Property-based testing with `proptest`
- Benchmarks with `criterion`
- Mock with `mockall` or manual trait implementations
- Use `#[should_panic]` for panic tests

### Python
- Pytest fixtures for setup/teardown
- Parametrize with `@pytest.mark.parametrize`
- Mock with `unittest.mock` or `pytest-mock`
- Async tests with `pytest-asyncio`
- Test coverage with `--cov`
- Hypothesis for property-based testing

### Universal
- AAA pattern: Arrange, Act, Assert
- Test naming: `should_[expected_behavior]_when_[condition]`
- One assertion per test (when practical)
- Fast tests: no I/O, no network, no time
- Deterministic: no random, no time-dependent
