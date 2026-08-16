import { supabase } from "../lib/supabase";

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  contact_no: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get the currently logged-in user's profile.
 */
export async function getMyProfile(): Promise<UserProfile> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("User is not authenticated.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, avatar_url, contact_no, created_at, updated_at"
    )
    .eq("id", user.id)
    .single();

  if (error) {
    throw error;
  }

  return data as UserProfile;
}

/**
 * Update the currently logged-in user's profile.
 */
export async function updateMyProfile(
  fullName: string,
  contactNo: string
): Promise<UserProfile> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("User is not authenticated.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      contact_no: contactNo,
    })
    .eq("id", user.id)
    .select(
      "id, full_name, avatar_url, contact_no, created_at, updated_at"
    )
    .single();

  if (error) {
    throw error;
  }

  return data as UserProfile;
}