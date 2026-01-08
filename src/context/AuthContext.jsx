import { createContext, useContext, useEffect, useState } from "react";
import { account } from "../services/appwrite";
import { ID } from "appwrite";
import { categoryService } from "../services/categoryService";


async function seedDefaultCategories(userId) {
  const defaults = ["Food", "Travel", "Shopping", "Other"];

  for (const name of defaults) {
    try {
      await categoryService.createCategory({
        userId,
        name,
        isDefault: true,
      });
    } catch (err) {
      // If it already exists (unique index), ignore
      console.log("Category already exists:", name);
    }
  }
}


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const accountDetails = await account.get();
        setUser(accountDetails);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserStatus();
  }, []);

  const login = async (email, password) => {
  await account.createEmailPasswordSession(email, password);
  const accountDetails = await account.get();
  setUser(accountDetails);

  // 🌱 Seed default categories for this user
  await seedDefaultCategories(accountDetails.$id);
};


  const signup = async (email, password, name) => {
    await account.create(ID.unique(), email, password, name);
    await login(email, password);
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
