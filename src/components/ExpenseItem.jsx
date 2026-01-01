const ExpenseItem = ({ expense }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      {/* Left: Title + Meta */}
      <div className="space-y-0.5">
        <p className="font-medium text-slate-800">
          {expense.title}
        </p>
        <p className="text-xs text-slate-500">
          {expense.category}
        </p>
      </div>

      {/* Right: Amount */}
      <div className="text-right">
        <p className="font-semibold text-slate-900">
          ₹{expense.amount}
        </p>
      </div>

      {/* 🔒 Read-only: no Edit / Delete buttons */}
    </div>
  );
};

export default ExpenseItem;
