import { databases } from "./appwrite";
import { Query, ID } from "appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const BUDGETS_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_BUDGET_COLLECTION_ID;

export const budgetService = {
  // ----------------------------------------
  // Fetch ALL budgets for user
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
  // Delete budget
  // ----------------------------------------
  async deleteBudget(budgetId) {
    return databases.deleteDocument(
      DATABASE_ID,
      BUDGETS_COLLECTION_ID,
      budgetId
    );
  },

  // ----------------------------------------
  // Fetch budgets for a period
  // ----------------------------------------
  async getBudgetsForPeriod(userId, periodType, periodKey) {
    const queries = [
      Query.equal("userId", userId),
      Query.equal("periodType", periodType),
      Query.equal("periodKey", periodKey),
    ];

    const res = await databases.listDocuments(
      DATABASE_ID,
      BUDGETS_COLLECTION_ID,
      queries
    );

    return res.documents;
  },

  // ----------------------------------------
  // Create or update budget (UPSERT)
  // ----------------------------------------
  async upsertBudget({
    userId,
    category,
    limit,
    periodType,
    periodKey,
  }) {
    const safeCategory =
    category === "__overall__" ? "__overall__" : category;
    const queries = [
      Query.equal("userId", userId),
      Query.equal("category", safeCategory),
      Query.equal("periodType", periodType),
      Query.equal("periodKey", periodKey),
    ];

    const existing = await databases.listDocuments(
      DATABASE_ID,
      BUDGETS_COLLECTION_ID,
      queries
    );

    // Update existing
    if (existing.documents.length > 0) {
      return databases.updateDocument(
        DATABASE_ID,
        BUDGETS_COLLECTION_ID,
        existing.documents[0].$id,
        { limit }
      );
    }

    // Create new
    return databases.createDocument(
      DATABASE_ID,
      BUDGETS_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        category: safeCategory,
        limit,
        periodType,
        periodKey,
      }
    );
  },
};
