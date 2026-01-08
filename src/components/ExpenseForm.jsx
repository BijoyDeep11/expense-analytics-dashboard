import { useState, useEffect, useRef } from "react";
import Input from "./ui/Input";
import Select from "./ui/Select";
import Button from "./ui/Button";

const ExpenseForm = ({
  initialData = null,
  onSubmit,
  loading,
  onChange,
  extraAction,
  categories = [],
  onCreateCategory, // ✅ new
}) => {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
  });

  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const createInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        amount: initialData.amount || "",
        category: initialData.category || "",
        date: initialData.date || "",
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (showCreateCategory) {
      setTimeout(() => createInputRef.current?.focus(), 50);
    }
  }, [showCreateCategory]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    onChange?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      amount: Number(form.amount),
    });
  };

  // ---------------------------
  // Create category handler
  // ---------------------------
  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;

    try {
      const created = await onCreateCategory(name);

      // auto select new category
      setForm((f) => ({
        ...f,
        category: created.name,
      }));

      setNewCategoryName("");
      setShowCreateCategory(false);
    } catch (err) {
      console.error("Failed to create category", err);
    }
  };

  const hasCategories = categories.length > 0;

  const selectOptions = hasCategories
    ? [
        ...categories.map((c) => ({
          label: c.name,
          value: c.name,
        })),
        { label: "+ Create new category…", value: "__create__" },
      ]
    : [{ label: "+ Create your first category…", value: "__create__" }];

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-base">
      <Input
        label="Title"
        name="title"
        value={form.title}
        onChange={handleChange}
        required
      />

      <Input
        label="Amount"
        type="number"
        name="amount"
        value={form.amount}
        onChange={handleChange}
        required
      />

      {/* ================= CATEGORY ================= */}
      <div className="relative">
        <Select
          label="Category"
          name="category"
          value={form.category}
          onChange={(e) => {
            if (e.target.value === "__create__") {
              setShowCreateCategory(true);
            } else {
              handleChange(e);
            }
          }}
          required
          options={selectOptions}
        />

        {/* --- Create Category Popover --- */}
        {showCreateCategory && (
          <div
            className="
              absolute
              left-0
              right-0
              mt-2
              rounded-lg
              border border-slate-200 dark:border-slate-700
              bg-white dark:bg-slate-900
              p-3
              shadow-lg
              z-20
              animate-[fadeInUp_0.15s_ease-out]
            "
          >
            <p className="text-sm font-medium mb-2">
              Create new category
            </p>

            <div className="flex items-center gap-2">
              <input
                ref={createInputRef}
                type="text"
                value={newCategoryName}
                onChange={(e) =>
                  setNewCategoryName(e.target.value)
                }
                placeholder="e.g. Work, Loan, Home"
                className="
                  flex-1
                  rounded-md
                  border border-slate-300 dark:border-slate-700
                  bg-white dark:bg-slate-900
                  px-3 py-2
                  text-sm
                  focus:outline-none
                  focus:ring-2 focus:ring-indigo-500
                "
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateCategory();
                  }
                  if (e.key === "Escape") {
                    setShowCreateCategory(false);
                  }
                }}
              />

              <Button
                type="button"
                onClick={handleCreateCategory}
                className="px-3"
              >
                Add
              </Button>
            </div>

            <div className="mt-2 text-xs text-slate-500">
              Press Enter to save • Esc to cancel
            </div>
          </div>
        )}
      </div>

      <Input
        label="Date"
        type="date"
        name="date"
        value={form.date}
        onChange={handleChange}
        required
      />

      {/* ===== Actions ===== */}
      <div className="mt-6 flex items-center gap-3">
        <Button type="submit" loading={loading} className="px-8">
          Save Expense
        </Button>

        {extraAction && (
          <div className="opacity-90">{extraAction}</div>
        )}
      </div>
    </form>
  );
};

export default ExpenseForm;
