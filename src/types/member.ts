export type GroupMember = {
  id: string;
  group_id: string;
  user_id: string | null;
  member_name: string;
  role: "owner" | "admin" | "member";
  is_active: boolean;
};