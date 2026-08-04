create extension if not exists "pgcrypto";

create type public.group_role as enum (
  'admin',
  'member'
);

create type public.entry_type as enum (
  'cash_in',
  'cash_out'
);

create type public.category_entry_type as enum (
  'cash_in',
  'cash_out',
  'both'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  full_name text not null,

  avatar_url text,

  contact_no numeric(10) not null,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);

alter table public.profiles
alter column contact_no
type varchar(10)
using contact_no::text;

alter table public.profiles
add constraint profiles_contact_no_india_valid
check (
  contact_no ~ '^[6-9][0-9]{9}$'
);

create table public.cash_book_groups (
  id uuid primary key default gen_random_uuid(),

  name text not null,

  description text,

  currency_code varchar(3) not null default 'INR',

  opening_balance numeric(14, 2) not null default 0,

  created_by uuid not null
    references public.profiles(id)
    on delete restrict,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint cash_book_groups_name_not_blank
    check (length(trim(name)) > 0),

  constraint cash_book_groups_opening_balance_valid
    check (opening_balance >= 0)
);

create table public.group_members (
  id uuid primary key default gen_random_uuid(),

  group_id uuid not null
    references public.cash_book_groups(id)
    on delete cascade,

  user_id uuid
    references public.profiles(id)
    on delete set null,

  member_name text not null,

  role public.group_role not null default 'member',

  is_active boolean not null default true,

  joined_at timestamptz not null default now(),

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint group_members_name_not_blank
    check (length(trim(member_name)) > 0)
);

create unique index categories_unique_name_per_group
on public.categories(
  group_id,
  lower(name)
);

create table public.payment_modes (
  id uuid primary key default gen_random_uuid(),

  group_id uuid not null
    references public.cash_book_groups(id)
    on delete cascade,

  name text not null,

  applicable_entry_type public.category_entry_type
    not null
    default 'both',

  is_default boolean not null default false,

  is_active boolean not null default true,

  created_by uuid
    references public.profiles(id)
    on delete set null,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint payment_modes_name_not_blank
    check (length(trim(name)) > 0)
);

create unique index payment_modes_unique_name_per_group
on public.payment_modes(
  group_id,
  lower(name)
);

-- Create the transactions table

create table public.transactions (
  id uuid primary key default gen_random_uuid(),

  group_id uuid not null
    references public.cash_book_groups(id)
    on delete cascade,

  entry_type public.entry_type not null,

  amount numeric(14, 2) not null,

  transaction_date date not null
    default current_date,

  member_id uuid not null
    references public.group_members(id)
    on delete restrict,

  category_id uuid not null
    references public.categories(id)
    on delete restrict,

  payment_mode_id uuid not null
    references public.payment_modes(id)
    on delete restrict,

  notes text,

  receipt_path text,

  created_by uuid
    references public.profiles(id)
    on delete set null,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  deleted_at timestamptz,

  constraint transactions_amount_positive
    check (amount > 0)
);

alter table public.transactions
rename column transaction_date to transaction_at;

alter table public.transactions
alter column transaction_at
type timestamptz
using transaction_at::timestamp at time zone 'Asia/Kolkata';

alter table public.transactions
alter column transaction_at
set default now();

-- These indexes will help with:

-- Date filtering
-- Member filtering
-- Category filtering
-- Payment mode filtering
-- Transaction history
-- Active transaction queries

create index transactions_group_id_index
on public.transactions(group_id);

create index transactions_transaction_at_index
on public.transactions(transaction_at desc);

create index transactions_group_transaction_at_index
on public.transactions(
  group_id,
  transaction_at desc,
  created_at desc
);

create index transactions_member_id_index
on public.transactions(member_id);

create index transactions_category_id_index
on public.transactions(category_id);

create index transactions_payment_mode_id_index
on public.transactions(payment_mode_id);

create index transactions_active_index
on public.transactions(group_id)
where deleted_at is null;


-- This function automatically updates: updated_at whenever a record changes

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();

  return new;
end;
$$;

-- Add update triggers

create trigger profiles_set_updated_at
before update
on public.profiles
for each row
execute function public.set_updated_at();


create trigger cash_book_groups_set_updated_at
before update
on public.cash_book_groups
for each row
execute function public.set_updated_at();


create trigger group_members_set_updated_at
before update
on public.group_members
for each row
execute function public.set_updated_at();


create trigger categories_set_updated_at
before update
on public.categories
for each row
execute function public.set_updated_at();


create trigger payment_modes_set_updated_at
before update
on public.payment_modes
for each row
execute function public.set_updated_at();


create trigger transactions_set_updated_at
before update
on public.transactions
for each row
execute function public.set_updated_at();
