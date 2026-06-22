# Go Patterns Skill

## Description
Idiomatic Go patterns for error handling, concurrency, testing, and design.

## Triggers
- "go", "golang", "goroutine", "channel", "interface", "error"

## Patterns

### Error Handling
- **Always Check**: `if err != nil { return fmt.Errorf("context: %w", err) }`
- **Wrap with Context**: `fmt.Errorf("operation failed: %w", err)`
- **Sentinel Errors**: `var ErrNotFound = errors.New("not found")` for `errors.Is()`
- **Error Types**: Custom types implementing `error` for structured handling
- **Don't Panic**: Return errors, reserve panic for unrecoverable

### Concurrency
- **Channels for Communication**: "Don't communicate by sharing memory"
- **Select for Multiplexing**: Handle multiple channels
- **Context for Cancellation**: Pass `ctx` through all blocking ops
- **ErrGroup for Fan-Out**: `errgroup.Group` for parallel with error handling
- **Worker Pools**: Bounded concurrency with semaphore channel
- **No Goroutine Leaks**: Every goroutine has clear exit condition

### Interfaces
- **Small Interfaces**: One method is ideal (`io.Reader`, `io.Writer`)
- **Accept Interfaces, Return Structs**: Flexibility for callers
- **Interface in Consumer Package**: Not producer (avoids cycles)
- **Implicit Implementation**: No `implements` keyword needed

### Project Structure
- **Package by Feature**: Not by layer (no `controllers/`, `models/`)
- **Internal Packages**: `internal/` for private code
- **Cmd for Entry Points**: `cmd/app/main.go` for binaries
- **Go Modules**: `go.mod` at repo root

### Testing
- **Table-Driven Tests**: `tests := []struct{...}{...}` with `t.Run()`
- **Test Fixtures**: `testdata/` directory, ignored by build
- **Build Tags**: `//go:build integration` for separation
- **Race Detector**: Always `go test -race`
- **Coverage**: `go test -coverprofile=coverage.out`

### Common Idioms
- **Constructor Functions**: `NewType() *Type` for initialization
- **Functional Options**: `func Option(func(*Type))` for config
- **Error Groups**: `errgroup.WithContext(ctx)` for parallel work
- **Defer for Cleanup**: `defer file.Close()` immediately after open
