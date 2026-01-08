import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { expenseService } from "../services/expenseService";
import { budgetService } from "../services/budgetService";
import Button from "../components/ui/Button";
import ConfirmModal from "../components/ui/ConfirmModal";
import Layout from "../components/Layout";
import ExpenseForm from "../components/ExpenseForm";
import { useToast } from "../context/ToastContext";
import { categoryService } from "../services/categoryService";

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
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState([]); // already added earlier
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { showToast } = useToast();
  const [reassignTarget, setReassignTarget] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState(null);


useEffect(() => {
  if (!user?.$id) return;

  const loadCategories = async () => {
    try {
      const res = await categoryService.getCategories(user.$id);
      setCategories(res);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  loadCategories();
}, [user?.$id]);


const handleAddCategory = async () => {

 const exists = categories.some(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    ); 

if (exists) {
  showToast(`"${name}" already exists`);
  return;
}

  const name = newCategory.trim();
  if (!name) return;

  try {
    const created = await categoryService.createCategory({
      userId: user.$id,
      name,
      isDefault: false,
    });

    setCategories((prev) => [...prev, created]);
    setNewCategory("");
    showToast(`Category "${name}" added ✅`);
  } catch (err) {
    console.error("Failed to add category", err);
    showToast("Failed to add category ❌");
  }
};

const handleDeleteCategory = async (cat) => {
  if (cat.isDefault) {
    showToast("Default categories can’t be deleted");
    return;
  }

  const inUse = expenses.some(
    (e) => e.category === cat.name
  );

  // If in use, open reassign flow
  if (inUse) {
    setCategoryToDelete(cat);
    setReassignTarget("");
    return;
  }

  // Safe delete (not in use)
  try {
    await categoryService.deleteCategory(cat.$id);
    setCategories((prev) =>
      prev.filter((c) => c.$id !== cat.$id)
    );
    showToast(`Category "${cat.name}" deleted 🗑️`);
  } catch (err) {
    console.error("Failed to delete category", err);
    showToast("Failed to delete category ❌");
  }
};

const confirmReassignAndDelete = async () => {
  if (!categoryToDelete || !reassignTarget) {
    showToast("Select a category first");
    return;
  }

  try {
    setLoading(true);

    // 1. Update all expenses
    const affected = expenses.filter(
      (e) => e.category === categoryToDelete.name
    );

    await Promise.all(
      affected.map((e) =>
        expenseService.updateExpense(e.$id, {
          category: reassignTarget,
        })
      )
    );

    // 2. Delete the category
    await categoryService.deleteCategory(
      categoryToDelete.$id
    );

    // 3. Update UI state
    setExpenses((prev) =>
      prev.map((e) =>
        e.category === categoryToDelete.name
          ? { ...e, category: reassignTarget }
          : e
      )
    );

    setCategories((prev) =>
      prev.filter((c) => c.$id !== categoryToDelete.$id)
    );

    showToast(
      `Moved expenses to "${reassignTarget}" and deleted "${categoryToDelete.name}" ✅`
    );

    setCategoryToDelete(null);
    setReassignTarget("");
  } catch (err) {
    console.error("Reassign failed", err);
    showToast("Failed to reassign expenses ❌");
  } finally {
    setLoading(false);
  }
};


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

  // 🔁 Keep a snapshot for undo
  const deletedExpense = initialData;

  try {
    setLoading(true);
    await expenseService.deleteExpense(expenseId);

    // Optimistic UI update (already correct)
    setExpenses((prev) =>
      prev.filter((e) => e.$id !== expenseId)
    );

    setInitialData(null);
    setIsDirty(false);
    setShowDeleteConfirm(false);

    // ✅ UNDO TOAST
    showToast(
      "Expense deleted",
      {
        actionText: "Undo",
        onAction: async () => {
          try {
            await expenseService.createExpense({
              ...deletedExpense,
              userId: user.$id,
            });

            // Restore in UI
            setExpenses((prev) => [
              deletedExpense,
              ...prev,
            ]);

            showToast("Expense restored ✅");
          } catch (err) {
            console.error("Failed to restore expense", err);
            showToast("Failed to restore expense ❌");
          }
        },
      }
    );

    navigate("/add");
  } catch (err) {
    console.error("Failed to delete expense", err);
    showToast("Failed to delete expense ❌");
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

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-[fadeInUp_0.25s_ease-out]">
      {/* ================= LEFT: PRIMARY WORKBENCH ================= */}
      <div className="lg:col-span-2 space-y-10 order-1 lg:order-0">
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
            categories={categories}
            onChange={() => {
              setIsDirty(true);
              window.__FORM_DIRTY__ = true; // ✅ keep CTA in sync
            }}
            onSubmit={async (data) => {
              setLoading(true);
              window.__FORM_LOADING__ = true;
              try {
                if (isEditMode) {
                  await expenseService.updateExpense(expenseId, data);
                } else {
                  await expenseService.createExpense({
                    ...data,
                    userId: user.$id,
                  });
                }

                // ✅ SUCCESS TOAST
                showToast(
                  isEditMode
                    ? "Expense updated successfully ✅"
                    : "Expense added successfully ✅"
                );

                setIsDirty(false);
                window.__FORM_DIRTY__ = false; // ✅ reset CTA state
                setInitialData(null);
                navigate("/add");
              } catch (err) {
                console.error("Failed to save expense", err);

                showToast(
                  isEditMode
                    ? "Failed to update expense ❌"
                    : "Failed to add expense ❌"
                );
              } finally {
                setLoading(false);
                window.__FORM_LOADING__ = false;
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


        {/* ================= Manage Categories ================= */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Manage Categories
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Create or remove your own expense categories
            </p>
          </div>

          {/* Add category */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="
                flex-1
                rounded-md
                border border-slate-300 dark:border-slate-700
                bg-white dark:bg-slate-900
                px-3 py-2
                text-sm
                text-slate-800 dark:text-slate-100
                focus:outline-none
                focus:ring-2 focus:ring-indigo-500
              "
            />
            <Button onClick={handleAddCategory}>
              Add
            </Button>
          </div>

          {/* Category list */}
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li
                key={cat.$id}
                className="
                  flex items-center justify-between
                  rounded-md
                  border border-slate-200 dark:border-slate-800
                  px-3 py-2
                "
              >
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {cat.name}
                </span>

                <button
                  disabled={cat.isDefault}
                  onClick={() => handleDeleteCategory(cat)}
                  className={`text-sm ${
                    cat.isDefault
                      ? "text-slate-400 cursor-not-allowed"
                      : "text-red-600 hover:text-red-700"
                  }`}
                >
                  {cat.isDefault ? "Default" : "Delete"}
                </button>
              </li>
            ))}
          </ul>
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

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-sm text-slate-700 dark:text-slate-300">
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
              const name = cat.name; // ✅ string category name
              const existing = getBudgetForCategory(name);

              return (
                <div
                  key={cat.$id || name}
                  className="flex items-center justify-between gap-4"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {name}
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
                      budgetInputs[name] ??
                      (existing ? formatCurrency(existing.limit) : "")
                    }
                    onChange={(e) =>
                      setBudgetInputs((p) => ({
                        ...p,
                        [name]: e.target.value,
                      }))
                    }
                    onBlur={async () => {
                      const limit = parseCurrency(
                        budgetInputs[name] ?? ""
                      );
                      if (!limit) return;

                      const key = `${name}-${budgetScope}-${
                        budgetScope === "monthly"
                          ? selectedMonth
                          : "global"
                      }`;

                      if (lastSavedBudgetRef.current[key] === limit)
                        return;

                      lastSavedBudgetRef.current[key] = limit;

                      await budgetService.upsertBudget({
                        userId: user.$id,
                        category: name, // ✅ string, not object
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
      <div className="space-y-6 order-2 lg:order-0">
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

    {categoryToDelete && (
    <ConfirmModal
      open={true}
      title={`Delete "${categoryToDelete.name}"?`}
      message={
        <div className="space-y-3">
          <p>
            This category is used by existing expenses.
            Choose where to move them:
          </p>

          <select
            value={reassignTarget}
            onChange={(e) =>
              setReassignTarget(e.target.value)
            }
            className="
              w-full
              rounded-md
              border border-slate-300
              px-3 py-2
              text-sm
              focus:outline-none
              focus:ring-2 focus:ring-indigo-500
            "
          >
            <option value="">
              Select category
            </option>

            {categories
              .filter(
                (c) =>
                  c.$id !== categoryToDelete.$id
              )
              .map((c) => (
                <option key={c.$id} value={c.name}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>
      }
      confirmText="Reassign & Delete"
      cancelText="Cancel"
      loading={loading}
      onCancel={() => {
        setCategoryToDelete(null);
        setReassignTarget("");
      }}
      onConfirm={confirmReassignAndDelete}
    />
  )}
  </Layout>
);

};

export default AddExpense;
