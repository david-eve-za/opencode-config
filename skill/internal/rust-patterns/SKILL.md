# Rust Patterns Skill

## Description
Idiomatic Rust patterns for ownership, error handling, async, and design.

## Triggers
- "rust", "cargo", "borrow", "lifetime", "trait", "async", "tokio"

## Patterns

### Ownership & Borrowing
- **Single Owner**: Each value has one owner
- **References Borrow**: `&T` (immutable) or `&mut T` (mutable)
- **No Aliasing + Mutation**: Either many `&T` or one `&mut T`
- **Lifetimes**: Compiler tracks reference validity
- **Move Semantics**: Assignment moves, use `clone()` for deep copy

### Error Handling
- **Result<T, E> for Recoverable**: Not `Option` for errors
- **`thiserror` for Libraries**: Derive `Error` trait
- **`anyhow` for Applications**: Context with `.context("msg")`
- **`?` Operator**: Propagate errors automatically
- **No `unwrap()` in Prod**: Use `expect("context")` or pattern match
- **Error Chains**: `.source()` for underlying causes

### Traits & Generics
- **Trait Bounds**: `T: Trait` for generic constraints
- **Associated Types**: `type Item` for output types
- **Generic Over Trait Objects**: Prefer `impl Trait` or generics
- **Sealed Traits**: Prevent external implementations
- **Extension Traits**: Add methods to external types

### Async & Concurrency
- **Tokio Runtime**: Standard for async
- **`async`/`await`**: Syntactic sugar for futures
- **Structured Concurrency**: `tokio::task::spawn`, `join!`, `select!`
- **Don't Mix Sync/Async**: Use `spawn_blocking` for CPU work
- **Channels**: `tokio::sync::mpsc`/`oneshot`/`broadcast`
- **Backpressure**: Bounded channels, `Semaphore` for limits

### Project Structure
- **Cargo Workspace**: Multiple crates in one repo
- **Lib + Bin**: `src/lib.rs` + `src/main.rs` or `src/bin/`
- **Integration Tests**: `tests/` directory
- **Examples**: `examples/` for usage demos
- **Features**: Optional dependencies with `cfg(feature = "...")`

### Testing
- **Unit Tests**: `#[cfg(test)] mod tests` in same file
- **Integration Tests**: `tests/*.rs` — separate crate
- **Doc Tests**: `/// ```rust ... ```` in documentation
- **Property-Based**: `proptest` for invariants
- **Benchmarks**: `criterion` for performance

### Common Idioms
- **Builder Pattern**: `TypeBuilder` with `&mut self` methods
- **Newtype Pattern**: `struct Wrapper(InnerType)` for type safety
- **TypeState Pattern**: Encode state in type system
- **RAII**: `Drop` trait for automatic cleanup
- **Zero-Cost Abstractions**: Generics monomorphized, no runtime cost
