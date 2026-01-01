import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");

    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else if (stored === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      document.documentElement.classList.toggle("dark", prefersDark);
      setIsDark(prefersDark);
    }

    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);

    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  if (!mounted) return null;

  const tooltipText = isDark
    ? "Switch to light mode"
    : "Switch to dark mode";

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={tooltipText}
        className="
          inline-flex h-9 w-9 items-center justify-center
          rounded-lg
          border border-slate-200 dark:border-slate-700
          bg-white dark:bg-slate-800
          text-slate-700 dark:text-slate-200
          hover:bg-slate-50 dark:hover:bg-slate-700
          transition-colors duration-200
          focus:outline-none
          focus:ring-2 focus:ring-indigo-500
          focus:ring-offset-2 dark:focus:ring-offset-slate-900
        "
      >
        {/* Subtle animated icon */}
        <span
          className={`
            inline-flex
            transition-all duration-300 ease-out
            ${isDark ? "rotate-90 opacity-90" : "rotate-0 opacity-90"}
          `}
        >
          {isDark ? (
            /* 🌞 Sun */
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 18a6 6 0 100-12 6 6 0 000 12zm0-16a1 1 0 011-1h0a1 1 0 01-1 1zm0 20a1 1 0 011-1h0a1 1 0 01-1 1zm10-10a1 1 0 01-1 1h0a1 1 0 011-1zM4 12a1 1 0 01-1 1h0a1 1 0 011-1zm13.66 6.34a1 1 0 01-1.41 0h0a1 1 0 011.41 0zM6.34 6.34a1 1 0 01-1.41 0h0a1 1 0 011.41 0zm11.32-1.41a1 1 0 010 1.41h0a1 1 0 010-1.41zM6.34 17.66a1 1 0 010 1.41h0a1 1 0 010-1.41z" />
            </svg>
          ) : (
            /* 🌙 Moon */
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M21.64 13a9 9 0 01-11.63-11.63 1 1 0 00-1.22-1.22A11 11 0 1022.86 14.2 1 1 0 0021.64 13z" />
            </svg>
          )}
        </span>
      </button>

      {/* Tooltip */}
      <div
        className="
          pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2
          whitespace-nowrap
          rounded-md
          bg-slate-900 dark:bg-slate-700
          px-2.5 py-1.5
          text-xs text-white
          opacity-0 scale-95
          transition-all duration-200
          group-hover:opacity-100
          group-hover:scale-100
          group-focus-within:opacity-100
          group-focus-within:scale-100
        "
      >
        {tooltipText}
      </div>
    </div>
  );
};

export default ThemeToggle;
