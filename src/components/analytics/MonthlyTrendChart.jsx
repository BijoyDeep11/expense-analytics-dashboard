import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/* ---------------------------------------
   Deterministic color for bars
---------------------------------------- */
const getBarColor = () =>
  "hsl(231, 84%, 60%)"; // matches indigo tone, stable & branded

const MonthlyTrendChart = ({ data }) => {
  // ----------------------------------------
  // Normalize data: { Jan 2025: 1200 } → [{month, amount}]
  // ----------------------------------------
  const chartData = Object.entries(data || {}).map(
    ([month, amount]) => ({
      month,
      amount,
    })
  );

  // ----------------------------------------
  // Check if there is any real spending
  // ----------------------------------------
  const hasSpending = chartData.some(
    (d) => d.amount > 0
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
          No monthly data yet
        </p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Add expenses to see spending trends over time
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
          Monthly Spending Trend
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          How your expenses change month over month
        </p>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barSize={36}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
              className="dark:stroke-slate-700"
            />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />

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
              formatter={(value) => [`₹${value}`, "Spent"]}
            />

            <Bar
              dataKey="amount"
              fill={getBarColor()}
              radius={[6, 6, 0, 0]}
              isAnimationActive
              animationDuration={300}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyTrendChart;
