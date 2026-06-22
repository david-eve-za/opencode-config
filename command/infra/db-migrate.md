---
name: db-migrate
description: "Run database migrations — validate, execute, verify"
---

## Detection Matrix

| File Found | Tool | Command |
|---|---|---|
| prisma/schema.prisma | Prisma | `prisma migrate` |
| alembic/ | Alembic | `alembic upgrade head` |
| migrations/ + go | golang-migrate | `migrate up` |
| flyway/ | Flyway | `flyway migrate` |
| db/migrate/ (Rails) | Rails | `rails db:migrate` |

## Safety Rules
- NEVER run on production without explicit approval
- ALWAYS backup before migration
- ALWAYS test on copy first
- ALWAYS validate migration is forward-only

## Flow

1. Detect migration tool
2. Check pending migrations
3. Validate migrations (syntax, idempotency)
4. Run on test database
5. Verify schema matches expected
6. Generate migration report
7. Save to Engram
