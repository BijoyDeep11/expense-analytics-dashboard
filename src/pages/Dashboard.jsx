import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { expenseService } from "../services/expenseService";

import Layout from "../components/Layout";
import Button from "../components/ui/Button";
import ExpenseList from "../components/ExpenseList";
import ExpenseForm from "../components/ExpenseForm";

const Dashboard = () => {
  const { user, logout } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState(null);

  // Fetch expenses
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

  // Delete expense
  const handleDelete = async (expenseId) => {
    try {
      await expenseService.deleteExpense(expenseId);
      setExpenses((prev) =>
        prev.filter((expense) => expense.$id !== expenseId)
      );
    } catch (err) {
      console.error("Failed to delete expense", err);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>

        <div className="flex gap-3">
          <Link to="/add">
            <Button>Add Expense</Button>
          </Link>

          <Button bgColor="bg-red-500" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <p>Loading expenses...</p>
      ) : (
        <>
          <ExpenseList
            expenses={expenses}
            onEdit={setEditingExpense}
            onDelete={handleDelete}
          />

          {/* Edit Expense */}
          {editingExpense && (
            <div className="mt-8 bg-white p-6 rounded-lg shadow max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                Edit Expense
              </h3>

              <ExpenseForm
                initialData={editingExpense}
                loading={false}
                onSubmit={async (data) => {
                  try {
                    await expenseService.updateExpense(
                      editingExpense.$id,
                      data
                    );

                    setExpenses((prev) =>
                      prev.map((expense) =>
                        expense.$id === editingExpense.$id
                          ? { ...expense, ...data }
                          : expense
                      )
                    );

                    setEditingExpense(null);
                  } catch (err) {
                    console.error("Failed to update expense", err);
                  }
                }}
              />

              <div className="mt-3">
                <Button
                  bgColor="bg-gray-300"
                  textColor="text-black"
                  onClick={() => setEditingExpense(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default Dashboard;
