import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PasswordInput from "../../components/auth/PasswordInput";

function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cleaned = identifier.trim();
      const isPhone = /^[0-9+\-\s]+$/.test(cleaned);
      const emailToSend = isPhone
        ? cleaned.replace(/[^0-9]/g, "") + "@customer.local"
        : cleaned;

      const res = await fetch("http://localhost:8081/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToSend, password }),
      });

      if (!res.ok) throw new Error("Invalid credentials");

      const user = await res.json();
      login(user);

      if (user.role === "ADMIN") navigate("/admin");
      else if (user.role === "PROVIDER") navigate("/dashboard");
      else navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-900 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-500">
            🔧 ServiceFinder
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Login to continue</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone or Email
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="03001234567 or you@example.com"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Customer: phone | Provider/Admin: email
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
            <div className="text-right mt-1">
              <Link
                to="/forgot-password"
                className="text-xs text-primary-600 hover:underline font-medium"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-3">
            New here? Create an account
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/register-customer"
              className="bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg font-semibold text-sm text-center transition"
            >
              👤 Customer
            </Link>
            <Link
              to="/register-provider"
              className="bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold text-sm text-center transition"
            >
              🔧 Provider
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
