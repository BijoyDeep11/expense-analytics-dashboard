import Select from "./ui/Select";

export default function ExpenseFilters({
  filters,
  onChange,
  categories = [],
  months = [],
}) {
  return (
    <div className="flex gap-4 mb-6">
      {/* Category Filter */}
      <Select
        label="Category"
        value={filters.category}
        options={categories}
        onChange={(e) =>
          onChange({
            ...filters,
            category: e.target.value,
          })
        }
      />

      {/* Month Filter */}
      <Select
        label="Month"
        value={filters.month}
        options={months}
        onChange={(e) =>
          onChange({
            ...filters,
            month: e.target.value,
          })
        }
      />
    </div>
  );
}
