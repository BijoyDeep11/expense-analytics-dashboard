const ExpenseItem = ({ expense }) => {
  return (
    <li className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
      <div>
        <p className="font-medium">{expense.title}</p>
        <p className="text-sm text-gray-600">
          ₹{expense.amount} • {expense.category}
        </p>
      </div>

      {/* 🔒 Read-only: no Edit / Delete buttons */}
    </li>
  );
};

export default ExpenseItem;
