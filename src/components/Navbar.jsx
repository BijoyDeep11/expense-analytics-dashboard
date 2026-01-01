import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Button from "./ui/Button";
import Logo from "./ui/Logo";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) =>
    location.pathname === path
      ? "text-indigo-600 font-medium"
      : "text-slate-600 hover:text-slate-900";

  return (
    <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Left: Brand */}
        <div className="flex items-center gap-2">
          <Logo variant="minimal" />
          <span className="text-lg font-semibold text-slate-900">
            ExpenseDash
          </span>
        </div>

        {/* Center: Navigation */}
        <div className="flex items-center gap-8 text-sm">
          <Link
            to="/"
            className={`${isActive("/")} transition-colors`}
          >
            Dashboard
          </Link>

          <Link
            to="/add"
            className={`${isActive("/add")} transition-colors`}
          >
            Add Expense
          </Link>
        </div>

        {/* Right: User + Logout */}
        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-sm text-slate-500">
           {user.name || user.email}
          </span>

          <Button
            type="button"
            className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800"
            onClick={logout}
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
