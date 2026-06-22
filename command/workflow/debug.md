---
name: debug
description: "Debug universal — searches Engram first, then uses language-specific debugging"
---

## Flow

1. Search Engram: `mem_search(query="error patterns [error message keywords]")`
2. If found → `mem_get_observation()` for full content
3. If not found → Search CASS for historical solutions
4. Parse error → Identify language and error type
5. Language-specific debugging:

### Go
- Check `go vet` output
- Check race detector output
- Trace goroutine leaks
- Check error wrapping chain

### Rust
- Check `cargo check` output
- Check borrow checker messages
- Check lifetime annotations
- Check trait bounds

### Python
- Check traceback
- Check type hints vs runtime types
- Check async/await issues
- Check import errors

### TypeScript
- Check `tsc` output
- Check type narrowing
- Check async/await issues
- Check null/undefined checks

6. Fix the error
7. Verify fix works
8. Save new pattern to Engram: `mem_save(type="bugfix", topic_key="patterns/error/[error-type]")`
