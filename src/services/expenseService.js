import { databases } from "../services/appwrite";
import { Query, ID } from "appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

export const expenseService = {
  // -----------------------------
  // Create single expense
  // -----------------------------
  async createExpense({ title, amount, category, date, userId }) {
    return databases.createDocument(
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

  // -----------------------------
  // Get all expenses for user
  // -----------------------------
  async getExpenses(userId) {
    const res = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.equal("userId", userId)]
    );
    return res.documents;
  },

  // -----------------------------
  // Delete single expense
  // -----------------------------
  async deleteExpense(expenseId) {
    return databases.deleteDocument(
      DATABASE_ID,
      COLLECTION_ID,
      expenseId
    );
  },

  // -----------------------------
  // Update single expense
  // -----------------------------
  async updateExpense(expenseId, data) {
    return databases.updateDocument(
      DATABASE_ID,
      COLLECTION_ID,
      expenseId,
      data
    );
  },

  // ======================================================
  // BULK HELPERS FOR CATEGORY DELETE FLOW
  // ======================================================

  // -----------------------------
  // Delete ALL expenses in a category
  // (used for "Delete Anyway")
  // RETURNS deleted expenses for UNDO
  // -----------------------------
  async deleteExpensesByCategory(categoryName) {
    const res = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
        [Query.equal("category", categoryName)]
    );

    if (res.documents.length === 0) return [];

    const deleted = [...res.documents]; // 👈 keep snapshot


    await Promise.all(
      res.documents.map((doc) =>
        databases.deleteDocument(
          DATABASE_ID,
          COLLECTION_ID,
          doc.$id
        )
      )
    );
    
 return deleted; // 👈 IMPORTANT  
  },


  // -----------------------------
  // Reassign expenses to new category
  // (used for "Reassign & Delete")
  // -----------------------------
  async reassignExpenses(userId, fromCategory, toCategory) {
    const res = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.equal("category", fromCategory),
      ]
    );

    if (res.documents.length === 0) return [];

    await Promise.all(
      res.documents.map((doc) =>
        databases.updateDocument(
          DATABASE_ID,
          COLLECTION_ID,
          doc.$id,
          { category: toCategory }
        )
      )
    );

    return res.documents; // optional, useful for logs / undo later
  },
};
