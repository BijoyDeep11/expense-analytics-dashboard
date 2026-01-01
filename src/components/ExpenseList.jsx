import ExpenseItem from "./ExpenseItem";

const ExpenseList = ({ expenses }) => {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-sm text-slate-500">
          No expenses yet
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Your added expenses will appear here
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {expenses.map((expense) => (
        <li
          key={expense.$id}
          className="rounded-lg border border-slate-200 bg-white transition hover:bg-slate-50"
        >
          <ExpenseItem
            expense={expense}
            /* 🔒 NO onEdit, NO onDelete passed */
          />
        </li>
      ))}
    </ul>
  );
};

export default ExpenseList;
