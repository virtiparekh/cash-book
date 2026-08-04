-- -- This function will create all of the following in one database transaction:

-- Cash Book Group
--        +
-- Owner as Admin
--        +
-- Default Cash In Categories
--        +
-- Default Cash Out Categories
--        +
-- Default Payment Modes


create or replace function public.create_cash_book_group(
  p_name text,
  p_description text default null,
  p_currency_code varchar(3) default 'INR',
  p_opening_balance numeric default 0,
  p_owner_name text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group_id uuid;
  v_user_id uuid;
  v_owner_name text;
begin
  /*
    Get the currently logged-in user.
    auth.uid() is available when the function
    is called by an authenticated Supabase user.
  */
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception
      'You must be logged in to create a cash book group';
  end if;


  /*
    Validate cash book name.
  */
  if p_name is null
     or length(trim(p_name)) = 0 then

    raise exception
      'Cash book name is required';
  end if;


  /*
    Validate opening balance.
  */
  if coalesce(p_opening_balance, 0) < 0 then

    raise exception
      'Opening balance cannot be negative';
  end if;


  /*
    The owner name entered during setup is preferred.

    If no owner name is provided,
    use the authenticated user's profile name.
  */
  select coalesce(
    nullif(trim(p_owner_name), ''),
    full_name
  )
  into v_owner_name
  from public.profiles
  where id = v_user_id;


  /*
    Stop if an owner name is unavailable.
  */
  if v_owner_name is null
     or length(trim(v_owner_name)) = 0 then

    raise exception
      'Owner name is required';
  end if;


  /*
    Create the cash book group.
  */
  insert into public.cash_book_groups (
    name,
    description,
    currency_code,
    opening_balance,
    created_by
  )
  values (
    trim(p_name),
    nullif(trim(coalesce(p_description, '')), ''),
    upper(
      coalesce(
        nullif(trim(p_currency_code), ''),
        'INR'
      )
    ),
    coalesce(p_opening_balance, 0),
    v_user_id
  )
  returning id
  into v_group_id;


  /*
    Add the group creator as the first admin.
  */
  insert into public.group_members (
    group_id,
    user_id,
    member_name,
    role,
    is_active
  )
  values (
    v_group_id,
    v_user_id,
    v_owner_name,
    'admin',
    true
  );


  /*
    Create default Cash In categories.
  */
  insert into public.categories (
    group_id,
    name,
    entry_type,
    is_default,
    is_active,
    created_by
  )
  values
    (
      v_group_id,
      'Salary',
      'cash_in',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Business Income',
      'cash_in',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Freelance Income',
      'cash_in',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Interest',
      'cash_in',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Rental Income',
      'cash_in',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Refund',
      'cash_in',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Gift Received',
      'cash_in',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Savings',
      'cash_in',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Other',
      'both',
      true,
      true,
      v_user_id
    );


  /*
    Create default Cash Out categories.
  */
  insert into public.categories (
    group_id,
    name,
    entry_type,
    is_default,
    is_active,
    created_by
  )
  values
    (
      v_group_id,
      'Groceries',
      'cash_out',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Food and Dining',
      'cash_out',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Rent',
      'cash_out',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Electricity',
      'cash_out',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Water',
      'cash_out',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Gas',
      'cash_out',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Mobile Recharge',
      'cash_out',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Internet',
      'cash_out',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Transportation',
      'cash_out',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Fuel',
      'cash_out',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Medical',
      'cash_out',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Education',
      'cash_out',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Shopping',
      'cash_out',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Entertainment',
      'cash_out',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Home Maintenance',
      'cash_out',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Insurance',
      'cash_out',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'EMI/Loan',
      'cash_out',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Gifts',
      'cash_out',
      true,
      true,
      v_user_id
    );


  /*
    Create default payment modes.
  */
  insert into public.payment_modes (
    group_id,
    name,
    is_default,
    is_active,
    created_by
  )
  values
    (
      v_group_id,
      'Cash',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Google Pay',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'PhonePe',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Paytm',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'UPI',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Net Banking',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Debit Card',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Credit Card',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Bank Transfer',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Cheque',
      true,
      true,
      v_user_id
    ),
    (
      v_group_id,
      'Other',
      true,
      true,
      v_user_id
    );


  /*
    Return the newly created group ID.
  */
  return v_group_id;

end;
$$;


-- revoke public access

revoke all
on function public.create_cash_book_group(
  text,
  text,
  varchar,
  numeric,
  text
)
from public;

-- grant authenticated access

grant execute
on function public.create_cash_book_group(
  text,
  text,
  varchar,
  numeric,
  text
)
to authenticated;

-- verify the function exists

select
  routine_name,
  routine_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'create_cash_book_group';