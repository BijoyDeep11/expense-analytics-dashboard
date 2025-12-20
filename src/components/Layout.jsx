import Logo from "./ui/Logo";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center">
          <Logo />
          <h1 className="ml-3 text-lg font-semibold">
            Expense Dashboard
          </h1>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-5xl mx-auto px-6 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
