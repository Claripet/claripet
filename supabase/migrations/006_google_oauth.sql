-- ============================================================
-- 006_google_oauth.sql
-- Make the new-user profile trigger work for Google OAuth sign-ups.
-- Google puts the display name in `name` / `full_name` and the avatar
-- in `avatar_url` / `picture` inside raw_user_meta_data.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      ''
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger already exists from 002_rls.sql; the function body is updated above.
