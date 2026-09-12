import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Repeat } from "lucide-react";
import { useAuthStore } from "../store/authStore.js";

const LoginPage = () => {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl2 shadow-warm p-8">
        <div className="flex flex-col items-center mb-7">
          <div className="h-10 w-10 rounded-lg bg-rust flex items-center justify-center mb-3">
            <Repeat size={19} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-ink-muted mt-1">Sign in to your dashboard</p>
        </div>

        {error && (
          <div className="bg-rust-50 text-rust-700 text-sm rounded-lg px-4 py-3 mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink-light block mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 bg-cream-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rust/40"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-ink-light block mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-cream-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rust/40"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-rust text-white text-sm font-medium py-3 rounded-full hover:bg-rust-600 transition-colors disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-ink-muted mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-rust-600 font-medium">
            Create one free
          </Link>
        </p>
        <p className="text-center text-xs text-ink-muted mt-4">
          Demo login: demo@loop.app / password123
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
