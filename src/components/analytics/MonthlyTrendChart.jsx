import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MonthlyTrendChart = ({ data }) => {
  // Convert object -> array for Recharts
  const chartData = Object.entries(data).map(
    ([month, amount]) => ({
      month,
      amount,
    })
  );

  // Empty state handling
  if (chartData.length === 0) {
    return (
      <div className="mt-8 rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">
        No monthly data available.
      </div>
    );
  }

  return (
    <div className="mt-10 rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-medium text-slate-700">
        Monthly Spending Trend
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              stroke="#94a3b8"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#94a3b8"
            />
            <Tooltip />
            <Bar
              dataKey="amount"
              fill="#6366f1"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyTrendChart;
