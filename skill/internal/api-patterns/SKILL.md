# API Patterns Skill

## Description
REST, GraphQL, gRPC, and general API design patterns.

## Triggers
- "api", "rest", "graphql", "grpc", "endpoint", "handler"

## Patterns

### REST
- **Resource-Oriented**: URLs represent resources, not actions
- **HTTP Methods**: GET (read), POST (create), PUT/PATCH (update), DELETE (remove)
- **Status Codes**: 200/201/204 success, 400 client error, 401/403 auth, 404 not found, 500 server error
- **Versioning**: URL path `/v1/` or header `Accept: application/vnd.api+json;version=1`
- **Pagination**: Cursor-based (`after`/`before`) or offset/limit
- **Filtering/Sorting**: Query params `?filter=...&sort=...`
- **Error Format**: Consistent `{ error: { code, message, details } }`

### GraphQL
- **Schema-First**: Define schema, generate types
- **Queries**: Read-only, cacheable
- **Mutations**: Write operations, explicit names
- **Subscriptions**: Real-time updates
- **N+1 Prevention**: DataLoader for batching
- **Complexity Analysis**: Limit query depth/cost

### gRPC
- **Proto-First**: Define `.proto`, generate code
- **Unary**: Simple request/response
- **Streaming**: Server, client, or bidirectional
- **Metadata**: Headers for auth, tracing
- **Deadlines**: Timeout propagation
- **Error Codes**: Standard gRPC codes

### Universal
- **Idempotency Keys**: For safe retries on POST
- **Request Validation**: At boundary, fail fast
- **Rate Limiting**: Token bucket, sliding window
- **Observability**: Logs, metrics, traces
- **Backwards Compatibility**: Add fields, never remove
- **Documentation**: OpenAPI/Swagger, kept in sync
