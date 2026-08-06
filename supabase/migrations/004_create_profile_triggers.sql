-- create automatic profile creation
-- This means when a user signs up:

-- Supabase Auth user created
--               ↓
-- Profile automatically created

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    avatar_url,
    contact_no,
    created_at,
    updated_at
  )
  values (
    new.id,
    coalesce(
      nullif(
        trim(
          new.raw_user_meta_data ->> 'full_name'
        ),
        ''
      ),
      split_part(
        coalesce(new.email, ''),
        '@',
        1
      )
    ),
    null,
    nullif(
      trim(
        new.raw_user_meta_data ->> 'contact_no'
      ),
      ''
    ),
    now(),
    now()
  );

  return new;
end;
$$;


drop trigger if exists on_auth_user_created
on auth.users;

create trigger on_auth_user_created
after insert
on auth.users
for each row
execute function public.handle_new_user();

-- Verify the triggers

select
  trigger_name,
  event_object_table
from information_schema.triggers
where trigger_schema = 'auth'
  and trigger_name = 'on_auth_user_created';