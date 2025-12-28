import { databases, ID, Query } from "./appwrite";
import { DATABASE_ID, BUDGETS_COLLECTION_ID } from "../config";

export const budgetService = {
  // ----------------------------------------
  // Fetch all budgets (global + monthly)
  // ----------------------------------------
  async getBudgets(userId) {
    const res = await databases.listDocuments(
      DATABASE_ID,
      BUDGETS_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );

    return res.documents;
  },

  // ----------------------------------------
  // Fetch budgets for a specific month
  // ----------------------------------------
  async getBudgetsForMonth(userId, month) {
    const res = await databases.listDocuments(
      DATABASE_ID,
      BUDGETS_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.or([
          Query.equal("month", month),
          Query.equal("month", null),
        ]),
      ]
    );

    return res.documents;
  },

  // ----------------------------------------
  // Create or update a budget
  // ----------------------------------------
  async upsertBudget({ userId, category, limit, month }) {
    // Check if budget already exists
    const existing = await databases.listDocuments(
      DATABASE_ID,
      BUDGETS_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.equal("category", category),
        Query.equal("month", month ?? null),
      ]
    );

    // Update existing budget
    if (existing.documents.length > 0) {
      const doc = existing.documents[0];

      return databases.updateDocument(
        DATABASE_ID,
        BUDGETS_COLLECTION_ID,
        doc.$id,
        { limit }
      );
    }

    // Create new budget
    return databases.createDocument(
      DATABASE_ID,
      BUDGETS_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        category,
        limit,
        month: month ?? null,
      }
    );
  },
};
