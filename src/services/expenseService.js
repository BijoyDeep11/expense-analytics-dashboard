import { databases } from "../services/appwrite";
import { Query,ID } from "appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

export const expenseService = {
  createExpense: async ({ title, amount, category, date, userId }) => {
    return await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      {
        title,
        amount,
        category,
        date,
        userId,
      }
    );
  },

  getExpenses: async (userId) => {
    return await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.equal("userId", userId)]
    );
  },

  deleteExpense: async (expenseId) => {
    return await databases.deleteDocument(
      DATABASE_ID,
      COLLECTION_ID,
      expenseId
    );
  },

  updateExpense: async (expenseId, data) => {
    return await databases.updateDocument(
      DATABASE_ID,
      COLLECTION_ID,
      expenseId,
      data
    );
  },
};
