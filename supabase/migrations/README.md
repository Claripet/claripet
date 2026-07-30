# Supabase Migrations

Run these in your Supabase project's **SQL Editor** in order:

1. `001_schema.sql` — Tables, enums, indexes
2. `002_rls.sql` — Row-Level Security policies + profile auto-create trigger
3. `003_functions.sql` — Atomic order creation, stock restore, updated_at triggers
4. `004_seed.sql` — Seed categories, products, sizes, and articles

## After seeding: create an admin

1. Supabase Dashboard → **Authentication → Users → Add user**
2. Copy the user's UUID
3. Run in SQL Editor:

```sql
UPDATE profiles SET role = 'admin' WHERE id = '<paste-uuid-here>';
```

See `../../BACKEND_SETUP.md` for the full guide.
