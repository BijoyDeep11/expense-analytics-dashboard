import Button from "./ui/Button";

const ExpenseItem = ({ expense, onEdit, onDelete }) => {
  return (
    <li className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
      <div>
        <p className="font-medium">{expense.title}</p>
        <p className="text-sm text-gray-600">
          ₹{expense.amount} • {expense.category}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          className="px-4 py-2"
          onClick={() => onEdit(expense)}
        >
          Edit
        </Button>

        <Button
          bgColor="bg-red-500"
          className="px-4 py-2"
          onClick={() => onDelete(expense.$id)}
        >
          Delete
        </Button>
      </div>
    </li>
  );
};

export default ExpenseItem;
