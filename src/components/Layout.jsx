import Navbar from "./Navbar";

const Layout = ({ children }) => {
  return (
    <div
      className="
        min-h-screen
        bg-slate-100 dark:bg-slate-950
        text-slate-900 dark:text-slate-100
      "
    >
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
