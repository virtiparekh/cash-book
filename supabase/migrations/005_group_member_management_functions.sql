-- This step will securely support:

-- Admin adds a family member
-- Admin promotes a member to admin
-- Admin demotes an admin to member
-- Multiple admins are allowed
-- Original group creator cannot be removed
-- Original group creator cannot be demoted
-- Last active admin cannot be removed
-- Last active admin cannot be demoted
-- Members cannot promote themselves
-- Members cannot manage other members


/*
  Returns true when the given group member is
  the original creator of the cash book group.
*/
create or replace function public.is_group_creator(
  p_group_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.cash_book_groups
    where id = p_group_id
      and created_by = p_user_id
  );
$$;


/*
  Allows an active group admin to add a family member.
*/
create or replace function public.add_group_member(
  p_group_id uuid,
  p_member_name text,
  p_user_id uuid default null
)
returns public.group_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member public.group_members;
begin

  if auth.uid() is null then
    raise exception
      'You must be logged in';
  end if;

  if not public.is_group_admin(p_group_id) then
    raise exception
      'Only a group admin can add members';
  end if;

  if p_member_name is null
     or length(trim(p_member_name)) = 0 then

    raise exception
      'Member name is required';
  end if;

  if p_user_id is not null
     and exists (
       select 1
       from public.group_members
       where group_id = p_group_id
         and user_id = p_user_id
     ) then

    raise exception
      'This user is already a member of the cash book group';
  end if;

  insert into public.group_members (
    group_id,
    user_id,
    member_name,
    role,
    is_active
  )
  values (
    p_group_id,
    p_user_id,
    trim(p_member_name),
    'member',
    true
  )
  returning *
  into v_member;

  return v_member;

end;
$$;

-- Add role changr function

/*
  Allows an admin to promote a member to admin
  or demote an admin to member.

  Safety rules:
  - Only an admin can change roles.
  - The original creator cannot be demoted.
  - The last active admin cannot be demoted.
  - The target member must belong to the group.
*/
create or replace function public.change_group_member_role(
  p_group_id uuid,
  p_member_id uuid,
  p_new_role public.group_role
)
returns public.group_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target_member public.group_members;
  v_active_admin_count integer;
begin

  -- Require a logged-in user.
  if auth.uid() is null then
    raise exception
      'You must be logged in';
  end if;


  -- Only an admin can change member roles.
  if not public.is_group_admin(p_group_id) then
    raise exception
      'Only a group admin can change member roles';
  end if;


  -- The new role must be valid.
  if p_new_role not in (
    'admin'::public.group_role,
    'member'::public.group_role
  ) then

    raise exception
      'Invalid group role';
  end if;


  /*
    Get and lock the target member row.

    FOR UPDATE helps prevent two role changes
    from being processed at the same time.
  */
  select *
  into v_target_member
  from public.group_members
  where id = p_member_id
    and group_id = p_group_id
  for update;


  if not found then
    raise exception
      'Group member was not found';
  end if;


  -- Do not change the role if it is already the same.
  if v_target_member.role = p_new_role then
    return v_target_member;
  end if;


  /*
    The original creator must remain an admin.
  */
  if p_new_role = 'member'::public.group_role
     and public.is_group_creator(
       p_group_id,
       v_target_member.user_id
     ) then

    raise exception
      'The original group creator cannot be demoted';
  end if;


  /*
    Before demoting an active admin,
    make sure another active admin exists.
  */
  if p_new_role = 'member'::public.group_role
     and v_target_member.role = 'admin'::public.group_role
     and v_target_member.is_active = true then

    select count(*)
    into v_active_admin_count
    from public.group_members
    where group_id = p_group_id
      and role = 'admin'::public.group_role
      and is_active = true;


    if v_active_admin_count <= 1 then
      raise exception
        'The last active admin cannot be demoted';
    end if;

  end if;


  -- Update the member role.
  update public.group_members
  set role = p_new_role
  where id = p_member_id
    and group_id = p_group_id
  returning *
  into v_target_member;


  return v_target_member;

