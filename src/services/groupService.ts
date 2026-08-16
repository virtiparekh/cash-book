import { supabase } from "../lib/supabase";
import type { CashBookGroup } from "../types/cashBook";

type UserGroupMembership = {
    groupId: string;
    role: "admin" | "member";
};


/* =========================================================
   Get current user's group memberships
========================================================= */

export async function getMyGroupIds(): Promise<UserGroupMembership[]> {

    const {
        data: authData,
        error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
        throw authError;
    }

    const user = authData.user;

    if (!user) {
        return [];
    }

    const {
        data,
        error,
    } = await supabase
        .from("group_members")
        .select("group_id, role")
        .eq("user_id", user.id)
        .eq("is_active", true);

    if (error) {
        throw error;
    }

    if (!data) {
        return [];
    }

    return data.map((row) => ({
        groupId: row.group_id,
        role: row.role,
    }));
}


/* =========================================================
   Get Cash Book groups by IDs
========================================================= */

export async function getGroupsByIds(
    memberships: UserGroupMembership[]
): Promise<CashBookGroup[]> {

    if (memberships.length === 0) {
        return [];
    }

    const {
        data,
        error,
    } = await supabase
        .from("cash_book_groups")
        .select(`
            id,
            name,
            description,
            currency_code,
            opening_balance,
            created_by,
            created_at,
            updated_at
        `)
        .in(
            "id",
            memberships.map(
                (membership) => membership.groupId
            )
        )
        .order("created_at");

    if (error) {
        throw error;
    }

    if (!data) {
        return [];
    }

    return data.map((group) => {

        const membership =
            memberships.find(
                (item) =>
                    item.groupId === group.id
            );

        return {
            id: group.id,
            name: group.name,
            description: group.description,
            currencyCode: group.currency_code,
            openingBalance: Number(
                group.opening_balance
            ),
            role:
                membership?.role ??
                "member",
            createdBy: group.created_by,
            createdAt: group.created_at,
            updatedAt: group.updated_at,
        };
    });
}


/* =========================================================
   Load current user's Cash Books
========================================================= */

export async function loadMyCashBookGroups(): Promise<CashBookGroup[]> {

    const memberships =
        await getMyGroupIds();

    if (memberships.length === 0) {
        return [];
    }

    return await getGroupsByIds(
        memberships
    );
}


/* =========================================================
   Rename Cash Book
   Admin only
========================================================= */

export async function renameCashBookGroup(
    groupId: string,
    name: string
): Promise<void> {

    const trimmedName = name.trim();

    if (!trimmedName) {
        throw new Error(
            "Cash Book name cannot be empty."
        );
    }

    const {
        error,
    } = await supabase
        .from("cash_book_groups")
        .update({
            name: trimmedName,
        })
        .eq("id", groupId);

    if (error) {
        throw error;
    }
}


/* =========================================================
   Delete Cash Book
   Admin only
========================================================= */

export async function deleteCashBookGroup(
    groupId: string
): Promise<void> {

    const {
        error,
    } = await supabase
        .from("cash_book_groups")
        .delete()
        .eq("id", groupId);

    if (error) {
        throw error;
    }
}


/* =========================================================
   Leave Cash Book
========================================================= */

export async function leaveCashBookGroup(
    groupId: string
): Promise<void> {

    const { error } = await supabase.rpc(
        "leave_cash_book_group",
        {
            p_group_id: groupId,
        }
    );

    if (error) {
        console.error(
            "Unable to leave cash book.",
            error
        );

        throw new Error(
            error.message ||
            "Unable to leave the cash book."
        );
    }
}

