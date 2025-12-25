import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from "recharts";

const COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#a855f7"
];

const CategoryChart = ({ data }) => {

      const chartData = Object.entries(data).map(
    ([category, amount]) => ({
      category,
      amount
    })
  );

    if (chartData.length === 0) {
    return (
      <div className="mt-8 rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
        No data available for the selected filters.
      </div>
    );
  }

    return (
    <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">

              <h3 className="mb-4 text-sm font-medium text-gray-700">
        Spending by Category
      </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={chartData}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        >
                                  {chartData.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
                    </Pie>
                    <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
  );
}

export default CategoryChart;







