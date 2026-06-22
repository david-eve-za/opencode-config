# Prevention Patterns Skill

## Description
Patterns to prevent common bugs and issues across languages.

## Triggers
- "prevent", "avoid", "best practice", "guard", "validate"

## Patterns

### Universal
- **Guard Clauses**: Return early, reduce nesting
- **Input Validation**: Validate at boundaries, not internally
- **Fail Fast**: Check preconditions, fail immediately
- **Immutability**: Prefer immutable data structures
- **Explicit over Implicit**: No magic, no hidden behavior
- **Single Responsibility**: One reason to change
- **Dependency Injection**: Invert control, enable testing

### TypeScript/JavaScript
- **No `any`**: Use `unknown`, generics, or proper types
- **Strict Null Checks**: Handle `null`/`undefined` explicitly
- **Avoid `console.log`**: Use proper logging
- **No `eval`/`Function`**: Security risk
- **Use `const` by default**: Only `let` when reassignment needed

### Go
- **Error Wrapping**: `fmt.Errorf("context: %w", err)` for chain
- **Check Every Error**: Never `_ = mayErrFunc()`
- **Context for Cancellation**: Always pass `context.Context`
- **No Goroutine Leaks**: Every goroutine has exit path
- **Small Interfaces**: One method is ideal
- **Avoid Global State**: Pass dependencies explicitly

### Rust
- **No Unnecessary `unwrap()`**: Use `?`, `expect()`, or pattern matching
- **No `unsafe` without `// SAFETY:`**: Document invariants
- **Use `Result<T, E>`**: Not `Option` for errors
- **Prefer `&T` over `&mut T`**: Minimize mutability
- **Implement `Error` trait**: For custom error types
- **Use `Clone` sparingly**: Prefer references

### Python
- **No Mutable Defaults**: `def f(x=None): x = x or []`
- **No Bare `except:`**: Use `except Exception:`
- **Type Hints Everywhere**: Functions, variables, generics
- **Use `pathlib`**: Not `os.path` strings
- **Context Managers**: `with` for resources
- **Avoid Global Mutable State**: Use dependency injection

### Infrastructure
- **Infrastructure as Code**: Everything in git
- **Least Privilege**: Minimum permissions
- **Immutable Infrastructure**: Replace, don't modify
- **Secrets in Vault**: Never in code or config
- **Health Checks**: Liveness + readiness probes
- **Resource Limits**: CPU/memory on all containers
