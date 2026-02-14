import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginRequest } from "../services/authService";
import { AuthContext } from "../context/AuthContext";

export default function Login({ roleTarget }) {
  const { isAuthenticated, login, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(roleTarget?.toUpperCase?.().includes("ADMIN") ? "/admin" : "/customer");
    }
  }, [isAuthenticated, navigate, roleTarget]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginRequest(username, password);
      const token = data?.token;
      const role =
        data?.role ||
        data?.user?.role ||
        data?.authorities?.[0]?.authority ||
        "";
      const accountNo = data?.accountNo || data?.accNo || "";

      if (token) login(token, role, accountNo);

      const normalizedRole = role?.toUpperCase?.() || "";
      if (roleTarget && !normalizedRole.includes(roleTarget)) {
        logout();
        setError(
          roleTarget === "ADMIN"
            ? "This is an admin-only login. Use a customer account instead."
            : "This is a customer-only login. Use an admin account instead."
        );
        return;
      }

      if (role?.toUpperCase?.().includes("ADMIN")) {
        navigate("/admin");
      } else {
        navigate("/customer");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#dbeafe,_transparent_60%),radial-gradient(circle_at_bottom,_#fef3c7,_transparent_55%)]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-76px)] max-w-6xl grid-cols-1 gap-10 px-6 py-16 lg:grid-cols-2">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1 text-xs font-semibold text-slate-600 shadow-sm">
            Secure banking platform
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            {roleTarget === "ADMIN" ? "Admin Sign In" : "Customer Sign In"}
          </h1>
          <p className="mt-4 text-base text-slate-600">
            {roleTarget === "ADMIN"
              ? "Manage customers, approve transactions, and monitor balances."
              : "View balances, transfer funds, and track your transactions."}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <div className="text-2xl font-semibold text-slate-900">24/7</div>
              <div>Operations visibility</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <div className="text-2xl font-semibold text-slate-900">Instant</div>
              <div>Ledger updates</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl"
          >
            <h2 className="text-2xl font-semibold text-slate-900">
              {roleTarget === "ADMIN" ? "Admin login" : "Customer login"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {roleTarget === "ADMIN"
                ? "Use your admin credentials."
                : "Use your customer credentials."}
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Username
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Password
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  type="password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              className="mt-6 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
