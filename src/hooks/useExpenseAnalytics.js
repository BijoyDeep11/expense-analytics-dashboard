export function useExpenseAnalytics(expenses) {
  const totalAmount = expenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] =
      (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});

  const byMonth = expenses.reduce((acc, e) => {
    const date = new Date(e.date);

    const monthKey = date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    acc[monthKey] =
      (acc[monthKey] || 0) + Number(e.amount);

    return acc;
  }, {});

  // ----------------------------------------
  // 🔍 INSIGHT 1: Month-over-Month Comparison
  // ----------------------------------------
  let insight = null;

  const months = Object.keys(byMonth);

  if (months.length >= 2) {
    const lastMonth = months[months.length - 1];
    const prevMonth = months[months.length - 2];

    const lastAmount = byMonth[lastMonth];
    const prevAmount = byMonth[prevMonth];

    if (prevAmount > 0) {
      const diffPercent =
        ((lastAmount - prevAmount) / prevAmount) * 100;

      const direction =
        diffPercent > 0 ? "more" : "less";

      insight = `You spent ${Math.abs(
        diffPercent
      ).toFixed(1)}% ${direction} in ${lastMonth} compared to ${prevMonth}.`;
    }
  }

  // ----------------------------------------
  // 🔍 INSIGHT 2: Highest Spending Category
  // ----------------------------------------
  let topCategoryInsight = null;

  if (expenses.length > 0 && months.length > 0) {
    const currentMonth = months[months.length - 1];

    // Aggregate category totals ONLY for current month
    const categoryTotalsThisMonth = expenses.reduce(
      (acc, e) => {
        const date = new Date(e.date);
        const monthKey = date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });

        if (monthKey === currentMonth) {
          acc[e.category] =
            (acc[e.category] || 0) + Number(e.amount);
        }

        return acc;
      },
      {}
    );

    const entries = Object.entries(
      categoryTotalsThisMonth
    );

    if (entries.length > 0) {
      const [topCategory, topAmount] = entries.reduce(
        (max, curr) =>
          curr[1] > max[1] ? curr : max
      );

      topCategoryInsight = `Your highest spending category in ${currentMonth} was ${topCategory} (₹${topAmount}).`;
    }
  }

  return {
    totalAmount,
    byCategory,
    byMonth,
    insight,
    topCategoryInsight,
  };
}
