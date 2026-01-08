import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { expenseService } from "../services/expenseService";
import CategoryChart from "../components/analytics/CategoryChart";
import Layout from "../components/Layout";
import ExpenseList from "../components/ExpenseList";
import ExpenseFilters from "../components/ExpenseFilters";
import { useExpenseAnalytics } from "../hooks/useExpenseAnalytics";
import MonthlyTrendChart from "../components/analytics/MonthlyTrendChart";
import { budgetService } from "../services/budgetService";
import { categoryService } from "../services/categoryService";


const Dashboard = () => {
  const { user, logout } = useAuth();

  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]); // ✅ DB categories
  const [loading, setLoading] = useState(true);

useEffect(() => {
  if (!user?.$id) return;

  categoryService
    .getCategories(user.$id)
    .then(setCategories)
    .catch(console.error);
}, [user?.$id]);

  const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);


  const [filters, setFilters] = useState({
    category: "all",
    month: "all",
  });

  const selectedMonth =
  filters.month === "all" ? null : filters.month;

  useEffect(() => {
      budgetService
        .getBudgetsForMonth(user.$id, selectedMonth)
        .then(setBudgets)
        .catch(console.error);
    }, [user.$id, selectedMonth]);


  // Fetch expenses
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const docs = await expenseService.getExpenses(user.$id);
        setExpenses(docs);
      } catch (err) {
        console.error("Failed to fetch expenses", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [user.$id]);

  // Delete expense
  const handleDelete = useCallback(async (expenseId) => {
  try {
    await expenseService.deleteExpense(expenseId);
    setExpenses((prev) =>
      prev.filter((expense) => expense.$id !== expenseId)
    );
  } catch (err) {
    console.error("Failed to delete expense", err);
  }
}, []);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return (expenses || []).filter((expense) => {
      if (filters.category !== "all" &&
          expense.category !== filters.category) {
        return false;
      }

      if (filters.month !== "all") {
      const d = new Date(expense.date);
      const monthKey = d.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });

      if (monthKey !== filters.month) {
        return false;
      }
    }
      return true;
    });
  }, [expenses, filters]);

  // Analytics (based on filtered data)
  const analytics = useMemo(() => {
    return useExpenseAnalytics(filteredExpenses, budgets, categories);
  }, [filteredExpenses, budgets, categories]);

  const {
    totalAmount,
    byCategory,
    byMonth,
    budgetByCategory,
    insight,
    topCategoryInsight,
    budgetSummaryInsight,
    categoryTrendInsight
  } = analytics;

const categoryOptions = useMemo(() => {
  return [
    { label: "All Categories", value: "all" },
    ...categories.map((c) => ({
      label: c.name,
      value: c.name,
    })),
  ];
}, [categories]);


const monthOptions = useMemo(() => {
  const months = new Set();

  (expenses || []).forEach((e) => {
    const d = new Date(e.date);
    const key = d.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    months.add(key);
  });

  return [
    { label: "All Months", value: "all" },
    ...Array.from(months).map((m) => ({
      label: m,
      value: m,
    })),
  ];
}, [expenses]);


