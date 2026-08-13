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

  if (
    authError ||
    !authData.user
  ) {

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


  if (
    memberError ||
    !member
  ) {

    throw new Error(
      "Current member not found."
    );

  }

  return member as GroupMember;

}


/* -----------------------------------------
   Load all active members of a Cash Book
------------------------------------------ */

export async function getGroupMembers(
  groupId: string
): Promise<GroupMember[]> {

  const {
    data,
    error,
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
    .eq("is_active", true)
    .order("member_name");


  if (error) {

    console.error(
      "Unable to load group members.",
      error
    );

    throw new Error(
      "Unable to load group members."
    );

  }


  return (data ?? []) as GroupMember[];

}

export async function addGroupMember(
  groupId: string,
  memberName: string
): Promise<GroupMember> {

  const cleanName = memberName.trim();

  if (!cleanName) {
    throw new Error("Member name is required.");
  }

  const {
    data,
    error,
  } = await supabase
    .from("group_members")
    .insert({
      group_id: groupId,
      member_name: cleanName,
      role: "member",
      is_active: true,
    })
    .select(`
      id,
      group_id,
      user_id,
      member_name,
      role,
      is_active
    `)
    .single();

  if (error || !data) {

    console.error(
      "Unable to add group member.",
      error
    );

    throw new Error(
      error?.message ??
      "Unable to add member."
    );
  }

  return data as GroupMember;
}

export async function updateMemberName(
  memberId: string,
  memberName: string
): Promise<GroupMember> {

  const cleanName = memberName.trim();

  if (!cleanName) {
    throw new Error(
      "Member name cannot be empty."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("group_members")
    .update({
      member_name: cleanName,
    })
    .eq("id", memberId)
    .select(`
      id,
      group_id,
      user_id,
      member_name,
      role,
      is_active,
      joined_at,
      created_at,
      updated_at
    `)
    .single();

  if (error || !data) {
    console.error(
      "Unable to update member name.",
      error
    );

    throw new Error(
      error?.message ??
      "Unable to update member name."
    );
  }

  return data as GroupMember;
}

export async function updateMemberStatus(
  memberId: string,
  isActive: boolean
): Promise<GroupMember> {

  const {
    data,
    error,
  } = await supabase
    .from("group_members")
    .update({
      is_active: isActive,
    })
    .eq("id", memberId)
    .select(`
      id,
      group_id,
      user_id,
      member_name,
      role,
      is_active,
      joined_at,
      created_at,
      updated_at
    `)
    .single();

  if (error || !data) {

    console.error(
      "Unable to update member status.",
      error
    );

    throw new Error(
      error?.message ??
      "Unable to update member status."
    );
  }

  return data as GroupMember;
}

export async function updateMemberRole(
  memberId: string,
  role: "admin" | "member"
): Promise<GroupMember> {

  /*
   * Get the member being changed
   */
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
    .eq("id", memberId)
    .single();

  if (memberError || !member) {

    throw new Error(
      memberError?.message ??
      "Member not found."
    );
  }


  /*
   * Prevent demoting the last active admin
   */
  if (
    member.role === "admin" &&
    role === "member" &&
    member.is_active
  ) {

    const {
      count,
      error: adminCountError,
    } = await supabase
      .from("group_members")
      .select(
        "id",
        {
          count: "exact",
          head: true,
        }
      )
      .eq(
        "group_id",
        member.group_id
      )
      .eq(
        "role",
        "admin"
      )
      .eq(
        "is_active",
        true
      );

    if (adminCountError) {

      throw new Error(
        adminCountError.message
      );
    }

    if (count === 1) {

      throw new Error(
        "This member is the last active admin. Another active admin is required before this member can be changed to Member."
      );
    }
  }


  /*
   * Perform role update
   */
  const {
    data,
    error: updateError,
  } = await supabase
    .from("group_members")
    .update({
      role,
    })
    .eq("id", memberId)
    .select(`
      id,
      group_id,
      user_id,
      member_name,
      role,
      is_active,
      joined_at,
      created_at,
      updated_at
    `)
    .single();

  if (updateError || !data) {

    console.error(
      "Unable to update member role.",
      updateError
    );

    throw new Error(
      updateError?.message ??
      "Unable to update member role."
    );
  }

  return data as GroupMember;
}