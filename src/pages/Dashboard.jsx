import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { expenseService } from "../services/expenseService";
import CategoryChart from "../components/analytics/CategoryChart";
import Layout from "../components/Layout";
import ExpenseList from "../components/ExpenseList";
import ExpenseFilters from "../components/ExpenseFilters";
import { useExpenseAnalytics } from "../hooks/useExpenseAnalytics";
import MonthlyTrendChart from "../components/analytics/MonthlyTrendChart";
import { budgetService } from "../services/budgetService";


const Dashboard = () => {
  const { user, logout } = useAuth();

  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const now = new Date();
const selectedMonth =
  filters.month === "all"
    ? null
    : new Date(
        now.getFullYear(),
        Number(filters.month)
      ).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });


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
        const res = await expenseService.getExpenses(user.$id);
        setExpenses(res.documents);
      } catch (err) {
        console.error("Failed to fetch expenses", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [user.$id]);

  // Delete expense
  const handleDelete = async (expenseId) => {
    try {
      await expenseService.deleteExpense(expenseId);
      setExpenses((prev) =>
        prev.filter((expense) => expense.$id !== expenseId)
      );
    } catch (err) {
      console.error("Failed to delete expense", err);
    }
  };

  // Derived categories
  const categories = useMemo(() => {
    return [...new Set(expenses.map((e) => e.category))];
  }, [expenses]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const categoryMatch =
        filters.category === "all" || exp.category === filters.category;

      const monthMatch =
        filters.month === "all" ||
        new Date(exp.date).getMonth() === Number(filters.month);

      return categoryMatch && monthMatch;
    });
  }, [expenses, filters]);

  // Analytics (based on filtered data)
  const {
  totalAmount,
  byCategory,
  byMonth,
  budgetByCategory,
  insight,
  topCategoryInsight
} = useExpenseAnalytics(filteredExpenses, budgets);

  return (
  <Layout>
    {/* Header */}
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-slate-800">
        Dashboard
      </h1>
      <p className="text-sm text-slate-500">
        Track, filter, and analyze your expenses
      </p>
    </div>

    {/* Filters */}
    <div className="mb-8 p-4 bg-white rounded-lg border border-slate-100">
      <ExpenseFilters
        filters={filters}
        onChange={setFilters}
        categories={categories}
      />
    </div>

    {/* Analytics Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
      {/* Total */}
      <div className="p-5 bg-slate-50 border border-slate-100 rounded-lg">
        <p className="text-sm text-slate-500 mb-1">
          Total Spent
        </p>
        <p className="text-3xl font-semibold text-slate-800">
          {formatCurrency(totalAmount)}
        </p>
      </div>

      {/* Category Cards + Budgets */}
      {Object.entries(byCategory).map(([cat, amt]) => {
        const budget = budgetByCategory?.[cat];

        return (
          <div
            key={cat}
            className="p-5 bg-white border border-slate-100 rounded-lg"
          >
            <p className="text-sm text-slate-500 mb-1">
              {cat}
            </p>

            <p className="text-2xl font-medium text-slate-800">
              {formatCurrency(amt)}
            </p>

            {/* Budget UI */}
            {budget ? (
              <div className="mt-3">
                {/* Progress bar */}
                <div className="h-2 w-full rounded bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full ${
                      budget.overBudget
                        ? "bg-red-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${budget.percentUsed}%` }}
                  />
                </div>

                {/* Budget text */}
                <p
                  className={`mt-2 text-sm ${
                    budget.overBudget
                      ? "text-red-600"
                      : "text-slate-600"
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
              <p className="mt-2 text-sm text-slate-400">
                No budget set
              </p>
            )}
          </div>
        );
      })}
    </div>

    {/* Insights */}
    {insight && (
      <div className="mb-4 rounded-lg border-l-4 border-indigo-500 bg-indigo-50 p-4 text-sm text-indigo-700">
        💡 {insight}
      </div>
    )}

    {topCategoryInsight && (
      <div className="mb-6 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-4 text-sm text-emerald-700">
        🏆 {topCategoryInsight}
      </div>
    )}

    {/* Charts */}
    <CategoryChart data={byCategory} />
    <MonthlyTrendChart data={byMonth} />

    {/* Expenses */}
    {loading ? (
      <p>Loading expenses...</p>
    ) : (
      <>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          Expenses
        </h2>

        <div className="bg-white rounded-lg border border-slate-100 p-4">
          <ExpenseList
            expenses={filteredExpenses}
            onDelete={handleDelete}
          />
        </div>
      </>
    )}
  </Layout>
);
}

export default Dashboard
