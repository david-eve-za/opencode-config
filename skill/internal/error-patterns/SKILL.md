# Error Patterns Skill

## Description
Common error patterns, symptoms, causes, and fixes across languages.

## Triggers
- "error", "bug", "crash", "panic", "exception", "failure"

## Patterns

### Go
#### Goroutine Leak
- **Symptom**: Program hangs, memory grows, `go tool pprof` shows many goroutines
- **Cause**: Goroutine blocks on channel send/receive, no exit path
- **Fix**: Add context cancellation, use `errgroup`, close channels properly

#### Race Condition
- **Symptom**: `go test -race` reports data race, intermittent failures
- **Cause**: Concurrent read/write to same memory without synchronization
- **Fix**: Use mutex, channels, atomic, or redesign to avoid sharing

#### Unhandled Panic
- **Symptom**: Program crashes with panic stack trace
- **Cause**: `panic()` called, index out of bounds, type assertion failure
- **Fix**: Use `recover()` in deferred function, validate inputs, check bounds

#### Unchecked Error
- **Symptom**: Silent failure, unexpected behavior
- **Cause**: `_ = funcThatReturnsError()` or ignoring returned error
- **Fix**: Always check errors, use `if err != nil { return err }`

### Rust
#### Borrow Checker Error
- **Symptom**: Compile error: "cannot borrow as mutable/immutable"
- **Cause**: Violating ownership/borrowing rules
- **Fix**: Restructure ownership, use `RefCell`/`Mutex`, adjust lifetimes

#### Unwrap Panic
- **Symptom**: Runtime panic: "called `Option::unwrap()` on a `None` value"
- **Cause**: Calling `.unwrap()` on `None` or `Err`
- **Fix**: Use `?`, `.expect("context")`, or pattern matching

#### Lifetime Error
- **Symptom**: Compile error: "lifetime may not live long enough"
- **Cause**: Reference outlives data it points to
- **Fix**: Adjust lifetimes, use owned data, restructure

### Python
#### Mutable Default Argument
- **Symptom**: Shared state across function calls
- **Cause**: `def f(items=[])` — list created once at definition
- **Fix**: `def f(items=None): items = items or []`

#### Bare Except
- **Symptom**: Catches `SystemExit`, `KeyboardInterrupt`, hides bugs
- **Cause**: `except:` or `except BaseException:`
- **Fix**: `except Exception:` or specific exception types

#### Import Error
- **Symptom**: `ModuleNotFoundError` or `ImportError`
- **Cause**: Missing dependency, circular import, wrong path
- **Fix**: Add to requirements, restructure imports, check PYTHONPATH

### TypeScript
#### Type Narrowing Failed
- **Symptom**: TypeScript error on property access after check
- **Cause**: Type guard not recognized, union not narrowed
- **Fix**: Use proper type guards, `in` operator, discriminated unions

#### Null/Undefined Access
- **Symptom**: Runtime error: "Cannot read property of null/undefined"
- **Cause**: Not checking for null/undefined before access
- **Fix**: Optional chaining `?.`, nullish coalescing `??`, explicit checks

#### Async/Await Issue
- **Symptom**: Unhandled promise rejection, missing await
- **Cause**: Forgetting `await`, not handling rejection
- **Fix**: Always `await` promises, `.catch()` for unhandled