return (
  <Layout>
    {/* ================= Header ================= */}
    <div className="mb-6 animate-[fadeInUp_0.25s_ease-out]">
      <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
        Dashboard
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Track, filter, and analyze your expenses
      </p>
    </div>

    {/* ================= Filters ================= */}
      <div className="mb-8 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
      <ExpenseFilters
        filters={filters}
        onChange={setFilters}
        categories={categoryOptions}
        months={monthOptions}
      />
    </div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
  {/* Total Spent */}
  {loading ? (
<div
  className="
    p-5
    bg-slate-50 dark:bg-slate-900
    border border-slate-100 dark:border-slate-800
    rounded-lg

    transition
    hover:-translate-y-0.5
    hover:shadow-md
    dark:hover:shadow-black/40

    animate-[popIn_0.2s_ease-out]
  "
>
      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
      <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
    </div>
  ) : (
<div
  className="
    p-5
    bg-slate-50 dark:bg-slate-900
    border border-slate-100 dark:border-slate-800
    rounded-lg

    transition
    hover:-translate-y-0.5
    hover:shadow-md
    dark:hover:shadow-black/40

    animate-[popIn_0.2s_ease-out]
  "
>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
        Total Spent
      </p>
      <p className="text-3xl font-semibold text-slate-800 dark:text-slate-100">
        {formatCurrency(totalAmount)}
      </p>
    </div>
  )}

  {/* Category Cards */}
  {loading ? (
    [1, 2, 3].map((i) => (
      <div
        key={i}
        className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg"
      >
        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
        <div className="h-6 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-3" />
        <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </div>
    ))
  ) : (
    Object.entries(byCategory).map(([cat, amt]) => {
      const budget = budgetByCategory?.[cat];

      return (
        <div
          key={cat}
          className="
            p-5
            bg-white dark:bg-slate-900
            border border-slate-100 dark:border-slate-800
            rounded-lg

            transition
            hover:-translate-y-0.5
            hover:shadow-md
            dark:hover:shadow-black/40

            animate-[popIn_0.2s_ease-out]
          "
        >

          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            {cat}
          </p>

          <p className="text-2xl font-medium text-slate-800 dark:text-slate-100">
            {formatCurrency(amt)}
          </p>

          {budget ? (
            <div className="mt-3">
              <div className="h-2 w-full rounded bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className={`h-full ${
                    budget.overBudget
                      ? "bg-red-500 dark:bg-red-600"
                      : "bg-emerald-500 dark:bg-emerald-400"
                  }`}
                  style={{
                    width: `${Math.min(
                      budget.percentUsed,
                      100
                    )}%`,
                  }}
                />
              </div>

              <p
                className={`mt-2 text-sm ${
                  budget.overBudget
                    ? "text-red-600 dark:text-red-400"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {budget.overBudget
                  ? `Over budget by ${formatCurrency(
                      Math.abs(budget.remaining)
                    )}`
                  : `${formatCurrency(
                      budget.remaining
                    )} left of ${formatCurrency(
                      budget.limit
                    )}`}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
              No budget set
            </p>
          )}
        </div>
      );
    })
  )}
</div>

{/* ================= Category Performance ================= */}
<div className="mb-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Category Chart */}
  <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 p-4">
    {loading ? (
      <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
    ) : (
      <CategoryChart data={byCategory} />
    )}
  </div>

  {/* Category Insights */}
  <div className="space-y-4">
    {!loading && topCategoryInsight && (
      <div className="rounded-lg border-l-4 border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-950 p-4 text-sm text-emerald-700 dark:text-emerald-300">
        🏆 {topCategoryInsight}
      </div>
    )}

    {!loading && categoryTrendInsight && (
      <div className="rounded-lg border-l-4 border-slate-500 dark:border-slate-400 bg-slate-50 dark:bg-slate-800 p-4 text-sm text-slate-700 dark:text-slate-300">
        📈 {categoryTrendInsight}
      </div>
    )}
  </div>
</div>

{/* ================= Monthly Trend ================= */}
<div className="mb-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Monthly Chart */}
  <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 p-4">
    {loading ? (
      <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
    ) : (
      <MonthlyTrendChart data={byMonth} />
    )}
  </div>

  {/* Monthly Insights */}
  <div className="space-y-4">
    {!loading && insight && (
      <div className="rounded-lg border-l-4 border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950 p-4 text-sm text-indigo-700 dark:text-indigo-300">
        💡 {insight}
      </div>
    )}

    {!loading && budgetSummaryInsight && (
      <div className="rounded-lg border-l-4 border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950 p-4 text-sm text-red-700 dark:text-red-300">
        ⚠️ {budgetSummaryInsight}
      </div>
    )}
  </div>
</div>

{/* ================= Expenses ================= */}
<h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
  Expenses
</h2>

<div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 p-4">
  {loading ? (
    <ul className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <li
          key={i}
          className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
        >
          <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
          <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </li>
      ))}
    </ul>
  ) : (
    <ExpenseList
      expenses={filteredExpenses}
      onDelete={handleDelete}
    />
  )}
</div>

  </Layout>
);
}

export default Dashboard
