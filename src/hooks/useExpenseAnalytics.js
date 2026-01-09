export function useExpenseAnalytics(
  expenses = [],
  budgets = [],
  categories = []
) {
  // ----------------------------------------
  // GUARD: no expenses → return empty analytics
  // ----------------------------------------
  if (!expenses || expenses.length === 0) {
    const emptyByCategory = {};

    (categories || []).forEach((c) => {
      emptyByCategory[c.name] = 0;
    });

    return {
      totalAmount: 0,
      byCategory: emptyByCategory,
      byMonth: {},
      budgetByCategory: {},
      insight: null,
      topCategoryInsight: null,
      budgetSummaryInsight: null,
      categoryTrendInsight: null,
    };
  }

  // ----------------------------------------
  // TOTAL SPENT
  // ----------------------------------------
  const totalAmount = expenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  // ----------------------------------------
  // CATEGORY TOTALS (DRIVEN BY DB CATEGORIES)
  // ----------------------------------------
  const byCategory = {};

  (categories || []).forEach((cat) => {
    const total = (expenses || [])
      .filter((e) => e.category === cat.name)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    byCategory[cat.name] = total;
  });

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

  const sortedMonths = months
    .map((m) => {
      const [mon, yr] = m.split(" ");
      return {
        label: m,
        date: new Date(`${mon} 1, ${yr}`),
      };
    })
    .sort((a, b) => a.date - b.date);

  const currentMonth =
    sortedMonths.length > 0
      ? sortedMonths[sortedMonths.length - 1].label
      : null;

  const currentYear = currentMonth
    ? currentMonth.split(" ")[1]
    : null;

  const getQuarter = (monthLabel) => {
    const [mon, yr] = monthLabel.split(" ");
    const m = new Date(`${mon} 1, ${yr}`).getMonth() + 1;
    const q = Math.ceil(m / 3);
    return `Q${q}-${yr}`;
  };

  const currentQuarter =
    currentMonth ? getQuarter(currentMonth) : null;

  // ----------------------------------------
  // BUDGET MERGE LOGIC (PERIOD BASED)
  // ----------------------------------------
  const budgetByCategory = {};

  Object.entries(byCategory).forEach(([category, spent]) => {
    // priority: monthly → quarterly → yearly
    const monthlyBudget = budgets.find(
      (b) =>
        b.category === category &&
        b.periodType === "monthly" &&
        b.periodKey === currentMonth
    );

    const quarterlyBudget = budgets.find(
      (b) =>
        b.category === category &&
        b.periodType === "quarterly" &&
        b.periodKey === currentQuarter
    );

    const yearlyBudget = budgets.find(
      (b) =>
        b.category === category &&
        b.periodType === "yearly" &&
        b.periodKey === currentYear
    );

    const effectiveBudget =
      monthlyBudget || quarterlyBudget || yearlyBudget;

    if (!effectiveBudget) return;

    const limit = Number(effectiveBudget.limit);
    const remaining = limit - spent;
    const percentUsed =
      limit > 0
        ? Math.min((spent / limit) * 100, 100)
        : 0;

    budgetByCategory[category] = {
      limit,
      spent,
      remaining,
      percentUsed: Number(percentUsed.toFixed(1)),
      overBudget: spent > limit,
      source: effectiveBudget.periodType, // monthly | quarterly | yearly
    };
  });

  // ----------------------------------------
  // INSIGHT 1: MONTH-OVER-MONTH
  // ----------------------------------------
  let insight = null;

  if (sortedMonths.length >= 2) {
    const last = sortedMonths[sortedMonths.length - 1].label;
    const prev = sortedMonths[sortedMonths.length - 2].label;

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
  // INSIGHT 2: TOP CATEGORY (CURRENT MONTH)
  // ----------------------------------------
  let topCategoryInsight = null;

  if (currentMonth) {
    const monthlyExpenses = expenses.filter((e) => {
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
  // INSIGHT 3: PRECISE BUDGET EXCEED MESSAGE
  // ----------------------------------------
  let budgetSummaryInsight = null;

  const overMonthlyBudgets = Object.entries(budgetByCategory)
    .filter(
      ([_, b]) => b.overBudget && b.source === "monthly"
    );

  if (overMonthlyBudgets.length > 0 && currentMonth) {
    const messages = overMonthlyBudgets.map(
      ([cat, b]) =>
        `${cat} exceeded its ${currentMonth} budget by ₹${Math.abs(
          b.remaining
        )}`
    );

    budgetSummaryInsight =
      messages.length === 1
        ? messages[0]
        : messages.join(", ");
  }

  // ----------------------------------------
  // INSIGHT 4: CATEGORY TREND
  // ----------------------------------------
  let categoryTrendInsight = null;

  if (months.length >= 2) {
    const last = months[months.length - 1];
    const prev = months[months.length - 2];

    const sumByCategory = (month) =>
      expenses.reduce((acc, e) => {
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

    Object.keys({
      ...lastByCategory,
      ...prevByCategory,
    }).forEach((cat) => {
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
    });

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
