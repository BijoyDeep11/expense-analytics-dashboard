import ExpenseItem from "./ExpenseItem";

const ExpenseList = ({ expenses }) => {
  if (!expenses || expenses.length === 0) {
    return (
      <div
        className="
          rounded-xl
          border border-dashed border-slate-200 dark:border-slate-800
          bg-slate-50 dark:bg-slate-900
          p-6
          text-center
          animate-[fadeIn_0.2s_ease-out]
        "
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No expenses yet
        </p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Your added expenses will appear here
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3 overflow-x-auto overscroll-x-contain">
      {expenses.map((expense) => (
        <li
          key={expense.$id}
          className="
            rounded-lg
            border border-slate-200 dark:border-slate-800
            bg-white dark:bg-slate-900
            transition
            hover:bg-slate-50 dark:hover:bg-slate-800
          "
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
