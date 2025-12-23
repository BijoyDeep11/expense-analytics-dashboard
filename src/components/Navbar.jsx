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
      : "text-slate-600 hover:text-slate-800";

  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <Logo variant="minimal" />
          <span className="text-lg font-semibold text-slate-800">
            ExpenseDash
          </span>
        </div>

        {/* Center: Navigation */}
        <div className="flex gap-6">
          <Link to="/" className={isActive("/")}>
            Dashboard
          </Link>
          <Link to="/add" className={isActive("/add")}>
            Add Expense
          </Link>
        </div>

        {/* Right: User + Logout */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">
            {user.email}
          </span>
          <Button
            size="sm"
            variant="outline"
            color="red"
            className="bg-red-500 text-white hover:bg-red-600"
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
