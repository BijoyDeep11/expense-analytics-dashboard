import ExpenseItem from "./ExpenseItem";

const ExpenseList = ({ expenses }) => {
  if (!expenses || expenses.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        No expenses yet
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {expenses.map((expense) => (
        <ExpenseItem
          key={expense.$id}
          expense={expense}
          /* 🔒 NO onEdit, NO onDelete passed */
        />
      ))}
    </ul>
  );
};

export default ExpenseList;
