import { supabase } from "../lib/supabase";

import type { GroupMember }
  from "../types/member";

export async function loadCurrentMember(
  groupId: string
): Promise<GroupMember> {

  const {
    data: authData,
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authData.user) {

    throw new Error(
      "Unable to determine the logged in user."
    );

  }

  const userId =
    authData.user.id;

  const {
    data: member,
    error: memberError,
  } = await supabase
    .from("group_members")
    .select(`
      id,
      group_id,
      user_id,
      member_name,
      role,
      is_active
    `)
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .eq("is_active", true)
    .single();

  if (memberError || !member) {

    throw new Error(
      "Current member not found."
    );

  }

  return member as GroupMember;

}