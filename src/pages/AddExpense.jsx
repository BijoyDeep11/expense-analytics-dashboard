import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { expenseService } from "../services/expenseService";
import { budgetService } from "../services/budgetService";

import Layout from "../components/Layout";
import ExpenseForm from "../components/ExpenseForm";

const categories = ["Food", "Travel", "Shopping", "Other"];

const AddExpense = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { expenseId } = useParams();
  const lastSavedBudgetRef = useRef({});
  const isEditMode = Boolean(expenseId);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [expenses, setExpenses] = useState([]);

  // -----------------------------
  // Load all expenses (RIGHT PANEL)
  // -----------------------------
  useEffect(() => {
    const loadExpenses = async () => {
      const res = await expenseService.getExpenses(user.$id);
      setExpenses(res.documents);
    };
    loadExpenses();
  }, [user.$id]);

  // -----------------------------
  // Load expense into form (EDIT)
  // -----------------------------
  useEffect(() => {
    if (!expenseId) {
      setInitialData(null);
      return;
    }

    const expense = expenses.find((e) => e.$id === expenseId);
    if (expense) setInitialData(expense);
  }, [expenseId, expenses]);


  useEffect(() => {
  if (isEditMode && initialData) {
    setIsDirty(true);
  }
}, [initialData, isEditMode]);


  // -----------------------------
  // Budget state (UNCHANGED)
  // -----------------------------
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

  useEffect(() => {
    budgetService
      .getBudgets(user.$id)
      .then(setBudgets)
      .catch(console.error);
  }, [user.$id]);

  const getBudgetForCategory = (category) =>
    budgets.find((b) => b.category === category && b.month === null);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  const parseCurrency = (value) =>
    Number(value.replace(/[₹,]/g, "")) || 0;


  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* ================= LEFT: ADD / EDIT FORM ================= */}
        <div>
          <h2 className="text-xl font-semibold mb-6">
            {isEditMode ? "Edit Expense" : "Add Expense"}
          </h2>

          {isEditMode && initialData && (
            <p className="text-sm text-slate-500 mb-4">
              Editing: <span className="font-medium">{initialData.title}</span>
            </p>
          )}

          <ExpenseForm
            loading={loading}
            initialData={initialData}
            onSubmit={async (data) => {
              setLoading(true);
              try {
                if (isEditMode) {
                  await expenseService.updateExpense(expenseId, data);
                } else {
                  await expenseService.createExpense({
                    ...data,
                    userId: user.$id,
                  });
                }
                setIsDirty(false);
                setInitialData(null);
                navigate("/add");
              } catch (err) {
                console.error("Failed to save expense", err);
              } finally {
                setLoading(false);
              }
            }}
          />


          {/* ---------- Budget UI (UNCHANGED) ---------- */}
          <div className="mt-10 max-w-md">
            <label className="block text-sm font-medium mb-2">
              Budget Type
            </label>

            <div className="flex gap-4 text-sm">
              <label>
                <input
                  type="radio"
                  checked={budgetScope === "global"}
                  onChange={() => setBudgetScope("global")}
                />{" "}
                Global
              </label>

              <label>
                <input
                  type="radio"
                  checked={budgetScope === "monthly"}
                  onChange={() => setBudgetScope("monthly")}
                />{" "}
                Monthly override
              </label>
            </div>
          </div>

          <div className="mt-6 max-w-md rounded-lg border bg-white p-5">
            <h3 className="mb-4 font-semibold">
              Manage Budgets (Optional)
            </h3>

            {categories.map((cat) => {
              const existing = getBudgetForCategory(cat);

              return (
                <div key={cat} className="flex justify-between mb-3">
                  <span>{cat}</span>
                  <input
                    className="w-28 border px-2 py-1 text-right"
                    placeholder="₹5000"
                    value={
                      budgetInputs[cat] ??
                      (existing ? formatCurrency(existing.limit) : "")
                    }
                    onChange={(e) =>
                      setBudgetInputs((p) => ({
                        ...p,
                        [cat]: e.target.value,
                      }))
                    }
                    onBlur={async () => {
                    const limit = parseCurrency(budgetInputs[cat] ?? "");
                    if (!limit) return;

                    const key = `${cat}-${budgetScope}-${budgetScope === "monthly" ? selectedMonth : "global"}`;

                    // 🛑 Prevent duplicate save
                    if (lastSavedBudgetRef.current[key] === limit) return;

                    lastSavedBudgetRef.current[key] = limit;

                    await budgetService.upsertBudget({
                      userId: user.$id,
                      category: cat,
                      limit,
                      month:
                        budgetScope === "monthly"
                          ? selectedMonth
                          : null,
                    });

                    const updated = await budgetService.getBudgets(user.$id);
                    setBudgets(updated);
                  }}

                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= RIGHT: EDIT EXPENSE LIST ================= */}
        <div>
          <h2 className="text-xl font-semibold mb-6">
            Edit Existing Expense
          </h2>

          {expenses.length === 0 ? (
            <p className="text-sm text-slate-400">
              No expenses yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {expenses.map((expense) => (
                <li
                  key={expense.$id}
                  onClick={() => {
                    if (isDirty) {
                      const confirmLeave = window.confirm(
                        "You have unsaved changes. Discard them and continue?"
                      );
                      if (!confirmLeave) return;
                    }

                    navigate(`/add/${expense.$id}`);
                  }}
                  className={`cursor-pointer rounded-lg border p-4 bg-white hover:bg-slate-50 ${
                    expenseId === expense.$id
                      ? "border-indigo-500"
                      : "border-slate-200"
                  }`}
                >
                  <p className="font-medium">{expense.title}</p>
                  <p className="text-sm text-slate-500">
                    ₹{expense.amount} • {expense.category}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AddExpense;
