# Supabase setup notes

The migration in `migrations/` is a starter schema and conservative baseline, not a complete production authorization implementation. It enables RLS on all application tables and intentionally omits client write policies for catalogue administration, role assignment, lectures, and moderation. Add narrow server-side actions/RPCs and test all policies before connecting real accounts.

To apply in a development Supabase project, you can paste the migration into the Supabase SQL Editor. For repeatable CLI workflows, install the Supabase CLI, link your project, and use the migration commands from the official Supabase documentation.

The current frontend is demo-mode UI. It does not query these tables yet, and its sample resource uploads are in-memory only.
