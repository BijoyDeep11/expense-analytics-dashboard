const ExpenseItem = ({ expense }) => {
  return (
    <div
      className="
        group
        relative
        flex items-center justify-between
        px-4 py-4

        transition
        hover:translate-x-1px
        active:bg-slate-100 dark:active:bg-slate-800

        touch-pan-y
      "
    >
      {/* Left: Title + Meta */}
      <div className="space-y-0.5">
        <p className="font-medium text-base text-slate-800 dark:text-slate-100">
          {expense.title}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {expense.category}
        </p>
      </div>

      {/* Right: Amount */}
      <div className="text-right">
        <p className="font-semibold text-slate-900 dark:text-slate-100">
          ₹{expense.amount}
        </p>
      </div>

      {/* Swipe hint (mobile only, CSS-only) */}
      <div
        className="
          pointer-events-none
          absolute inset-y-0 right-0
          w-6

          bg-linear-to-l
          from-slate-200/40 dark:from-slate-700/40
          to-transparent

          opacity-0
          group-active:opacity-100
          transition-opacity

          sm:hidden
        "
      />
    </div>
  );
};

export default ExpenseItem;
