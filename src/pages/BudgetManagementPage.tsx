
import { useState, useEffect } from "react";
import { loadCategories } from "../services/masterDataService";
import { useCashBook } from "../hooks/useCashBook";
import { loadBudgetOverview, getBudgetMonth, createMonthlyBudget, updateMonthlyBudget, createCategoryBudget, updateCategoryBudget, deleteCategoryBudget } from "../services/budgetService";
import type { BudgetOverview } from "../services/budgetService";
import "./../styles/BudgetManagementPage.css"

type BudgetTab =
    | "monthly"
    | "categories";

type BudgetCategory = {
    id: string;
    name: string;
};
function BudgetManagementPage() {
    const {
        selectedCashBook,
        isAdmin,
    } = useCashBook();

    const [activeTab, setActiveTab] =
        useState<BudgetTab>("monthly");

    const today = new Date();

    const [selectedMonth, setSelectedMonth] =
        useState(() =>
            getBudgetMonth(
                today.getFullYear(),
                today.getMonth()
            )
        );

    const [budgetOverview, setBudgetOverview] =
        useState<BudgetOverview | null>(null);

    const [budgetLoading, setBudgetLoading] =
        useState(false);

    const [budgetError, setBudgetError] =
        useState<string | null>(null);

    const [reloadKey, setReloadKey] = useState(0);

    const [showMonthlyBudgetForm, setShowMonthlyBudgetForm] =
        useState(false);

    const [monthlyBudgetAmount, setMonthlyBudgetAmount] =
        useState("");

    const [savingMonthlyBudget, setSavingMonthlyBudget] =
        useState(false);

    const [monthlyBudgetFormError, setMonthlyBudgetFormError] =
        useState<string | null>(null);

    const [categories, setCategories] = useState<BudgetCategory[]>([]);

    const [showCategoryBudgetForm, setShowCategoryBudgetForm] =
        useState(false);

    const [selectedCategoryId, setSelectedCategoryId] = useState("");

    const [categoryBudgetAmount, setCategoryBudgetAmount] =
        useState("");

    const [editingCategoryBudgetId, setEditingCategoryBudgetId] =
        useState<string | null>(null);

    const [savingCategoryBudget, setSavingCategoryBudget] =
        useState(false);

    const [categoryBudgetFormError, setCategoryBudgetFormError] =
        useState<string | null>(null);

    const [deletingCategoryBudgetId, setDeletingCategoryBudgetId] =
        useState<string | null>(null);

    const [categoryBudgetSearch, setCategoryBudgetSearch] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadBudgetData() {
            if (!selectedCashBook?.id) {
                setBudgetOverview(null);
                return;
            }

            try {
                setBudgetLoading(true);
                setBudgetError(null);

                const overview = await loadBudgetOverview(
                    selectedCashBook.id,
                    selectedMonth
                );

                if (!cancelled) {
                    setBudgetOverview(overview);
                }
            } catch (error) {
                console.error(
                    "Unable to load budget overview.",
                    error
                );

                if (!cancelled) {
                    setBudgetError(
                        error instanceof Error
                            ? error.message
                            : "Unable to load budget data."
                    );
                }
            } finally {
                if (!cancelled) {
                    setBudgetLoading(false);
                }
            }
        }

        void loadBudgetData();

        return () => {
            cancelled = true;
        };
    }, [selectedCashBook?.id, selectedMonth, reloadKey]);

    const formatCurrency = (amount: number): string =>
        `₹${amount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const formatSelectedMonth = (month: string): string => {
        const [year, monthNumber] = month.split("-").map(Number);

        return new Date(year, monthNumber - 1, 1)
            .toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
            });
    };

    useEffect(() => {
        let cancelled = false;

        async function loadExpenseCategories() {
            if (!selectedCashBook?.id) {
                setCategories([]);
                return;
            }

            try {
                const result = await loadCategories(
                    selectedCashBook.id,
                    "cash_out"
                );

                if (!cancelled) {
                    setCategories(result);
                }
            } catch (error) {
                console.error(
                    "Unable to load expense categories.",
                    error
                );

                if (!cancelled) {
                    setCategoryBudgetFormError(
                        "Unable to load expense categories. Please try again."
                    );
                }
            }
        }

        void loadExpenseCategories();

        return () => {
            cancelled = true;
        };
    }, [selectedCashBook?.id]);

    async function handleSaveMonthlyBudget() {
        const amount = Number(monthlyBudgetAmount);

        if (!monthlyBudgetAmount.trim() || !Number.isFinite(amount) || amount <= 0) {
            setMonthlyBudgetFormError(
                "Please enter a valid budget amount greater than ₹0."
            );
            return;
        }

        if (!selectedCashBook?.id) {
            setMonthlyBudgetFormError("Please select a Cash Book first.");
            return;
        }

        try {
            setSavingMonthlyBudget(true);
            setMonthlyBudgetFormError(null);

            const existingBudget = budgetOverview?.overallBudget;

            if (existingBudget) {
                await updateMonthlyBudget(
                    existingBudget.id,
                    selectedCashBook.id,
                    selectedMonth,
                    amount
                );
            } else {
                await createMonthlyBudget({
                    groupId: selectedCashBook.id,
                    budgetMonth: selectedMonth,
                    budgetAmount: amount,
                });
            }

            setShowMonthlyBudgetForm(false);
            setMonthlyBudgetAmount("");
            setReloadKey((current) => current + 1);
        } catch (error) {
            console.error("Unable to save monthly budget.", error);

            setMonthlyBudgetFormError(
                error instanceof Error
                    ? error.message
                    : "Unable to save the monthly budget. Please try again."
            );
        } finally {
            setSavingMonthlyBudget(false);
        }
    }


    async function handleDeleteCategoryBudget(
        budgetId: string,
        categoryName: string
    ) {
        if (!selectedCashBook?.id) {
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete the budget for "${categoryName}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingCategoryBudgetId(budgetId);

            await deleteCategoryBudget(
                budgetId,
                selectedCashBook.id
            );

            if (editingCategoryBudgetId === budgetId) {
                setShowCategoryBudgetForm(false);
                setEditingCategoryBudgetId(null);
                setSelectedCategoryId("");
                setCategoryBudgetAmount("");
            }

            setCategoryBudgetFormError(null);
            setReloadKey((current) => current + 1);
        } catch (error) {
            console.error("Unable to delete category budget.", error);

            setCategoryBudgetFormError(
                error instanceof Error
                    ? error.message
                    : "Unable to delete the category budget. Please try again."
            );
        } finally {
            setDeletingCategoryBudgetId(null);
        }
    }


    const overallBudgetAmount =
        budgetOverview?.overallBudget?.budget_amount ?? 0;

    const totalSpent =
        budgetOverview?.totalSpent ?? 0;

    const remainingBudget =
        overallBudgetAmount - totalSpent;

    const spendingPercentage =
        overallBudgetAmount > 0
            ? (totalSpent / overallBudgetAmount) * 100
            : 0;

    const progressPercentage = Math.min(
        100,
        Math.max(0, spendingPercentage)
    );


    async function handleSaveCategoryBudget() {
        if (!selectedCashBook?.id) {
            setCategoryBudgetFormError("Please select a Cash Book first.");
            return;
        }

        if (!selectedCategoryId) {
            setCategoryBudgetFormError("Please select an expense category.");
            return;
        }

        const amount = Number(categoryBudgetAmount);

        if (
            !categoryBudgetAmount.trim() ||
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            setCategoryBudgetFormError(
                "Please enter a valid budget amount greater than ₹0."
            );
            return;
        }

        const existingDuplicate = budgetOverview?.categoryBudgets.some(
            (budget) =>
                budget.category_id === selectedCategoryId &&
                budget.budget_month === selectedMonth &&
                budget.id !== editingCategoryBudgetId
        );

        if (existingDuplicate) {
            setCategoryBudgetFormError(
                "A budget already exists for this category and month. Please edit the existing budget."
            );
            return;
        }

        try {
            setSavingCategoryBudget(true);
            setCategoryBudgetFormError(null);

            if (editingCategoryBudgetId) {
                await updateCategoryBudget(
                    editingCategoryBudgetId,
                    selectedCashBook.id,
                    selectedCategoryId,
                    selectedMonth,
                    amount
                );
            } else {
                await createCategoryBudget({
                    groupId: selectedCashBook.id,
                    categoryId: selectedCategoryId,
                    budgetMonth: selectedMonth,
                    budgetAmount: amount,
                });
            }

            setShowCategoryBudgetForm(false);
            setSelectedCategoryId("");
            setCategoryBudgetAmount("");
            setEditingCategoryBudgetId(null);

            setReloadKey((current) => current + 1);
        } catch (error) {
            console.error("Unable to save category budget.", error);

            setCategoryBudgetFormError(
                error instanceof Error
                    ? error.message
                    : "Unable to save the category budget. Please try again."
            );
        } finally {
            setSavingCategoryBudget(false);
        }
    }


    return (
        <div className="budget-management-page">

            <div className="budget-management-page-header">
                <div>
                    <h1>Budget Management</h1>

                    <p>
                        Manage monthly spending limits and track expenses by category.
                    </p>
                </div>
            </div>

            {selectedCashBook && (
                <div className="budget-current-cashbook">
                    <span>Cash Book</span>

                    <strong>
                        {selectedCashBook.name}
                    </strong>
                </div>
            )}

            {!selectedCashBook && (
                <div className="budget-empty-state">
                    <h3>No Cash Book selected</h3>

                    <p>
                        Please select a Cash Book to manage budgets.
                    </p>
                </div>
            )}

            {selectedCashBook && (
                <>
                    <div className="budget-management-tabs">

                        <button
                            type="button"
                            className={`budget-management-tab ${activeTab === "monthly"
                                ? "budget-management-tab--active"
                                : ""
                                }`}
                            onClick={() => setActiveTab("monthly")}
                        >
                            Monthly Budget
                        </button>

                        <button
                            type="button"
                            className={`budget-management-tab ${activeTab === "categories"
                                ? "budget-management-tab--active"
                                : ""
                                }`}
                            onClick={() => setActiveTab("categories")}
                        >
                            Category Budgets
                        </button>

                    </div>

                    <div className="budget-management-tab-content">

                        {activeTab === "monthly" && (
                            <section className="monthly-budget-section">


                                <div className="budget-section-header">
                                    <div>
                                        <h2>Monthly Budget</h2>
                                        <p>Set an overall spending limit for each month.</p>
                                    </div>

                                    {isAdmin && !budgetLoading && !budgetError && (
                                        <button
                                            type="button"
                                            className="budget-add-button"
                                            onClick={() => {
                                                setMonthlyBudgetFormError(null);
                                                setMonthlyBudgetAmount(
                                                    budgetOverview?.overallBudget
                                                        ? String(budgetOverview.overallBudget.budget_amount)
                                                        : ""
                                                );
                                                setShowMonthlyBudgetForm(true);
                                            }}
                                        >
                                            {budgetOverview?.overallBudget
                                                ? "Edit Monthly Budget"
                                                : "+ Set Monthly Budget"}
                                        </button>
                                    )}
                                </div>



                                <div className="budget-month-selector">
                                    <label htmlFor="budget-month">
                                        Select month
                                    </label>

                                    <input
                                        id="budget-month"
                                        type="month"
                                        value={selectedMonth.slice(0, 7)}
                                        onChange={(event) => {
                                            const value = event.target.value;

                                            if (value) {
                                                setSelectedMonth(`${value}-01`);
                                            }
                                        }}
                                    />
                                </div>


                                {showMonthlyBudgetForm && (
                                    <div className="budget-form-card">
                                        <div className="budget-form-header">
                                            <h3>
                                                {budgetOverview?.overallBudget
                                                    ? "Edit Monthly Budget"
                                                    : "Set Monthly Budget"}
                                            </h3>
                                            <p>
                                                Set the overall spending limit for{" "}
                                                {formatSelectedMonth(selectedMonth)}.
                                            </p>
                                        </div>

                                        <div className="budget-form-field">
                                            <label htmlFor="monthly-budget-amount">
                                                Monthly Budget Amount (₹)
                                            </label>

                                            <input
                                                id="monthly-budget-amount"
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                placeholder="Enter budget amount"
                                                value={monthlyBudgetAmount}
                                                onChange={(event) => {
                                                    setMonthlyBudgetAmount(event.target.value);
                                                    setMonthlyBudgetFormError(null);
                                                }}
                                                disabled={savingMonthlyBudget}
                                            />
                                        </div>

                                        {monthlyBudgetFormError && (
                                            <p className="budget-form-error" role="alert">
                                                {monthlyBudgetFormError}
                                            </p>
                                        )}

                                        <div className="budget-form-actions">
                                            <button
                                                type="button"
                                                className="budget-cancel-button"
                                                onClick={() => {
                                                    setShowMonthlyBudgetForm(false);
                                                    setMonthlyBudgetAmount("");
                                                    setMonthlyBudgetFormError(null);
                                                }}
                                                disabled={savingMonthlyBudget}
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="button"
                                                className="budget-add-button"
                                                onClick={handleSaveMonthlyBudget}
                                                disabled={savingMonthlyBudget}
                                            >
                                                {savingMonthlyBudget
                                                    ? "Saving..."
                                                    : "Save Budget"}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {budgetLoading ? (
                                    <div className="budget-placeholder">
                                        <p>Loading budget information...</p>
                                    </div>
                                ) : budgetError ? (
                                    <div className="budget-placeholder budget-placeholder--error">
                                        <h3>Unable to load budget information</h3>
                                        <p>{budgetError}</p>

                                        <button
                                            type="button"
                                            className="budget-add-button"
                                            onClick={() => setReloadKey((current) => current + 1)}
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                ) : (
                                    <div className="budget-placeholder">
                                        <div className="budget-overview-heading">
                                            <div>
                                                <h3>{formatSelectedMonth(selectedMonth)}</h3>
                                                <p>Overall monthly spending limit</p>
                                            </div>
                                        </div>

                                        <div className="budget-summary-grid">
                                            <div className="budget-summary-card">
                                                <span>Monthly Budget</span>
                                                <strong>
                                                    {overallBudgetAmount > 0
                                                        ? formatCurrency(overallBudgetAmount)
                                                        : "Not set"}
                                                </strong>
                                            </div>

                                            <div className="budget-summary-card">
                                                <span>Total Spent</span>
                                                <strong className="budget-summary-spent">
                                                    {formatCurrency(totalSpent)}
                                                </strong>
                                            </div>

                                            <div className="budget-summary-card">
                                                <span>
                                                    {remainingBudget < 0
                                                        ? "Budget Exceeded"
                                                        : "Remaining"}
                                                </span>

                                                <strong
                                                    className={
                                                        remainingBudget < 0
                                                            ? "budget-summary-exceeded"
                                                            : "budget-summary-remaining"
                                                    }
                                                >
                                                    {formatCurrency(Math.abs(remainingBudget))}
                                                </strong>
                                            </div>
                                        </div>

                                        {overallBudgetAmount > 0 && (
                                            <div className="budget-progress-section">
                                                <div className="budget-progress-labels">
                                                    <span>Budget used</span>
                                                    <strong>{spendingPercentage.toFixed(1)}%</strong>
                                                </div>

                                                <div
                                                    className="budget-progress-track"
                                                    role="progressbar"
                                                    aria-label="Monthly budget used"
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                    aria-valuenow={Math.round(progressPercentage)}
                                                >
                                                    <div
                                                        className={`budget-progress-fill ${spendingPercentage > 100
                                                            ? "budget-progress-fill--exceeded"
                                                            : ""
                                                            }`}
                                                        style={{ width: `${progressPercentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {!budgetOverview?.overallBudget && (
                                            <p className="budget-no-budget-message">
                                                No overall budget has been set for this month yet.
                                            </p>
                                        )}
                                    </div>
                                )}


                            </section>
                        )}


                        {activeTab === "categories" && (
                            <section className="category-budget-section">
                                <div className="budget-section-header">
                                    <div>
                                        <h2>Category Budgets</h2>
                                        <p>
                                            Set spending limits for individual expense categories.
                                        </p>
                                    </div>

                                    {isAdmin && !budgetLoading && !budgetError && (
                                        <button
                                            type="button"
                                            className="budget-add-button"
                                            onClick={() => {
                                                setCategoryBudgetFormError(null);
                                                setSelectedCategoryId("");
                                                setCategoryBudgetAmount("");
                                                setEditingCategoryBudgetId(null);
                                                setShowCategoryBudgetForm(true);
                                            }}
                                        >
                                            + Add Category Budget
                                        </button>
                                    )}
                                </div>

                                {/* Category Budget Search */}
                                <div className="category-budget-search">
                                    <div className="category-budget-search-field">
                                        <input
                                            id="category-budget-search-input"
                                            type="search"
                                            value={categoryBudgetSearch}
                                            onChange={(e) => setCategoryBudgetSearch(e.target.value)}
                                            placeholder="Search category budgets..."
                                            aria-label="Search category budgets"
                                        />

                                        {categoryBudgetSearch && (
                                            <button
                                                type="button"
                                                className="category-budget-search-clear"
                                                onClick={() => setCategoryBudgetSearch("")}
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="budget-month-selector">
                                    <label htmlFor="category-budget-month">
                                        Select month
                                    </label>

                                    <input
                                        id="category-budget-month"
                                        type="month"
                                        value={selectedMonth.slice(0, 7)}
                                        onChange={(event) => {
                                            const value = event.target.value;

                                            if (value) {
                                                setSelectedMonth(`${value}-01`);
                                            }
                                        }}
                                    />
                                </div>

                                {showCategoryBudgetForm && (
                                    <div className="budget-form-card">
                                        <div className="budget-form-header">
                                            <h3>
                                                {editingCategoryBudgetId
                                                    ? "Edit Category Budget"
                                                    : "Add Category Budget"}
                                            </h3>

                                            <p>
                                                Set an expense limit for{" "}
                                                {formatSelectedMonth(selectedMonth)}.
                                            </p>
                                        </div>

                                        <div className="budget-form-field">
                                            <label htmlFor="budget-category">
                                                Expense Category
                                            </label>

                                            <select
                                                id="budget-category"
                                                value={selectedCategoryId}
                                                onChange={(event) => {
                                                    setSelectedCategoryId(event.target.value);
                                                    setCategoryBudgetFormError(null);
                                                }}
                                                disabled={savingCategoryBudget}
                                            >
                                                <option value="">Select a category</option>

                                                {categories.map((category) => (
                                                    <option
                                                        key={category.id}
                                                        value={category.id}
                                                    >
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>

                                            {categories.length === 0 && (
                                                <p className="budget-field-hint">
                                                    No active expense categories are available
                                                    for this Cash Book.
                                                </p>
                                            )}
                                        </div>

                                        <div className="budget-form-field">
                                            <label htmlFor="category-budget-amount">
                                                Monthly Budget Amount (₹)
                                            </label>

                                            <input
                                                id="category-budget-amount"
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                placeholder="Enter budget amount"
                                                value={categoryBudgetAmount}
                                                onChange={(event) => {
                                                    setCategoryBudgetAmount(event.target.value);
                                                    setCategoryBudgetFormError(null);
                                                }}
                                                disabled={savingCategoryBudget}
                                            />
                                        </div>

                                        {categoryBudgetFormError && (
                                            <p className="budget-form-error" role="alert">
                                                {categoryBudgetFormError}
                                            </p>
                                        )}

                                        <div className="budget-form-actions">
                                            <button
                                                type="button"
                                                className="budget-cancel-button"
                                                onClick={() => {
                                                    setShowCategoryBudgetForm(false);
                                                    setSelectedCategoryId("");
                                                    setCategoryBudgetAmount("");
                                                    setCategoryBudgetFormError(null);
                                                    setEditingCategoryBudgetId(null);
                                                }}
                                                disabled={savingCategoryBudget}
                                            >
                                                Cancel
                                            </button>


                                            <button
                                                type="button"
                                                className="budget-add-button"
                                                onClick={handleSaveCategoryBudget}
                                                disabled={savingCategoryBudget}
                                            >
                                                {savingCategoryBudget ? "Saving..." : "Save Budget"}
                                            </button>

                                        </div>
                                    </div>
                                )}

                                {budgetLoading ? (
                                    <div className="budget-placeholder">
                                        <p>Loading budget information...</p>
                                    </div>
                                ) : budgetError ? (
                                    <div className="budget-placeholder budget-placeholder--error">
                                        <h3>Unable to load budget information</h3>
                                        <p>{budgetError}</p>

                                        <button
                                            type="button"
                                            className="budget-add-button"
                                            onClick={() => setReloadKey((current) => current + 1)}
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                ) : (

                                    <div className="category-budget-list">
                                        {(() => {
                                            const categoryBudgets = budgetOverview?.categoryBudgets ?? [];
                                            const normalizedSearch = categoryBudgetSearch.trim().toLowerCase();

                                            const filteredCategoryBudgets = categoryBudgets.filter((budget) => {
                                                const categoryName =
                                                    categories.find((item) => item.id === budget.category_id)?.name ??
                                                    "Category unavailable";

                                                return categoryName.toLowerCase().includes(normalizedSearch);
                                            });

                                            if (categoryBudgets.length === 0) {
                                                return (
                                                    <div className="budget-placeholder">
                                                        <h3>No Category Budgets Yet</h3>
                                                        <p>
                                                            Add a budget for an expense category to start
                                                            tracking its spending.
                                                        </p>
                                                    </div>
                                                );
                                            }

                                            if (filteredCategoryBudgets.length === 0) {
                                                return (
                                                    <div className="budget-empty-state">
                                                        <h3>No matching category budgets</h3>
                                                        <p>Try another category name or clear your search.</p>
                                                    </div>
                                                );
                                            }

                                            return filteredCategoryBudgets.map((budget) => {
                                                const category = categories.find(
                                                    (item) => item.id === budget.category_id
                                                );

                                                const spent =
                                                    budgetOverview?.categorySpending.find(
                                                        (item) => item.category_id === budget.category_id
                                                    )?.spent_amount ?? 0;

                                                const budgetAmount = budget.budget_amount;
                                                const remaining = budgetAmount - spent;
                                                const percentage =
                                                    budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

                                                const progressPercentage = Math.min(
                                                    100,
                                                    Math.max(0, percentage)
                                                );

                                                return (
                                                    <div
                                                        className="category-budget-card"
                                                        key={budget.id}
                                                    >

                                                        <div className="category-budget-card-header">
                                                            <div className="category-budget-card-title">
                                                                <h3>
                                                                    {category?.name ?? "Category unavailable"}
                                                                </h3>

                                                                <p>
                                                                    {formatSelectedMonth(budget.budget_month)}
                                                                </p>
                                                            </div>

                                                            <div className="category-budget-card-actions">
                                                                <span
                                                                    className={`category-budget-status ${percentage > 100
                                                                        ? "category-budget-status--exceeded"
                                                                        : percentage >= 80
                                                                            ? "category-budget-status--warning"
                                                                            : "category-budget-status--normal"
                                                                        }`}
                                                                >
                                                                    {percentage > 100
                                                                        ? "Budget exceeded"
                                                                        : percentage >= 80
                                                                            ? "Near limit"
                                                                            : "Within budget"}
                                                                </span>
                                                            </div>
                                                        </div>



                                                        <div className="category-budget-summary">
                                                            <div>
                                                                <span>Budget</span>
                                                                <strong>
                                                                    {formatCurrency(budgetAmount)}
                                                                </strong>
                                                            </div>

                                                            <div>
                                                                <span>Spent</span>
                                                                <strong className="budget-summary-spent">
                                                                    {formatCurrency(spent)}
                                                                </strong>
                                                            </div>

                                                            <div>
                                                                <span>
                                                                    {remaining < 0
                                                                        ? "Exceeded By"
                                                                        : "Remaining"}
                                                                </span>
                                                                <strong
                                                                    className={
                                                                        remaining < 0
                                                                            ? "budget-summary-exceeded"
                                                                            : "budget-summary-remaining"
                                                                    }
                                                                >
                                                                    {formatCurrency(Math.abs(remaining))}
                                                                </strong>
                                                            </div>
                                                        </div>

                                                        <div className="budget-progress-section">
                                                            <div className="budget-progress-labels">
                                                                <span>Budget used</span>
                                                                <strong>{percentage.toFixed(1)}%</strong>
                                                            </div>

                                                            <div
                                                                className="budget-progress-track"
                                                                role="progressbar"
                                                                aria-label={`${category?.name ?? "Category"} budget used`}
                                                                aria-valuemin={0}
                                                                aria-valuemax={100}
                                                                aria-valuenow={Math.round(progressPercentage)}
                                                            >
                                                                <div
                                                                    className={`budget-progress-fill ${percentage > 100
                                                                        ? "budget-progress-fill--exceeded"
                                                                        : ""
                                                                        }`}
                                                                    style={{
                                                                        width: `${progressPercentage}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>


                                                        {isAdmin && (
                                                            <div className="category-budget-card-footer">
                                                                <div className="category-budget-action-buttons">
                                                                    <button
                                                                        type="button"
                                                                        className="budget-edit-button"
                                                                        disabled={deletingCategoryBudgetId === budget.id}
                                                                        onClick={() => {
                                                                            setCategoryBudgetFormError(null);
                                                                            setEditingCategoryBudgetId(budget.id);
                                                                            setSelectedCategoryId(budget.category_id);
                                                                            setCategoryBudgetAmount(
                                                                                String(budget.budget_amount)
                                                                            );
                                                                            setShowCategoryBudgetForm(true);
                                                                        }}
                                                                    >
                                                                        Edit
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        className="budget-delete-button"
                                                                        disabled={deletingCategoryBudgetId === budget.id}
                                                                        onClick={() =>
                                                                            handleDeleteCategoryBudget(
                                                                                budget.id,
                                                                                category?.name ?? "this category"
                                                                            )
                                                                        }
                                                                    >
                                                                        {deletingCategoryBudgetId === budget.id
                                                                            ? "Deleting..."
                                                                            : "Delete"}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}

                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>

                                )}
                            </section>
                        )}


                    </div>
                </>
            )}

        </div>
    );
}

export default BudgetManagementPage;
