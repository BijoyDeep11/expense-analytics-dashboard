import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

/* ---------------------------------------
   Infinite color generator (no repeats)
---------------------------------------- */
const getColor = (index) =>
  `hsl(${(index * 137.5) % 360}, 70%, 55%)`;

/* ---------------------------------------
   Custom Tooltip
---------------------------------------- */
const CategoryTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const { name, value } = payload[0].payload;

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
      <p className="font-medium">{name}</p>
      <p className="opacity-80">₹{value}</p>
    </div>
  );
};

const CategoryChart = ({ data }) => {
  // ----------------------------------------
  // Normalize data: { Food: 1200 } → [{name, value}]
  // ----------------------------------------
  const chartData = Object.entries(data || {}).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  // ----------------------------------------
  // Check if there is any real spending
  // ----------------------------------------
  const hasSpending = chartData.some(
    (d) => d.value > 0
  );

  if (!hasSpending) {
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
          No spending data yet
        </p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Add expenses to see category distribution
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

      {/* Chart + Legend Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="md:col-span-2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
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
                    fill={getColor(index)}
                  />
                ))}
              </Pie>

              <Tooltip content={<CategoryTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend (color + text = zero confusion) */}
        <div className="space-y-2 text-sm">
          {chartData.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center gap-2"
            >
              <span
                className="h-3 w-3 rounded-full shrink-0"
                style={{
                  backgroundColor: getColor(index),
                }}
              />
              <span className="flex-1 text-slate-700 dark:text-slate-300 truncate">
                {item.name}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                ₹{item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryChart;
