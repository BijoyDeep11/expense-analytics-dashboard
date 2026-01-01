import { useState, useEffect } from "react";
import Input from "./ui/Input";
import Select from "./ui/Select";
import Button from "./ui/Button";

const categories = [
  { label: "Food", value: "Food" },
  { label: "Travel", value: "Travel" },
  { label: "Shopping", value: "Shopping" },
  { label: "Other", value: "Other" },
];

const ExpenseForm = ({
  initialData = null,
  onSubmit,
  loading,
  onChange,
  extraAction,
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
    <form onSubmit={handleSubmit} className="space-y-5">
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
        options={categories}
        value={form.category}
        onChange={handleChange}
        required
      />

      <Input
        label="Date"
        type="date"
        name="date"
        value={form.date}
        onChange={handleChange}
        required
      />

      <div className="mt-4 flex gap-3">
        <Button
          type="submit"
          loading={loading}
          className="flex-1"
        >
          Save Expense
        </Button>

        {extraAction && (
          <div className="flex-1">
            {extraAction}
          </div>
        )}
      </div>
    </form>
  );
};

export default ExpenseForm;
