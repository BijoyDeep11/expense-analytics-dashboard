import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { expenseService } from "../services/expenseService";

import Layout from "../components/Layout";
import Button from "../components/ui/Button";
import ExpenseList from "../components/ExpenseList";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseFilters from "../components/ExpenseFilters";
import { useExpenseAnalytics } from "../hooks/useExpenseAnalytics";

const Dashboard = () => {
  const { user, logout } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState(null);

  const [filters, setFilters] = useState({
    category: "all",
    month: "all",
  });

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

  // Derived categories
  const categories = useMemo(() => {
    return [...new Set(expenses.map((e) => e.category))];
  }, [expenses]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const categoryMatch =
        filters.category === "all" || exp.category === filters.category;

      const monthMatch =
        filters.month === "all" ||
        new Date(exp.date).getMonth() === Number(filters.month);

      return categoryMatch && monthMatch;
    });
  }, [expenses, filters]);

  // Analytics (based on filtered data)
  const { totalAmount, byCategory } =
    useExpenseAnalytics(filteredExpenses);

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

      {/* Filters */}
      <ExpenseFilters
        filters={filters}
        onChange={setFilters}
        categories={categories}
      />

      {/* Analytics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-white shadow rounded">
          <p className="text-sm text-gray-500">Total Spent</p>
          <p className="text-2xl font-bold">₹{totalAmount}</p>
        </div>

        {Object.entries(byCategory).map(([cat, amt]) => (
          <div key={cat} className="p-4 bg-white shadow rounded">
            <p className="text-sm text-gray-500">{cat}</p>
            <p className="text-xl font-semibold">₹{amt}</p>
          </div>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <p>Loading expenses...</p>
      ) : (
        <>
          <ExpenseList
            expenses={filteredExpenses}
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
