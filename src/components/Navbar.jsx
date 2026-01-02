import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import ThemeToggle from "./ui/ThemeToggle";
import Button from "./ui/Button";
import Logo from "./ui/Logo";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) =>
    location.pathname === path
      ? "text-indigo-600 dark:text-indigo-400 font-medium"
      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200";

  return (
    <nav
      className="
        sticky top-0 z-20
        bg-white/90 dark:bg-slate-950/90
        backdrop-blur
        border-b border-slate-200 dark:border-slate-800
      "
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Left: Brand */}
        <div className="flex items-center gap-2">
          <Logo variant="minimal" />
          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            HisaabSe
          </span>
        </div>

        {/* Center: Navigation (desktop only) */}
        <div className="hidden sm:flex items-center gap-8 text-sm">
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
            Manage Expense
          </Link>
        </div>

        {/* Right: Theme + User + Logout */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <span className="hidden sm:block text-sm text-slate-500 dark:text-slate-400">
            {user.name || user.email}
          </span>

          <Button
            type="button"
            className="
              px-4 py-2
              bg-slate-900 dark:bg-slate-100
              text-white dark:text-slate-900
              hover:bg-slate-800 dark:hover:bg-white
            "
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
