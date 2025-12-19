import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { expenseService } from "../services/expenseService";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await expenseService.getExpenses(user.$id);
        setExpenses(res.documents);
      } catch (err) {
        console.error("Failed to fetch expenses", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [user.$id]);

  const handleUpdate = async (e) => {
  e.preventDefault();

  try {
    await expenseService.updateExpense(editingExpense.$id, {
      title: editingExpense.title,
      amount: editingExpense.amount,
      category: editingExpense.category,
    });

    setExpenses((prev) =>
      prev.map((expense) =>
        expense.$id === editingExpense.$id ? editingExpense : expense
      )
    );

    setEditingExpense(null);
  } catch (err) {
    console.error("Failed to update expense", err);
  }
};


const handleDelete = async (expenseId) => {
  try {
    await expenseService.deleteExpense(expenseId);

    // update UI immediately
    setExpenses((prev) =>
      prev.filter((expense) => expense.$id !== expenseId)
    );
  } catch (err) {
    console.error("Failed to delete expense", err);
  }
};


  return (
    <div>
      <h1>Dashboard</h1>

      <button onClick={logout}>Logout</button>
      <Link to="/add">
        <button>Add Expense</button>
      </Link>

      {loading ? (
        <p>Loading expenses...</p>
      ) : expenses.length === 0 ? (
        <p>No expenses yet</p>
      ) : (
        <>
          <ul>
            {expenses.map((expense) => (
              <li key={expense.$id}>
                {expense.title} — ₹{expense.amount} ({expense.category})

                <button
                  onClick={() => setEditingExpense(expense)}
                  style={{ marginLeft: "5px" }}
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(expense.$id)}
                  style={{ marginLeft: "10px" }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>

          {editingExpense && (
            <form onSubmit={handleUpdate}>
              <h3>Edit Expense</h3>

              <input
                value={editingExpense.title}
                onChange={(e) =>
                  setEditingExpense({ ...editingExpense, title: e.target.value })
                }
                required
              />

              <input
                type="number"
                value={editingExpense.amount}
                onChange={(e) =>
                  setEditingExpense({
                    ...editingExpense,
                    amount: Number(e.target.value),
                  })
                }
                required
              />

              <input
                value={editingExpense.category}
                onChange={(e) =>
                  setEditingExpense({ ...editingExpense, category: e.target.value })
                }
                required
              />

              <button type="submit">Update</button>
              <button type="button" onClick={() => setEditingExpense(null)}>
                Cancel
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
