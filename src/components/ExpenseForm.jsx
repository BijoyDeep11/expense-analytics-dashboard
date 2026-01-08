import { useState, useEffect } from "react";
import Input from "./ui/Input";
import Select from "./ui/Select";
import Button from "./ui/Button";

const ExpenseForm = ({
  initialData = null,
  onSubmit,
  loading,
  onChange,
  extraAction,
  categories = [], // ✅ dynamic categories from DB
}) => {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
  });

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

      <Select
        label="Category"
        name="category"
        value={form.category}
        onChange={handleChange}
        required
        options={categories.map((c) => ({
          label: c.name,
          value: c.name,
        }))}
      />

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
        {/* Primary action */}
        <Button
          type="submit"
          loading={loading}
          className="px-8"
        >
          Save Expense
        </Button>

        {/* Destructive action – close but secondary */}
        {extraAction && (
          <div className="opacity-90">
            {extraAction}
          </div>
        )}
      </div>
    </form>
  );
};

export default ExpenseForm;
