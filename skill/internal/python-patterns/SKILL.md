# Python Patterns Skill

## Description
Idiomatic Python patterns for typing, async, data validation, and design.

## Triggers
- "python", "pip", "pytest", "asyncio", "pydantic", "fastapi", "django"

## Patterns

### Type System
- **Type Hints Mandatory**: All functions, variables, generics
- **Modern Syntax**: `X | Y` not `Union[X, Y]`, `list[X]` not `List[X]`
- **Protocols**: Structural subtyping with `Protocol`
- **TypedDict**: For dict shapes, prefer `pydantic` for validation
- **Generics**: `TypeVar`, `Generic[T]` for reusable code
- **`pyright`/`mypy`**: Strict mode, no `any` without `# type: ignore`

### Async & Concurrency
- **`async`/`await`**: Native syntax, prefer over callbacks
- **`asyncio`/`anyio`**: `anyio` for framework-agnostic
- **Structured Concurrency**: `asyncio.TaskGroup` (3.11+) or `anyio.create_task_group()`
- **Don't Block Event Loop**: `run_in_executor` for CPU-bound
- **Async Context Managers**: `async with` for resources
- **Backpressure**: `asyncio.Semaphore`, bounded queues

### Data Validation
- **Pydantic Models**: `BaseModel` for all external data
- **Settings**: `pydantic-settings.BaseSettings` for config
- **Validation Modes**: `model_validator` for complex rules
- **Serialization**: `model_dump()`, `model_dump_json()`
- **Never Trust Input**: Validate at boundaries (HTTP, DB, files)

### Project Structure
- **`src/` Layout**: `src/pkg_name/` for importable package
- **`pyproject.toml`**: Single config for build, tools, deps
- **`uv` for Package Mgmt**: 10-100x faster than pip
- **Virtual Env**: `.venv/` in repo, or `uv venv`
- **Lockfiles**: `uv.lock` committed

### Testing
- **Pytest**: Not `unittest`, fixtures, parametrize
- **Fixtures**: `conftest.py` for shared, scoped fixtures
- **Parametrize**: `@pytest.mark.parametrize` for table-driven
- **Mocking**: `unittest.mock.patch` or `pytest-mock`
- **Async Tests**: `pytest-asyncio`, `@pytest.mark.asyncio`
- **Coverage**: `--cov=pkg --cov-report=term-missing`

### Common Idioms
- **Dataclasses**: `@dataclass` for data containers
- **Context Managers**: `@contextmanager` or `__enter__`/`__exit__`
- **Pathlib**: `Path` objects, not string paths
- **F-Strings**: `f"{var}"` for formatting
- **Walrus Operator**: `:=` for inline assignment (3.8+)
- **Pattern Matching**: `match`/`case` (3.10+) for complex conditions
