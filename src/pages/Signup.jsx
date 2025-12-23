import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 to-violet-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow border border-indigo-100">
        <div className="flex justify-center mb-5">
          <Logo variant="brand" />
        </div>

        <h2 className="text-xl font-semibold text-center text-indigo-800">
          Create your account
        </h2>
        <p className="text-sm text-indigo-500 text-center mb-6">
          One step closer to smarter expense tracking
        </p>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            intent="primary"
          />

          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            intent="primary"
          />

          <Input
            type="password"
            placeholder="Create password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            intent="primary"
          />

          <div className="flex justify-center pt-3">
            <Button
              type="submit"
              variant="solid"
              color="indigo"
              size="lg"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </div>
        </form>

        <p className="text-sm text-center mt-6 text-indigo-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
