export function useExpenseAnalytics(expenses, budgets = []) {
  // ----------------------------------------
  // TOTAL SPENT
  // ----------------------------------------
  const totalAmount = expenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  // ----------------------------------------
  // CATEGORY TOTALS
  // ----------------------------------------
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] =
      (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});

  // ----------------------------------------
  // MONTH TOTALS
  // ----------------------------------------
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
  
  const months = Object.keys(byMonth);
  const currentMonth =
    months.length > 0
      ? months[months.length - 1]
      : null;

  // ----------------------------------------
  // BUDGET MERGE LOGIC (CORE FEATURE)
  // ----------------------------------------
  const budgetByCategory = {};

  Object.entries(byCategory).forEach(
    ([category, spent]) => {
      // Monthly budget override
      const monthlyBudget = budgets.find(
        (b) =>
          b.category === category &&
          b.month === currentMonth
      );

      // Global budget fallback
      const globalBudget = budgets.find(
        (b) =>
          b.category === category &&
          b.month === null
      );

      const effectiveBudget =
        monthlyBudget || globalBudget;

      if (!effectiveBudget) return;

      const limit = Number(effectiveBudget.limit);
      const remaining = limit - spent;
      const percentUsed = Math.min(
        (spent / limit) * 100,
        100
      );

      budgetByCategory[category] = {
        limit,
        spent,
        remaining,
        percentUsed: Number(percentUsed.toFixed(1)),
        overBudget: spent > limit,
        source: monthlyBudget
          ? "monthly"
          : "global",
      };
    }
  );

  // ----------------------------------------
  // INSIGHT 1: MONTH-OVER-MONTH
  // ----------------------------------------
  let insight = null;

  if (months.length >= 2) {
    const last = months[months.length - 1];
    const prev = months[months.length - 2];

    const lastAmt = byMonth[last];
    const prevAmt = byMonth[prev];

    if (prevAmt > 0) {
      const diff =
        ((lastAmt - prevAmt) / prevAmt) * 100;

      insight = `You spent ${Math.abs(
        diff
      ).toFixed(1)}% ${
        diff > 0 ? "more" : "less"
      } in ${last} compared to ${prev}.`;
    }
  }

  // ----------------------------------------
  // INSIGHT 2: TOP CATEGORY THIS MONTH
  // ----------------------------------------
  let topCategoryInsight = null;

  if (currentMonth) {
    const monthlyExpenses = expenses.filter(
      (e) => {
        const d = new Date(e.date);
        const key = d.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
        return key === currentMonth;
      }
    );

    if (monthlyExpenses.length > 0) {
      const byCat = monthlyExpenses.reduce(
        (acc, e) => {
          acc[e.category] =
            (acc[e.category] || 0) +
            Number(e.amount);
          return acc;
        },
        {}
      );

      const [cat, amt] = Object.entries(byCat).reduce(
        (max, cur) =>
          cur[1] > max[1] ? cur : max
      );

      topCategoryInsight = `Your highest spending category in ${currentMonth} was ${cat} (₹${amt}).`;
    }
  }

  // ----------------------------------------
  // RETURN ANALYTICS
  // ----------------------------------------
  return {
    totalAmount,
    byCategory,
    byMonth,
    budgetByCategory,
    insight,
    topCategoryInsight,
  };
}
