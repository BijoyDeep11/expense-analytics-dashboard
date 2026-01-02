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

/* ---------------------------------------
   Custom Tooltip (FIXED + PRECISE)
---------------------------------------- */
const CategoryTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const { category, amount } = payload[0].payload;

  return (
    <div
      className="
        rounded-lg
        bg-slate-900 dark:bg-slate-100
        px-3 py-2
        text-xs
        text-white dark:text-slate-900
        shadow-lg
      "
    >
      <p className="font-medium">{category}</p>
      <p className="opacity-80">₹{amount}</p>
    </div>
  );
};

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
              isAnimationActive
              animationDuration={300}
              stroke="transparent"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            {/* ✅ FIXED TOOLTIP */}
            <Tooltip content={<CategoryTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryChart;
