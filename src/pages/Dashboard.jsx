import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { expenseService } from "../services/expenseService";
import CategoryChart from "../components/analytics/CategoryChart";
import Layout from "../components/Layout";
import Button from "../components/ui/Button";
import ExpenseList from "../components/ExpenseList";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseFilters from "../components/ExpenseFilters";
import { useExpenseAnalytics } from "../hooks/useExpenseAnalytics";
import MonthlyTrendChart from "../components/analytics/MonthlyTrendChart";

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
  const { totalAmount, byCategory, byMonth, insight, topCategoryInsight } =
  useExpenseAnalytics(filteredExpenses);


  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500">
          Track, filter, and analyze your expenses
        </p>
      </div>

      <div className="mb-8 p-4 bg-white rounded-lg border border-slate-100">
        <ExpenseFilters
          filters={filters}
          onChange={setFilters}
          categories={categories}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div className="p-5 bg-slate-50 border border-slate-100 rounded-lg">
          <p className="text-sm text-slate-500 mb-1">
            Total Spent
          </p>
          <p className="text-3xl font-semibold text-slate-800">
            ₹{totalAmount}
          </p>
        </div>

        {Object.entries(byCategory).map(([cat, amt]) => (
          <div
            key={cat}
            className="p-5 bg-white border border-slate-100 rounded-lg"
          >
            <p className="text-sm text-slate-500 mb-1">
              {cat}
            </p>
            <p className="text-2xl font-medium text-slate-800">
              ₹{amt}
            </p>
          </div>
        ))}
      </div>

      {insight && (
      <div className="mb-6 rounded-lg border-l-4 border-indigo-500 bg-indigo-50 p-4 text-sm text-indigo-700">
        💡 {insight}
      </div>
          )}

          {insight && (
        <div className="mb-4 rounded-lg border-l-4 border-indigo-500 bg-indigo-50 p-4 text-sm text-indigo-700">
          💡 {insight}
        </div>
      )}
  
      {topCategoryInsight && (
        <div className="mb-6 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-4 text-sm text-emerald-700">
          🏆 {topCategoryInsight}
        </div>
      )}


      <CategoryChart data={byCategory} />
      <MonthlyTrendChart data={byMonth} />

      {/* Content */}
      {loading ? (
        <p>Loading expenses...</p>
      ) : (
        <>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            Expenses
          </h2>

          <div className="bg-white rounded-lg border border-slate-100 p-4">
            <ExpenseList
              expenses={filteredExpenses}
              onEdit={setEditingExpense}
              onDelete={handleDelete}
            />
          </div>

          {/* Edit Expense */}
          {editingExpense && (
            <div className="mt-10 bg-slate-50 p-6 rounded-lg border border-slate-200 max-w-md">
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
