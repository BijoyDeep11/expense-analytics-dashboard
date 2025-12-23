import Logo from "./ui/Logo";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <Navbar />
      {/* Page Content */}
      <main className="max-w-5xl mx-auto px-6 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
