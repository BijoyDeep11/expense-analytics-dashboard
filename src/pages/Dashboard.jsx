import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { expenseService } from "../services/expenseService";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <ul>
          {expenses.map((expense) => (
            <li key={expense.$id}>
              {expense.title} — ₹{expense.amount} ({expense.category})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
