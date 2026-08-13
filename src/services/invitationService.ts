import { supabase } from "../lib/supabase";

export type GroupInvitation = {
  id: string;
  group_id: string;
  invited_by: string;
  email: string | null;
  phone: string | null;
  member_name: string;
  token: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  expires_at: string;
  accepted_at: string | null;
  accepted_by: string | null;
  created_at: string;
  updated_at: string;
};


/* -------------------------------------------------
   Get current logged-in user
------------------------------------------------- */

async function getCurrentUserId(): Promise<string> {

  const {
    data,
    error,
  } = await supabase.auth.getUser();

  if (
    error ||
    !data.user
  ) {

    throw new Error(
      "Unable to determine the logged in user."
    );

  }

  return data.user.id;
}


/* -------------------------------------------------
   Create invitation
------------------------------------------------- */

export async function createGroupInvitation(
  groupId: string,
  memberName: string,
  email?: string,
  phone?: string
): Promise<GroupInvitation> {

  const userId =
    await getCurrentUserId();

  const cleanName =
    memberName.trim();

  const cleanEmail =
    email?.trim().toLowerCase() || null;

  const cleanPhone =
    phone?.trim() || null;


  if (!cleanName) {

    throw new Error(
      "Member name is required."
    );

  }


  if (!cleanEmail && !cleanPhone) {

    throw new Error(
      "Email address or phone number is required."
    );

  }


  if (cleanEmail && cleanPhone) {

    throw new Error(
      "Use either email or phone number, not both."
    );

  }


  /* ---------------------------------------------
     Email validation
  --------------------------------------------- */

  if (cleanEmail) {

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail
      )
    ) {

      throw new Error(
        "Enter a valid email address."
      );

    }

  }


  /* ---------------------------------------------
     Phone validation
  --------------------------------------------- */

  if (cleanPhone) {

    if (
      !/^[6-9][0-9]{9}$/.test(
        cleanPhone
      )
    ) {

      throw new Error(
        "Enter a valid 10-digit Indian mobile number."
      );

    }

  }


  const {
    data,
    error,
  } = await supabase
    .from("group_invitations")
    .insert({
      group_id: groupId,
      invited_by: userId,
      member_name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
    })
    .select(`
      id,
      group_id,
      invited_by,
      email,
      phone,
      member_name,
      token,
      status,
      expires_at,
      accepted_at,
      accepted_by,
      created_at,
      updated_at
    `)
    .single();


  if (error || !data) {

    console.error(
      "Unable to create group invitation.",
      error
    );

    throw new Error(
      error?.message ??
      "Unable to create group invitation."
    );

  }


  return data as GroupInvitation;
}


/* -------------------------------------------------
   Get invitations for a group
------------------------------------------------- */

export async function getGroupInvitations(
  groupId: string
): Promise<GroupInvitation[]> {

  const {
    data,
    error,
  } = await supabase
    .from("group_invitations")
    .select(`
      id,
      group_id,
      invited_by,
      email,
      phone,
      member_name,
      token,
      status,
      expires_at,
      accepted_at,
      accepted_by,
      created_at,
      updated_at
    `)
    .eq("group_id", groupId)
    .order(
      "created_at",
      {
        ascending: false,
      }
    );


  if (error) {

    console.error(
      "Unable to load group invitations.",
      error
    );

    throw new Error(
      error.message
    );

  }


  return (
    (data ?? []) as GroupInvitation[]
  );

}


/* -------------------------------------------------
   Cancel invitation
------------------------------------------------- */

export async function cancelGroupInvitation(
  invitationId: string
): Promise<void> {

  const {
    error,
  } = await supabase
    .from("group_invitations")
    .update({
      status: "cancelled",
    })
    .eq(
      "id",
      invitationId
    );


  if (error) {

    console.error(
      "Unable to cancel group invitation.",
      error
    );

    throw new Error(
      error.message
    );

  }

}


/* -------------------------------------------------
   Get invitation by token
------------------------------------------------- */

export async function getInvitationByToken(
  token: string
): Promise<GroupInvitation | null> {

  const {
    data,
    error,
  } = await supabase
    .from("group_invitations")
    .select(`
      id,
      group_id,
      invited_by,
      email,
      phone,
      member_name,
      token,
      status,
      expires_at,
      accepted_at,
      accepted_by,
      created_at,
      updated_at
    `)
    .eq(
      "token",
      token
    )
    .maybeSingle();


  if (error) {

  console.error(
    "GET INVITATION SUPABASE ERROR:",
    error
  );

  console.error(
    "GET INVITATION TOKEN:",
    token
  );

  throw new Error(
    error.message
  );

}


  return data as GroupInvitation | null;

}

/* -------------------------------------------------
   Generate invitation link
------------------------------------------------- */

export function getInvitationLink(
  token: string
): string {

  const baseUrl =
    window.location.origin;

  return `${baseUrl}/invite?token=${encodeURIComponent(token)}`;
}

/* -------------------------------------------------
   Accept invitation
------------------------------------------------- */

export async function acceptGroupInvitation(
  token: string
): Promise<void> {

  const {
    data,
    error,
  } = await supabase.rpc(
    "accept_group_invitation",
    {
      p_token: token,
    }
  );


  if (error) {

    console.error(
      "Unable to accept group invitation.",
      error
    );

    throw new Error(
      error.message
    );

  }


  if (!data) {

    throw new Error(
      "Unable to accept invitation."
    );

  }

}