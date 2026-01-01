import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = [
  "#6366f1", // indigo
  "#22c55e", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#06b6d4", // cyan
  "#a855f7", // violet
];

const CategoryChart = ({ data }) => {
  const chartData = Object.entries(data).map(
    ([category, amount]) => ({
      category,
      amount,
    })
  );

  if (chartData.length === 0) {
    return (
      <div
        className="
          rounded-xl
          border border-dashed border-slate-200 dark:border-slate-800
          bg-slate-50 dark:bg-slate-900
          p-6
          text-center
        "
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No data available
        </p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Try adjusting filters to see category breakdown
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        rounded-xl
        border border-slate-200 dark:border-slate-800
        bg-white dark:bg-slate-900
        p-6
        animate-[fadeIn_0.3s_ease-out]
      "
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Spending by Category
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Distribution of expenses across categories
        </p>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={55}
              paddingAngle={2}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                backgroundColor: "#020617", // slate-950
                borderRadius: "8px",
                border: "1px solid #334155", // slate-700
                fontSize: "12px",
                color: "#e5e7eb",
              }}
              labelStyle={{
                color: "#e5e7eb",
              }}
              formatter={(value) => [`₹${value}`, "Amount"]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryChart;
