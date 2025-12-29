import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { expenseService } from "../services/expenseService";
import { budgetService } from "../services/budgetService";

import Layout from "../components/Layout";
import ExpenseForm from "../components/ExpenseForm";

const categories = ["Food", "Travel", "Shopping", "Other"];

const AddExpense = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  // 🔹 Budget state
  const [budgets, setBudgets] = useState([]);
  const [budgetInputs, setBudgetInputs] = useState({});
  const [budgetScope, setBudgetScope] = useState("global");

  const [selectedMonth, setSelectedMonth] = useState(() => {
  const now = new Date();
  return now.toLocaleString("default", {
    month: "short",
    year: "numeric",
  });
});


  // 🔹 Currency helpers
  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  const parseCurrency = (value) =>
    Number(value.replace(/[₹,]/g, "")) || 0;

  // 🔹 Fetch budgets (GLOBAL only for now)
  useEffect(() => {
    budgetService
      .getBudgets(user.$id)
      .then(setBudgets)
      .catch(console.error);
  }, [user.$id]);

  const getBudgetForCategory = (category) =>
    budgets.find(
      (b) => b.category === category && b.month === null
    );

  return (
  <Layout>
    <h2 className="text-xl font-semibold mb-6">
      Add Expense
    </h2>

    {/* Expense Form */}
    <ExpenseForm
      loading={loading}
      onSubmit={async (data) => {
        setLoading(true);
        try {
          await expenseService.createExpense({
            ...data,
            userId: user.$id,
          });
          navigate("/");
        } catch (err) {
          console.error("Failed to add expense", err);
        } finally {
          setLoading(false);
        }
      }}
    />

    {/* -------------------- */}
    {/* Budget Scope Toggle */}
    {/* -------------------- */}
    <div className="mt-10 max-w-md">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Budget Type
      </label>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            value="global"
            checked={budgetScope === "global"}
            onChange={() => setBudgetScope("global")}
          />
          Global (every month)
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            value="monthly"
            checked={budgetScope === "monthly"}
            onChange={() => setBudgetScope("monthly")}
          />
          Monthly override
        </label>
      </div>

      {budgetScope === "monthly" && (
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="mt-3 w-40 rounded border border-slate-300 px-2 py-1 text-sm"
        >
          {Array.from({ length: 12 }).map((_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const label = d.toLocaleString("default", {
              month: "short",
              year: "numeric",
            });
            return (
              <option key={label} value={label}>
                {label}
              </option>
            );
          })}
        </select>
      )}
    </div>

    {/* -------------------- */}
    {/* Manage Budgets */}
    {/* -------------------- */}
    <div className="mt-6 max-w-md rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="mb-4 text-lg font-semibold text-slate-800">
        Manage Budgets (Optional)
      </h3>

      <div className="space-y-4">
        {categories.map((cat) => {
          const existing = getBudgetForCategory(cat);

          return (
            <div
              key={cat}
              className="flex items-center justify-between gap-4"
            >
              <span className="text-sm text-slate-700">
                {cat}
              </span>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="₹5,000"
                  value={
                    budgetInputs[cat] ??
                    (existing
                      ? formatCurrency(existing.limit)
                      : "")
                  }
                  onChange={(e) =>
                    setBudgetInputs((prev) => ({
                      ...prev,
                      [cat]: e.target.value,
                    }))
                  }
                  onBlur={async () => {
                    const limit = parseCurrency(
                      budgetInputs[cat] ?? ""
                    );
                    if (!limit) return;

                    await budgetService.upsertBudget({
                      userId: user.$id,
                      category: cat,
                      limit,
                      month:
                        budgetScope === "monthly"
                          ? selectedMonth
                          : null,
                    });

                    const updated =
                      await budgetService.getBudgetsForMonth(
                        user.$id,
                        budgetScope === "monthly"
                          ? selectedMonth
                          : null
                      );
                    setBudgets(updated);
                  }}
                  className="w-28 rounded border border-slate-300 px-2 py-1 text-sm text-right"
                />

                {existing && (
                  <button
                    type="button"
                    className="text-xs text-slate-400 hover:text-red-600"
                    title="Reset budget"
                    onClick={async () => {
                      await budgetService.deleteBudget(
                        existing.$id
                      );

                      const updated =
                        await budgetService.getBudgetsForMonth(
                          user.$id,
                          budgetScope === "monthly"
                            ? selectedMonth
                            : null
                        );
                      setBudgets(updated);

                      setBudgetInputs((prev) => ({
                        ...prev,
                        [cat]: "",
                      }));
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Budgets are saved automatically when you leave the field.
      </p>
    </div>
  </Layout>
);
}

export default AddExpense;
