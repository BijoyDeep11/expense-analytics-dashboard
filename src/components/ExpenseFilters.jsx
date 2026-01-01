import Select from "./ui/Select";

export default function ExpenseFilters({
  filters,
  onChange,
  categories = [],
  months = [],
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
      {/* Category Filter */}
      <div className="w-full sm:max-w-xs">
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
      </div>

      {/* Month Filter */}
      <div className="w-full sm:max-w-xs">
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
    </div>
  );
}
