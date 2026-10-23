
import { supabase } from "../lib/supabase";

/* =====================================================
   TYPES
===================================================== */

export type MonthlyBudget = {
  id: string;
  group_id: string;
  budget_month: string;
  budget_amount: number;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type CategoryBudget = {
  id: string;
  group_id: string;
  category_id: string;
  budget_month: string;
  budget_amount: number;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type CategorySpending = {
  category_id: string;
  spent_amount: number;
};

export type BudgetOverview = {
  overallBudget: MonthlyBudget | null;
  categoryBudgets: CategoryBudget[];
  totalSpent: number;
  categorySpending: CategorySpending[];
};

/* =====================================================
   HELPERS
===================================================== */

/**
 * Returns the first day of the selected month
 * in YYYY-MM-DD format.
 *
 * Example: October 2026 -> 2026-10-01
 */
export function getBudgetMonth(
  year: number,
  monthIndex: number
): string {
  const month = String(monthIndex + 1).padStart(2, "0");

  return `${year}-${month}-01`;
}

/**
 * Returns the start and end dates for a month.
 * The end date is exclusive.
 *
 * Example:
 * October 2026:
 * 2026-10-01 <= transaction_at < 2026-11-01
 */
function getMonthRange(
  budgetMonth: string
): {
  start: string;
  end: string;
} {
  const [year, month] = budgetMonth
    .split("-")
    .map(Number);

  const start = `${year}-${String(month).padStart(2, "0")}-01`;

  const nextMonthDate = new Date(
    Date.UTC(year, month, 1)
  );

  const end = [
    nextMonthDate.getUTCFullYear(),
    String(nextMonthDate.getUTCMonth() + 1).padStart(2, "0"),
    "01",
  ].join("-");

  return {
    start,
    end,
  };
}

/* =====================================================
   LOAD OVERALL MONTHLY BUDGET
===================================================== */

export async function loadMonthlyBudget(
  groupId: string,
  budgetMonth: string
): Promise<MonthlyBudget | null> {
  const { data, error } = await supabase
    .from("monthly_budgets")
    .select("*")
    .eq("group_id", groupId)
    .eq("budget_month", budgetMonth)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    ...data,
    budget_amount: Number(data.budget_amount),
  } as MonthlyBudget;
}

/* =====================================================
   LOAD CATEGORY MONTHLY BUDGETS
===================================================== */

export async function loadCategoryBudgets(
  groupId: string,
  budgetMonth: string
): Promise<CategoryBudget[]> {
  const { data, error } = await supabase
    .from("category_budgets")
    .select("*")
    .eq("group_id", groupId)
    .eq("budget_month", budgetMonth)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    ...row,
    budget_amount: Number(row.budget_amount),
  })) as CategoryBudget[];
}

/* =====================================================
   CALCULATE OVERALL CASH-OUT SPENDING
===================================================== */

export async function loadMonthlySpending(
  groupId: string,
  budgetMonth: string
): Promise<number> {
  const { start, end } = getMonthRange(budgetMonth);

  const { data, error } = await supabase
    .from("transactions")
    .select("amount")
    .eq("group_id", groupId)
    .eq("entry_type", "cash_out")
    .is("deleted_at", null)
    .gte("transaction_at", start)
    .lt("transaction_at", end);

  if (error) {
    throw error;
  }

  return (data ?? []).reduce(
    (total, row) => total + Number(row.amount),
    0
  );
}

/* =====================================================
   CALCULATE SPENDING BY CATEGORY
===================================================== */

export async function loadCategorySpending(
  groupId: string,
  budgetMonth: string
): Promise<CategorySpending[]> {
  const { start, end } = getMonthRange(budgetMonth);

  const { data, error } = await supabase
    .from("transactions")
    .select("category_id, amount")
    .eq("group_id", groupId)
    .eq("entry_type", "cash_out")
    .is("deleted_at", null)
    .gte("transaction_at", start)
    .lt("transaction_at", end);

  if (error) {
    throw error;
  }

  const totals = new Map<string, number>();

  for (const row of data ?? []) {
    const categoryId = row.category_id;
    const amount = Number(row.amount);

    totals.set(
      categoryId,
      (totals.get(categoryId) ?? 0) + amount
    );
  }

  return Array.from(
    totals,
    ([category_id, spent_amount]) => ({
      category_id,
      spent_amount,
    })
  );
}

