import { databases } from "./appwrite";
import { Query, ID } from "appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const CATEGORIES_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_CATEGORIES_COLLECTION_ID;

export const categoryService = {
  async getCategories(userId) {
    const res = await databases.listDocuments(
      DATABASE_ID,
      CATEGORIES_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );
    return res.documents;
  },

  async createCategory({ userId, name, isDefault = false }) {
    return databases.createDocument(
      DATABASE_ID,
      CATEGORIES_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        name,
        isDefault,
      }
    );
  },

  async deleteCategory(categoryId) {
    return databases.deleteDocument(
      DATABASE_ID,
      CATEGORIES_COLLECTION_ID,
      categoryId
    );
  },
};
