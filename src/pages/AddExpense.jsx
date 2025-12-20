import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { expenseService } from "../services/expenseService";

import Layout from "../components/Layout";
import ExpenseForm from "../components/ExpenseForm";

const AddExpense = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  return (
    <Layout>
      <h2 className="text-xl font-semibold mb-6">Add Expense</h2>

      <ExpenseForm
        loading={loading}
        onSubmit={async (data) => {
          setLoading(true);

          try {
            await expenseService.createExpense({
              ...data,
              userId: user.$id,
            });

            navigate("/");
          } catch (err) {
            console.error("Failed to add expense", err);
          } finally {
            setLoading(false);
          }
        }}
      />
    </Layout>
  );
};

export default AddExpense;
