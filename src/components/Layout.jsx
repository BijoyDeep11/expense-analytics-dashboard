import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  const location = useLocation();
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    if (!window.visualViewport) return;

    const handleResize = () => {
      const heightDiff =
        window.innerHeight - window.visualViewport.height;

      setKeyboardOpen(heightDiff > 150);
    };

    window.visualViewport.addEventListener("resize", handleResize);

    return () => {
      window.visualViewport.removeEventListener("resize", handleResize);
    };
  }, []);

  const isAddPage = location.pathname === "/add";

  const handleSave = () => {
    const form = document.querySelector("form");
    form?.requestSubmit();
  };

  return (
    <div
      className="
        min-h-screen
        bg-slate-100 dark:bg-slate-950
        text-slate-900 dark:text-slate-100
      "
    >
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {children}
      </main>

      {/* Mobile Sticky CTA (Morphing) */}
      {!keyboardOpen && (
        <div className="fixed bottom-4 left-4 right-4 z-30 sm:hidden">
          {isAddPage ? (
            <button
              onClick={handleSave}
              className="
                flex w-full items-center justify-center gap-2
                rounded-xl
                bg-emerald-600 dark:bg-emerald-500
                px-6 py-4
                text-white font-medium
                shadow-lg

                transition
                hover:bg-emerald-500 dark:hover:bg-emerald-400
                active:scale-[0.98]
              "
            >
              💾 Save Expense
            </button>
          ) : (
            <Link
              to="/add"
              className="
                flex items-center justify-center gap-2
                rounded-xl
                bg-indigo-600 dark:bg-indigo-500
                px-6 py-4
                text-white font-medium
                shadow-lg

                transition
                hover:bg-indigo-500 dark:hover:bg-indigo-400
                active:scale-[0.98]
              "
            >
              ＋ Add Expense
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Layout;
