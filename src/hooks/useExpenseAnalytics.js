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

  return { totalAmount, byCategory };
}