/* =====================================================
   LOAD COMPLETE BUDGET OVERVIEW
===================================================== */

export async function loadBudgetOverview(
  groupId: string,
  budgetMonth: string
): Promise<BudgetOverview> {
  const [
    overallBudget,
    categoryBudgets,
    totalSpent,
    categorySpending,
  ] = await Promise.all([
    loadMonthlyBudget(groupId, budgetMonth),
    loadCategoryBudgets(groupId, budgetMonth),
    loadMonthlySpending(groupId, budgetMonth),
    loadCategorySpending(groupId, budgetMonth),
  ]);

  return {
    overallBudget,
    categoryBudgets,
    totalSpent,
    categorySpending,
  };
}


/* =====================================================
   CREATE OVERALL MONTHLY BUDGET
===================================================== */

type SaveMonthlyBudgetInput = {
  groupId: string;
  budgetMonth: string;
  budgetAmount: number;
};

export async function createMonthlyBudget({
  groupId,
  budgetMonth,
  budgetAmount,
}: SaveMonthlyBudgetInput): Promise<void> {
  const { error } = await supabase
    .from("monthly_budgets")
    .insert({
      group_id: groupId,
      budget_month: budgetMonth,
      budget_amount: budgetAmount,
    });

  if (error) {
    throw error;
  }
}

/* =====================================================
   UPDATE OVERALL MONTHLY BUDGET
===================================================== */

export async function updateMonthlyBudget(
  budgetId: string,
  groupId: string,
  budgetMonth: string,
  budgetAmount: number
): Promise<void> {
  const { error } = await supabase
    .from("monthly_budgets")
    .update({
      budget_month: budgetMonth,
      budget_amount: budgetAmount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", budgetId)
    .eq("group_id", groupId);

  if (error) {
    throw error;
  }
}

/* =====================================================
   DELETE OVERALL MONTHLY BUDGET
===================================================== */

export async function deleteMonthlyBudget(
  budgetId: string,
  groupId: string
): Promise<void> {
  const { error } = await supabase
    .from("monthly_budgets")
    .delete()
    .eq("id", budgetId)
    .eq("group_id", groupId);

  if (error) {
    throw error;
  }
}

/* =====================================================
   CREATE CATEGORY MONTHLY BUDGET
===================================================== */

type SaveCategoryBudgetInput = {
  groupId: string;
  categoryId: string;
  budgetMonth: string;
  budgetAmount: number;
};

export async function createCategoryBudget({
  groupId,
  categoryId,
  budgetMonth,
  budgetAmount,
}: SaveCategoryBudgetInput): Promise<void> {
  const { error } = await supabase
    .from("category_budgets")
    .insert({
      group_id: groupId,
      category_id: categoryId,
      budget_month: budgetMonth,
      budget_amount: budgetAmount,
    });

  if (error) {
    throw error;
  }
}

/* =====================================================
   UPDATE CATEGORY MONTHLY BUDGET
===================================================== */

export async function updateCategoryBudget(
  budgetId: string,
  groupId: string,
  categoryId: string,
  budgetMonth: string,
  budgetAmount: number
): Promise<void> {
  const { error } = await supabase
    .from("category_budgets")
    .update({
      category_id: categoryId,
      budget_month: budgetMonth,
      budget_amount: budgetAmount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", budgetId)
    .eq("group_id", groupId);

  if (error) {
    throw error;
  }
}

/* =====================================================
   DELETE CATEGORY MONTHLY BUDGET
===================================================== */

export async function deleteCategoryBudget(
  budgetId: string,
  groupId: string
): Promise<void> {
  const { error } = await supabase
    .from("category_budgets")
    .delete()
    .eq("id", budgetId)
    .eq("group_id", groupId);

  if (error) {
    throw error;
  }
}

