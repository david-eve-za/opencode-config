# Database Patterns Skill

## Description
SQL and NoSQL patterns for schema design, queries, migrations, and optimization.

## Triggers
- "database", "sql", "query", "migration", "schema", "index", "orm"

## Patterns

### Schema Design
- **Normalize First**: 3NF for transactional data
- **Denormalize Deliberately**: Read-heavy, add computed columns
- **Constraints in DB**: FK, CHECK, UNIQUE, NOT NULL
- **UUID vs Integer PK**: UUID for distributed, Integer for performance
- **Timestamps**: `created_at`, `updated_at` on all tables
- **Soft Deletes**: `deleted_at` column, filter in queries
- **Audit Logs**: Separate table for sensitive changes

### Indexing
- **Index for Queries**: Not "just in case"
- **Composite Indexes**: Order matches query (equality first, then range)
- **Covering Indexes**: Include columns to avoid table lookup
- **Partial Indexes**: `WHERE` clause for common filters
- **Monitor Usage**: `pg_stat_user_indexes`, remove unused

### Query Optimization
- **EXPLAIN ANALYZE**: Understand query plan
- **Avoid N+1**: Eager load, batch, or DataLoader
- **Select Specific Columns**: Not `SELECT *`
- **Limit Result Sets**: Pagination, not unbounded
- **Use CTEs Wisely**: Can be optimization fence
- **Prepared Statements**: Plan reuse, prevent injection

### Migrations
- **Forward Only**: No down migrations in production
- **Idempotent**: Safe to run multiple times
- **Small Batches**: One logical change per migration
- **Test on Copy**: Run on production snapshot first
- **Backfill Strategy**: For new NOT NULL columns
- **Lock Awareness**: `LOCK_TIMEOUT`, avoid long locks

### NoSQL
### Universal
- **Schema Validation**: Application-level or DB-level (JSON schema)
- **Access Patterns First**: Design for queries, not normalization
- **Consistency Trade-offs**: Eventual vs strong, per use case
- **Partitioning/Sharding**: By access pattern, not random
