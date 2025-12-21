import Select from "./ui/Select";

export default function ExpenseFilters({
  filters,
  onChange,
  categories,
}) {
  return (
    <div className="flex gap-4 mb-6">
      {/* Category Filter */}
      <Select
        value={filters.category}
        onChange={e =>
          onChange({ ...filters, category: e.target.value })
        }
      >
        <option value="all">All Categories</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </Select>

      {/* Month Filter */}
      <Select
        value={filters.month}
        onChange={e =>
          onChange({ ...filters, month: e.target.value })
        }
      >
        <option value="all">All Months</option>
        {[...Array(12)].map((_, i) => (
          <option key={i} value={i}>
            {new Date(0, i).toLocaleString("default", {
              month: "long",
            })}
          </option>
        ))}
      </Select>
    </div>
  );
}
