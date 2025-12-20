import ExpenseItem from "./ExpenseItem";

const ExpenseList = ({ expenses, onEdit, onDelete }) => {
  if (expenses.length === 0) {
    return <p>No expenses yet</p>;
  }

  return (
    <ul className="space-y-3">
      {expenses.map((expense) => (
        <ExpenseItem
          key={expense.$id}
          expense={expense}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
};

export default ExpenseList;
