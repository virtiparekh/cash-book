-- Enable Row-Level Security

alter table public.profiles
enable row level security;

alter table public.cash_book_groups
enable row level security;

alter table public.group_members
enable row level security;

alter table public.categories
enable row level security;

alter table public.payment_modes
enable row level security;

alter table public.transactions
enable row level security;

-- Create a helper function for group membership (Is the currently logged-in user an active member of this group?)

create or replace function public.is_group_member(
  target_group_id uuid
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.group_members
    where group_id = target_group_id
      and user_id = (select auth.uid())
      and is_active = true
  );
$$;

-- Create a helper function for admin access (Is the current user an active admin of this group?)

create or replace function public.is_group_admin(
  target_group_id uuid
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.group_members
    where group_id = target_group_id
      and user_id = (select auth.uid())
      and role = 'admin'
      and is_active = true
  );
$$;

-- Add Profiles Policies

create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
);


create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check (
  id = (select auth.uid())
);


create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (
  id = (select auth.uid())
)
with check (
  id = (select auth.uid())
);

-- Add cashbook group policies

create policy "Members can view their groups"
on public.cash_book_groups
for select
to authenticated
using (
  public.is_group_member(id)
);


create policy "Authenticated users can create groups"
on public.cash_book_groups
for insert
to authenticated
with check (
  created_by = (select auth.uid())
);


create policy "Admins can update their groups"
on public.cash_book_groups
for update
to authenticated
using (
  public.is_group_admin(id)
)
with check (
  public.is_group_admin(id)
);


create policy "Admins can delete their groups"
on public.cash_book_groups
for delete
to authenticated
using (
  public.is_group_admin(id)
);

-- Add group member policies

create policy "Members can view group members"
on public.group_members
for select
to authenticated
using (
  public.is_group_member(group_id)
);


create policy "Admins can add group members"
on public.group_members
for insert
to authenticated
with check (
  public.is_group_admin(group_id)
);

-- we dropped this policies. will create safe function 

-- create policy "Admins can update group members"
-- on public.group_members
-- for update
-- to authenticated
-- using (
--   public.is_group_admin(group_id)
-- )
-- with check (
--   public.is_group_admin(group_id)
-- );


-- create policy "Admins can remove group members"
-- on public.group_members
-- for delete
-- to authenticated
-- using (
--   public.is_group_admin(group_id)
-- );

-- Add Category Policies

create policy "Members can view categories"
on public.categories
for select
to authenticated
using (
  public.is_group_member(group_id)
);


create policy "Members can add categories"
on public.categories
for insert
to authenticated
with check (
  public.is_group_member(group_id)
  and (
    created_by is null
    or created_by = (select auth.uid())
  )
);

create policy "Members can update permitted categories"
on public.categories
for update
to authenticated
using (
  public.is_group_admin(group_id)
  or created_by = (select auth.uid())
)
with check (
  public.is_group_member(group_id)
);

-- Add Payment Policies

create policy "Members can view payment modes"
on public.payment_modes
for select
to authenticated
using (
  public.is_group_member(group_id)
);


create policy "Members can add custom payment modes"
on public.payment_modes
for insert
to authenticated
with check (
  public.is_group_member(group_id)
  and created_by = (select auth.uid())
);


create policy "Members can update own payment modes"
on public.payment_modes
for update
to authenticated
using (
  public.is_group_admin(group_id)
  or created_by = (select auth.uid())
)
with check (
  public.is_group_member(group_id)
);

-- Add Traction Policies

create policy "Members can view group transactions"
on public.transactions
for select
to authenticated
using (
  public.is_group_member(group_id)
);


create policy "Members can add transactions"
on public.transactions
for insert
to authenticated
with check (
  public.is_group_member(group_id)
  and created_by = (select auth.uid())
);


create policy "Members can update their transactions"
on public.transactions
for update
to authenticated
using (
  created_by = (select auth.uid())
  or public.is_group_admin(group_id)
)
with check (
  public.is_group_member(group_id)
);


create policy "Admins can delete transactions"
on public.transactions
for delete
to authenticated
using (
  public.is_group_admin(group_id)
);