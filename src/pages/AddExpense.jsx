import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { expenseService } from "../services/expenseService";
import { budgetService } from "../services/budgetService";
import Button from "../components/ui/Button";
import ConfirmModal from "../components/ui/ConfirmModal";
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);


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
  setIsDirty(false);
}, [expenseId]);


const handleDeleteExpense = () => {
  setShowDeleteConfirm(true);
};

const confirmDeleteExpense = async () => {
  if (!expenseId) return;

  try {
    setLoading(true);
    await expenseService.deleteExpense(expenseId);

    setExpenses((prev) =>
      prev.filter((e) => e.$id !== expenseId)
    );

    setInitialData(null);
    setIsDirty(false);
    setShowDeleteConfirm(false);

    navigate("/add");
  } catch (err) {
    console.error("Failed to delete expense", err);
  } finally {
    setLoading(false);
  }
};



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
  budgets.find(
    (b) =>
      b.category === category &&
      (budgetScope === "monthly"
        ? b.month === selectedMonth
        : b.month === null)
  );


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
    {/* ================= PAGE HEADER ================= */}
    <div className="mb-8">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        {isEditMode ? "Edit Expense" : "Add Expense"}
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {isEditMode
          ? "Update details or delete this expense"
          : "Log a new expense and manage budgets"}
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* ================= LEFT: PRIMARY WORKBENCH ================= */}
      <div className="lg:col-span-2 space-y-10">
        {/* ---------- Expense Form Card ---------- */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          {isEditMode && initialData && (
            <div className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              Editing:{" "}
              <span className="font-medium text-slate-800 dark:text-slate-100">
                {initialData.title}
              </span>
            </div>
          )}

          <ExpenseForm
            loading={loading}
            initialData={initialData}
            onChange={() => setIsDirty(true)}
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
            extraAction={
              isEditMode && (
                <Button
                  type="button"
                  bgColor="bg-red-500 dark:bg-red-600"
                  loading={loading}
                  onClick={handleDeleteExpense}
                >
                  Delete Expense
                </Button>
              )
            }
          />
        </div>

        {/* ---------- Budget Controls ---------- */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Manage Budgets
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Optional limits to help control spending
            </p>
          </div>

          {/* Budget Scope */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Budget Type
            </label>

            <div className="flex gap-6 text-sm text-slate-700 dark:text-slate-300">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={budgetScope === "global"}
                  onChange={() => setBudgetScope("global")}
                />
                Global
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={budgetScope === "monthly"}
                  onChange={() => setBudgetScope("monthly")}
                />
                Monthly override
              </label>
            </div>
          </div>

          {/* Budget Inputs */}
          <div className="space-y-3">
            {categories.map((cat) => {
              const existing = getBudgetForCategory(cat);

              return (
                <div
                  key={cat}
                  className="flex items-center justify-between gap-4"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {cat}
                  </span>

                  <input
                    className="
                      w-28
                      rounded-md
                      border border-slate-300 dark:border-slate-700
                      bg-white dark:bg-slate-900
                      px-2 py-1
                      text-right text-sm
                      text-slate-800 dark:text-slate-100
                      focus:outline-none
                      focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400
                    "
                    placeholder="₹5000"
                    value={
                      budgetInputs[cat] ??
                      (existing
                        ? formatCurrency(existing.limit)
                        : "")
                    }
                    onChange={(e) =>
                      setBudgetInputs((p) => ({
                        ...p,
                        [cat]: e.target.value,
                      }))
                    }
                    onBlur={async () => {
                      const limit = parseCurrency(
                        budgetInputs[cat] ?? ""
                      );
                      if (!limit) return;

                      const key = `${cat}-${budgetScope}-${budgetScope === "monthly" ? selectedMonth : "global"}`;

                      if (lastSavedBudgetRef.current[key] === limit)
                        return;

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

                      const updated =
                        await budgetService.getBudgets(user.$id);
                      setBudgets(updated);
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= RIGHT: CONTEXT PANEL ================= */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Existing Expenses
        </h2>

        {expenses.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500">
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
                className={`
                  cursor-pointer
                  rounded-lg
                  border
                  p-4
                  transition
                  hover:bg-slate-50 dark:hover:bg-slate-800
                  ${
                    expenseId === expense.$id
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  }
                `}
              >
                <p className="font-medium text-slate-800 dark:text-slate-100">
                  {expense.title}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  ₹{expense.amount} • {expense.category}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>

    {/* ================= DELETE CONFIRM ================= */}
    <ConfirmModal
      open={showDeleteConfirm}
      title="Delete expense?"
      message="This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      loading={loading}
      onCancel={() => setShowDeleteConfirm(false)}
      onConfirm={confirmDeleteExpense}
    />
  </Layout>
);

};

export default AddExpense;
