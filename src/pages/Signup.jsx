import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ui/ThemeToggle";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Logo from "../components/ui/Logo";

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signup(email, password, name);
      navigate("/");
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen
        flex items-center justify-center px-4
        relative overflow-hidden
        bg-slate-50 dark:bg-slate-950
      "
    >
      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      {/* Subtle radial focus */}
      <div
        className="
          pointer-events-none absolute inset-0
          bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))]
          from-indigo-100/40 dark:from-indigo-900/30
          via-transparent
          to-transparent
        "
      />

      {/* Soft vertical depth */}
      <div
        className="
          pointer-events-none absolute inset-0
          bg-linear-to-b
          from-white dark:from-slate-950
          via-slate-50 dark:via-slate-900
          to-slate-100 dark:to-slate-900
        "
      />

      {/* Content */}
      <div className="relative w-full max-w-md">
        <div
          className="
            bg-white dark:bg-slate-900
            rounded-2xl
            border border-slate-200 dark:border-slate-800
            shadow-md dark:shadow-none
            p-8
            space-y-6
          "
        >
          {/* Logo */}
          <div className="flex justify-center">
            <Logo variant="brand" />
          </div>

          {/* Header */}
          <div className="space-y-1 text-center">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Create your account
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Start tracking your expenses smarter
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="
                rounded-lg
                bg-red-50 dark:bg-red-950
                border border-red-200 dark:border-red-800
                px-4 py-3
                text-sm
                text-red-600 dark:text-red-400
                text-center
              "
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-sm text-center text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
