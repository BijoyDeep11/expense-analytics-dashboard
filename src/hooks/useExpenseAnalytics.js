export function useExpenseAnalytics(
  expenses,
  budgets = [],
  filters = { category: "All", month: "All" }
) {
  // ----------------------------------------
  // APPLY FILTERS FIRST (🔥 THIS WAS MISSING)
  // ----------------------------------------
  const filteredExpenses = expenses.filter((e) => {
    const categoryMatch =
      !filters.category ||
      filters.category === "All" ||
      e.category === filters.category;

    const monthMatch =
      !filters.month ||
      filters.month === "All" ||
      new Date(e.date).toLocaleString("default", {
        month: "short",
        year: "numeric",
      }) === filters.month;

    return categoryMatch && monthMatch;
  });

  // ----------------------------------------
  // TOTAL SPENT
  // ----------------------------------------
  const totalAmount = filteredExpenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  // ----------------------------------------
  // CATEGORY TOTALS
  // ----------------------------------------
  const byCategory = filteredExpenses.reduce((acc, e) => {
    acc[e.category] =
      (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});

  // ----------------------------------------
  // MONTH TOTALS
  // ----------------------------------------
  const byMonth = filteredExpenses.reduce((acc, e) => {
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
    months.length > 0 ? months[months.length - 1] : null;

  // ----------------------------------------
  // BUDGET MERGE LOGIC
  // ----------------------------------------
  const budgetByCategory = {};

  Object.entries(byCategory).forEach(([category, spent]) => {
    const monthlyBudget = budgets.find(
      (b) =>
        b.category === category &&
        b.month === currentMonth
    );

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
      source: monthlyBudget ? "monthly" : "global",
    };
  });

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

      insight = `You spent ${Math.abs(diff).toFixed(
        1
      )}% ${diff > 0 ? "more" : "less"} in ${last} compared to ${prev}.`;
    }
  }

  // ----------------------------------------
  // INSIGHT 2: TOP CATEGORY
  // ----------------------------------------
  let topCategoryInsight = null;

  if (currentMonth) {
    const monthlyExpenses = filteredExpenses.filter((e) => {
      const d = new Date(e.date);
      return (
        d.toLocaleString("default", {
          month: "short",
          year: "numeric",
        }) === currentMonth
      );
    });

    if (monthlyExpenses.length > 0) {
      const byCat = monthlyExpenses.reduce((acc, e) => {
        acc[e.category] =
          (acc[e.category] || 0) + Number(e.amount);
        return acc;
      }, {});

      const [cat, amt] = Object.entries(byCat).reduce(
        (max, cur) =>
          cur[1] > max[1] ? cur : max
      );

      topCategoryInsight = `Your highest spending category in ${currentMonth} was ${cat} (₹${amt}).`;
    }
  }

  // ----------------------------------------
  // INSIGHT 3: BUDGET SUMMARY
  // ----------------------------------------
  const overBudgetCount = Object.values(
    budgetByCategory
  ).filter((b) => b.overBudget).length;

  const budgetSummaryInsight =
    overBudgetCount > 0
      ? `${overBudgetCount} categor${
          overBudgetCount > 1 ? "ies are" : "y is"
        } over budget this month`
      : null;

  // ----------------------------------------
  // INSIGHT 4: CATEGORY TREND
  // ----------------------------------------
  let categoryTrendInsight = null;

  if (months.length >= 2) {
    const last = months[months.length - 1];
    const prev = months[months.length - 2];

    const sumByCategory = (month) =>
      filteredExpenses.reduce((acc, e) => {
        const d = new Date(e.date);
        if (
          d.toLocaleString("default", {
            month: "short",
            year: "numeric",
          }) === month
        ) {
          acc[e.category] =
            (acc[e.category] || 0) + Number(e.amount);
        }
        return acc;
      }, {});

    const lastByCategory = sumByCategory(last);
    const prevByCategory = sumByCategory(prev);

    let biggestChange = null;

    Object.keys({ ...lastByCategory, ...prevByCategory }).forEach(
      (cat) => {
        const lastAmt = lastByCategory[cat] || 0;
        const prevAmt = prevByCategory[cat] || 0;

        if (prevAmt === 0 && lastAmt === 0) return;

        const diffPercent =
          prevAmt === 0
            ? 100
            : ((lastAmt - prevAmt) / prevAmt) * 100;

        if (
          !biggestChange ||
          Math.abs(diffPercent) >
            Math.abs(biggestChange.diffPercent)
        ) {
          biggestChange = {
            category: cat,
            diffPercent,
          };
        }
      }
    );

    if (biggestChange) {
      categoryTrendInsight = `${biggestChange.category} spending ${
        biggestChange.diffPercent > 0
          ? "increased"
          : "decreased"
      } ${Math.abs(biggestChange.diffPercent).toFixed(
        1
      )}% compared to last month.`;
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
    budgetSummaryInsight,
    categoryTrendInsight,
  };
}
