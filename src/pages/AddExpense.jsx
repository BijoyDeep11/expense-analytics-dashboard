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
  const [categories, setCategories] = useState([]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { showToast } = useToast();

  const [showReassignSelect, setShowReassignSelect] = useState(false);

  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reassignTo, setReassignTo] = useState("");

  // -----------------------------
  // Load categories
  // -----------------------------
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

  // -----------------------------
  // Add category
  // -----------------------------
  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;

    const exists = (categories || []).some(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      showToast(`"${name}" already exists`);
      return;
    }

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

  // -----------------------------
  // ENTRY POINT: delete category
  // -----------------------------
  const handleDeleteCategory = async (cat) => {
    if (cat.isDefault) {
      showToast("Default categories can’t be deleted");
      return;
    }

    const inUse = (expenses || []).some((e) => e.category === cat.name);

    if (inUse) {
      // open 3-option modal
      setCategoryToDelete(cat);
      setReassignTo("");
      setShowDeleteModal(true);
      return;
    }

    // safe delete
    try {
      await categoryService.deleteCategory(cat.$id);
      setCategories((prev) =>
        (prev || []).filter((c) => c.$id !== cat.$id)
      );
      showToast(`Category "${cat.name}" deleted 🗑️`);
    } catch (err) {
      console.error("Failed to delete category", err);
      showToast("Failed to delete category ❌");
    }
  };

  // -----------------------------
  // DELETE ANYWAY + UNDO
  // -----------------------------
  const handleDeleteAnywayCategory = async () => {
    if (!categoryToDelete) return;

    try {
      const deletedExpenses =
        await expenseService.deleteExpensesByCategory(
          categoryToDelete.name
        );

      await categoryService.deleteCategory(categoryToDelete.$id);

      setExpenses((prev) =>
        (prev || []).filter(
          (e) => e.category !== categoryToDelete.name
        )
      );

      setCategories((prev) =>
        (prev || []).filter(
          (c) => c.$id !== categoryToDelete.$id
        )
      );

      const deletedCategory = categoryToDelete;
      setCategoryToDelete(null);

      showToast(`Category "${deletedCategory.name}" deleted`, {
        actionText: "Undo",
        onAction: async () => {
          try {
            const restoredCat =
              await categoryService.createCategory({
                userId: user.$id,
                name: deletedCategory.name,
                isDefault: deletedCategory.isDefault,
              });

            await Promise.all(
              deletedExpenses.map((e) =>
                expenseService.createExpense({
                  title: e.title,
                  amount: e.amount,
                  category: e.category,
                  date: e.date,
                  userId: user.$id,
                })
              )
            );

            setCategories((prev) => [
              restoredCat,
              ...prev,
            ]);

            setExpenses((prev) => [
              ...deletedExpenses,
              ...prev,
            ]);

            showToast("Category restored ✅");
          } catch (err) {
            console.error("Undo failed", err);
            showToast("Failed to restore ❌");
          }
        },
      });
    } catch (err) {
      console.error("Delete anyway failed", err);
      showToast("Failed to delete category ❌");
    } finally {
      setShowDeleteModal(false);
    }
  };

  // -----------------------------
  // REASSIGN & DELETE
  // -----------------------------
  const confirmReassignAndDelete = async () => {
    if (!categoryToDelete || !reassignTo) {
      showToast("Select a category first");
      return;
    }

    try {
      setLoading(true);

      const affected = (expenses || []).filter(
        (e) => e.category === categoryToDelete.name
      );

      await Promise.all(
        affected.map((e) =>
          expenseService.updateExpense(e.$id, {
            category: reassignTo,
          })
        )
      );

      await categoryService.deleteCategory(categoryToDelete.$id);

      setExpenses((prev) =>
        (prev || []).map((e) =>
          e.category === categoryToDelete.name
            ? { ...e, category: reassignTo }
            : e
        )
      );

      setCategories((prev) =>
        (prev || []).filter((c) => c.$id !== categoryToDelete.$id)
      );

      showToast(
        `Moved expenses to "${reassignTo}" and deleted "${categoryToDelete.name}" ✅`
      );

      setCategoryToDelete(null);
      setReassignTo("");
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Reassign failed", err);
      showToast("Failed to reassign expenses ❌");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Load all expenses
  // -----------------------------
  useEffect(() => {
  const loadExpenses = async () => {
    const docs = await expenseService.getExpenses(user.$id);
    setExpenses(docs);
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

  // -----------------------------
  // Delete single expense
  // -----------------------------
  const handleDeleteExpense = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteExpense = async () => {
    if (!expenseId) return;

    const deletedExpense = initialData;

    try {
      setLoading(true);
      await expenseService.deleteExpense(expenseId);

      setExpenses((prev) =>
        (prev || []).filter((e) => e.$id !== expenseId)
      );

      setInitialData(null);
      setIsDirty(false);
      setShowDeleteConfirm(false);

      showToast("Expense deleted", {
        actionText: "Undo",
        onAction: async () => {
          try {
            await expenseService.createExpense({
              ...deletedExpense,
              userId: user.$id,
            });

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
      });

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
  const [budgetScope, setBudgetScope] = useState("monthly"); 
// weekly | monthly | quarterly | yearly

const [periodKey, setPeriodKey] = useState(() => {
  const d = new Date();
  return d.toLocaleString("default", {
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
      b.periodType === budgetScope &&
      b.periodKey === periodKey
  );


  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  const parseCurrency = (value = "") =>
    Number(String(value).replace(/[₹,]/g, "")) || 0;

  // ============================================================
  // =========================== UI =============================
  // ============================================================
  return (
    <Layout>
      {/* PAGE HEADER */}
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
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white dark:bg-slate-900 rounded-xl border p-6">
            {isEditMode && initialData && (
              <div className="mb-4 text-sm text-slate-500">
                Editing:{" "}
                <span className="font-medium">
                  {initialData.title}
                </span>
              </div>
            )}

            <ExpenseForm
            loading={loading}
            initialData={initialData}
            categories={categories}

            onCreateCategory={async (name) => {
              try {
                const created = await categoryService.createCategory({
                  userId: user.$id,
                  name,
                  isDefault: false,
                });

                // keep UI in sync
                setCategories((prev) => [...prev, created]);

                showToast(`Category "${name}" added ✅`);

                return created;   // 🔑 this is critical
              } catch (err) {
                console.error("Failed to create category", err);
                showToast("Failed to create category ❌");
                throw err;
              }
            }}

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

                showToast(
                  isEditMode
                    ? "Expense updated successfully ✅"
                    : "Expense added successfully ✅"
                );

                setIsDirty(false);
                setInitialData(null);
                navigate("/add");
              } catch (err) {
                console.error("Failed to save expense", err);
                showToast("Save failed ❌");
              } finally {
                setLoading(false);
              }
            }}

            extraAction={
              isEditMode && (
                <Button
                  type="button"
                  bgColor="bg-red-500"
                  loading={loading}
                  onClick={handleDeleteExpense}
                >
                  Delete Expense
                </Button>
              )
            }
          />
          </div>

          {/* MANAGE CATEGORIES */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border p-6 space-y-4">
            <h3 className="text-lg font-semibold">
              Manage Categories
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New category name"
                value={newCategory}
                onChange={(e) =>
                  setNewCategory(e.target.value)
                }
                className="flex-1 rounded-md border px-3 py-2"
              />
              <Button onClick={handleAddCategory}>
                Add
              </Button>
            </div>

            <ul className="space-y-2">
              {(categories || []).map((cat) => (
                <li
                  key={cat.$id}
                  className="flex justify-between border px-3 py-2 rounded"
                >
                  <span>{cat.name}</span>
                  <button
                  disabled={cat.isDefault}
                  onClick={() => {
                    if (cat.isDefault) {
                      showToast("Default categories can’t be deleted");
                      return;
                    }

                    setCategoryToDelete(cat);
                    setReassignTo("");
                    setShowDeleteModal(true);
                  }}
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
        </div>

        {/* RIGHT */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Existing Expenses
          </h2>

          {(expenses || []).length === 0 ? (
            <p className="text-sm text-slate-400">
              No expenses yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {(expenses || []).map((expense) => (
                <li
                  key={expense.$id}
                  onClick={() =>
                    navigate(`/add/${expense.$id}`)
                  }
                  className="cursor-pointer border p-4 rounded"
                >
                  <p className="font-medium">
                    {expense.title}
                  </p>
                  <p className="text-sm text-slate-500">
                    ₹{expense.amount} •{" "}
                    {expense.category}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ================= BUDGET CONTROLS ================= */}
      <div className="mt-6 space-y-4 max-w-2xl">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Set Budgets
        </h4>

        {/* Scope Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Scope:
          </span>

          <div className="flex rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700">
            {["weekly", "monthly", "quarterly", "yearly"].map((scope) => (
              <button
                key={scope}
                type="button"
                onClick={() => setBudgetScope(scope)}
                className={`px-3 py-1.5 text-sm transition ${
                  budgetScope === scope
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                {scope[0].toUpperCase() + scope.slice(1)}
              </button>
            ))}
          </div>


          {/* Month selector only when monthly */}
          {budgetScope !== "yearly" && (
            <select
              value={periodKey}
              onChange={(e) => setPeriodKey(e.target.value)}
              className="
                ml-3 rounded-md border
                border-slate-300 dark:border-slate-700
                bg-white dark:bg-slate-900
                px-2 py-1.5 text-sm
              "
            >

              {budgetScope === "monthly" &&
                Array.from({ length: 12 }).map((_, i) => {
                  const d = new Date();
                  d.setMonth(d.getMonth() - i);

                  const key = d.toLocaleString("default", {
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  );
                })}

              {budgetScope === "quarterly" &&
                ["Q1", "Q2", "Q3", "Q4"].map((q) => {
                  const yr = new Date().getFullYear();
                  const key = `${q}-${yr}`;
                  return (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  );
                })}

              {budgetScope === "weekly" &&
                Array.from({ length: 8 }).map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - i * 7);

                  const week = `W${Math.ceil(
                    d.getDate() / 7
                  )}-${d.getFullYear()}`;

                  return (
                    <option key={week} value={week}>
                      {week}
                    </option>
                  );
                })}
                </select>
                  )}
              </div>

        {/* Category Budgets */}
        <div className="space-y-3 pt-2">
          {(categories || []).length === 0 ? (
            <p className="text-sm text-slate-400">
              No categories yet.
            </p>
          ) : (
            (categories || []).map((cat) => {
              const budget = getBudgetForCategory(cat.name);
              const inputKey = `${cat.name}-${budgetScope}-${periodKey}`;

              return (
                <div
                  key={cat.$id}
                  className="
                    flex items-center gap-3
                    rounded-lg border
                    border-slate-200 dark:border-slate-800
                    px-3 py-2
                    max-w-xl
                  "
                >
                  {/* Category name */}
                  <div className="w-28 text-sm font-medium text-slate-800 dark:text-slate-100">
                    {cat.name}
                  </div>

                  {/* Budget input */}
                  <input
                    type="text"
                    placeholder="₹0"
                    value={budgetInputs[inputKey] ?? (budget ? formatCurrency(budget.limit) : "")}
                    onChange={(e) =>
                      setBudgetInputs((prev) => ({
                        ...prev,
                        [inputKey]: e.target.value,
                      }))
                    }
                    className="
                      flex-1
                      rounded-md border
                      border-slate-300 dark:border-slate-700
                      bg-white dark:bg-slate-900
                      px-2 py-1.5
                      text-sm
                    "
                  />

                  {/* Save button */}
                  <button
                    onClick={async () => {
                      const raw = budgetInputs[inputKey];
                      const limit = parseCurrency(raw);

                      if (!limit) {
                        showToast("Enter a valid amount");
                        return;
                      }

                      try {
                        await budgetService.upsertBudget({
                          userId: user.$id,
                          category: cat.name,
                          limit,
                          periodType: budgetScope,
                          periodKey,
                        });
                        
                        const refreshed =
                          await budgetService.getBudgets(user.$id);
                        setBudgets(refreshed);

                        showToast(
                          `Budget saved for ${cat.name} ✅`
                        );
                      } catch (err) {
                        console.error("Failed to save budget", err);
                        showToast("Failed to save budget ❌");
                      }
                    }}
                    className="
                      rounded-md
                      bg-indigo-600
                      px-3 py-1.5
                      text-sm text-white
                      hover:bg-indigo-700
                      transition
                    "
                  >
                    {budget ? "Update" : "Set"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>


      {/* DELETE EXPENSE CONFIRM */}
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

      {/* CATEGORY DELETE MODAL (SINGLE SOURCE OF TRUTH) */}
      {showDeleteModal && categoryToDelete && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div
      className="
        w-full max-w-md
        rounded-2xl
        bg-white dark:bg-slate-900
        border border-slate-200 dark:border-slate-800
        p-6
        space-y-5
        shadow-2xl
      "
    >
      {/* Title */}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Delete “{categoryToDelete.name}”?
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-600 dark:text-slate-400">
        This category is used by existing expenses.
        Choose what should happen to them.
      </p>

      {/* Reassign dropdown – ONLY when user chooses that path */}
      {showReassignSelect && (
        <select
          value={reassignTo}
          onChange={(e) => setReassignTo(e.target.value)}
          className="
            w-full
            rounded-lg
            border
            border-slate-300 dark:border-slate-700
            bg-white dark:bg-slate-900
            px-3 py-2.5
            text-sm
            text-slate-800 dark:text-slate-100
            focus:outline-none
            focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400
          "
        >
          <option value="">Select category</option>
          {(categories || [])
            .filter((c) => c.name !== categoryToDelete.name)
            .map((c) => (
              <option key={c.$id} value={c.name}>
                {c.name}
              </option>
            ))}
        </select>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {/* Cancel */}
        <button
          onClick={() => {
            setShowDeleteModal(false);
            setShowReassignSelect(false);
            setReassignTo("");
          }}
          className="
            flex-1 h-11 rounded-lg
            border border-slate-300 dark:border-slate-700
            bg-slate-100 dark:bg-slate-800
            text-slate-700 dark:text-slate-200
            text-sm font-medium
            transition
            hover:bg-slate-200 dark:hover:bg-slate-700
          "
        >
          Cancel
        </button>

        {/* Reassign & Delete (MIDDLE) */}
        <button
          onClick={() => setShowReassignSelect(true)}
          className="
            flex-1 h-11 rounded-lg
            bg-indigo-600
            text-white
            text-sm font-medium
            transition
            hover:bg-indigo-700
          "
        >
          Reassign & Delete
        </button>

        {/* Delete Anyway (LAST, danger) */}
        <button
          onClick={async () => {
            await handleDeleteAnywayCategory();
          }}
          className="
            flex-1 h-11 rounded-lg
            bg-red-600
            text-white
            text-sm font-medium
            transition
            hover:bg-red-700
          "
        >
          Delete Permanently
        </button>
      </div>

      {/* Final confirm for reassignment */}
      {showReassignSelect && (
        <div className="pt-2">
          <button
            disabled={!reassignTo}
            onClick={async () => {
              await confirmReassignAndDelete();
            }}
            className="
              w-full h-11 rounded-lg
              bg-indigo-700
              text-white
              text-sm font-medium
              transition
              hover:bg-indigo-800
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            Confirm Reassign & Delete
          </button>
        </div>
      )}
    </div>
  </div>
)}

    </Layout>
  );
};

export default AddExpense;