end;
$$;

-- Add the secure member-removal function

/*
  Soft-removes a group member.

  Safety rules:
  - Only an admin can remove a member.
  - The original creator cannot be removed.
  - The last active admin cannot be removed.
  - Historical transactions remain intact.
*/
create or replace function public.remove_group_member(
  p_group_id uuid,
  p_member_id uuid
)
returns public.group_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target_member public.group_members;
  v_active_admin_count integer;
begin

  -- Require a logged-in user.
  if auth.uid() is null then
    raise exception
      'You must be logged in';
  end if;


  -- Only an admin can remove members.
  if not public.is_group_admin(p_group_id) then
    raise exception
      'Only a group admin can remove members';
  end if;


  -- Get and lock the member.
  select *
  into v_target_member
  from public.group_members
  where id = p_member_id
    and group_id = p_group_id
  for update;


  if not found then
    raise exception
      'Group member was not found';
  end if;


  -- Do not remove an already inactive member.
  if v_target_member.is_active = false then
    raise exception
      'This member is already inactive';
  end if;


  /*
    The original group creator cannot be removed.
  */
  if public.is_group_creator(
    p_group_id,
    v_target_member.user_id
  ) then

    raise exception
      'The original group creator cannot be removed';
  end if;


  /*
    If the target is an admin,
    make sure at least one other active admin remains.
  */
  if v_target_member.role = 'admin'::public.group_role then

    select count(*)
    into v_active_admin_count
    from public.group_members
    where group_id = p_group_id
      and role = 'admin'::public.group_role
      and is_active = true;


    if v_active_admin_count <= 1 then
      raise exception
        'The last active admin cannot be removed';
    end if;

  end if;


  /*
    Soft-remove the member.

    The row remains in the database,
    but the member is no longer active.
  */
  update public.group_members
  set is_active = false
  where id = p_member_id
    and group_id = p_group_id
  returning *
  into v_target_member;


  return v_target_member;

end;
$$;

-- Add a member name update function

/*
  Allows an admin to update a member name.
*/
create or replace function public.update_group_member_name(
  p_group_id uuid,
  p_member_id uuid,
  p_member_name text
)
returns public.group_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member public.group_members;
begin

  if auth.uid() is null then
    raise exception
      'You must be logged in';
  end if;


  if not public.is_group_admin(p_group_id) then
    raise exception
      'Only a group admin can edit member details';
  end if;


  if p_member_name is null
     or length(trim(p_member_name)) = 0 then

    raise exception
      'Member name is required';
  end if;


  update public.group_members
  set member_name = trim(p_member_name)
  where id = p_member_id
    and group_id = p_group_id
  returning *
  into v_member;


  if not found then
    raise exception
      'Group member was not found';
  end if;


  return v_member;

end;
$$;

revoke all
on function public.is_group_creator(uuid, uuid)
from public;

revoke all
on function public.add_group_member(uuid, text, uuid)
from public;

revoke all
on function public.change_group_member_role(
  uuid,
  uuid,
  public.group_role
)
from public;

revoke all
on function public.remove_group_member(uuid, uuid)
from public;

revoke all
on function public.update_group_member_name(
  uuid,
  uuid,
  text
)
from public;


grant execute
on function public.add_group_member(
  uuid,
  text,
  uuid
)
to authenticated;

grant execute
on function public.change_group_member_role(
  uuid,
  uuid,
  public.group_role
)
to authenticated;

grant execute
on function public.remove_group_member(
  uuid,
  uuid
)
to authenticated;

grant execute
on function public.update_group_member_name(
  uuid,
  uuid,
  text
)
to authenticated;

-- verify the functions

select
  routine_name,
  routine_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
    'is_group_creator',
    'add_group_member',
    'change_group_member_role',
    'remove_group_member',
    'update_group_member_name'
  )
order by routine_name;