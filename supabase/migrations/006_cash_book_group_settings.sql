/* =========================================================
   Cash Book Group Settings
   Migration: 006_cash_book_group_settings.sql
========================================================= */


/* =========================================================
   1. Members can leave their own cash book
========================================================= */

create policy "Members can leave their own groups"
on public.group_members
for delete
to authenticated
using (
  user_id = auth.uid()
);


/* =========================================================
   2. Prevent the group creator/owner from leaving
========================================================= */

create or replace function public.prevent_owner_leaving_group()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

  /*
   * The creator of a Cash Book is represented by
   * cash_book_groups.created_by.
   *
   * Do not allow that user to remove their own membership.
   */
  if exists (
    select 1
    from public.cash_book_groups cbg
    where cbg.id = old.group_id
      and cbg.created_by = old.user_id
  ) then

    raise exception
      'The cash book owner cannot leave the group. Transfer ownership or delete the cash book instead.';

  end if;

  return old;

end;
$$;


/* =========================================================
   3. Trigger for owner protection
========================================================= */

drop trigger if exists prevent_owner_leaving_group_trigger
on public.group_members;

create trigger prevent_owner_leaving_group_trigger
before delete
on public.group_members
for each row
execute function public.prevent_owner_leaving_group();