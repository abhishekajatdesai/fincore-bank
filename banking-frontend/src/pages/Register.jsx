import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";

const initialState = {
  name: "",
  email: "",
  phone: "",
  address: "",
  accountType: "SAVINGS",
  pin: "",
  password: ""
};

export default function Register() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function updateField(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setResponse(null);
    setLoading(true);

    try {
      const data = await register(form);
      if (!data?.success) {
        setError(data?.message || "Registration failed");
        return;
      }
      setResponse(data);
      setForm(initialState);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Customer Registration
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Create your account to start using Fincore Bank.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Full Name
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                value={form.name}
                onChange={updateField("name")}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                value={form.email}
                onChange={updateField("email")}
                type="email"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Phone
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                value={form.phone}
                onChange={updateField("phone")}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Address
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                value={form.address}
                onChange={updateField("address")}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Account Type
              </label>
              <select
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                value={form.accountType}
                onChange={updateField("accountType")}
              >
                <option value="SAVINGS">Savings</option>
                <option value="CURRENT">Current</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                PIN
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                value={form.pin}
                onChange={updateField("pin")}
                type="password"
                minLength={4}
                maxLength={6}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Password
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
              value={form.password}
              onChange={updateField("password")}
              type="password"
              required
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <button
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        {response && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <div className="font-semibold">Registration successful</div>
            <div className="mt-2">
              Username: <strong>{response.username}</strong>
            </div>
            <div>Account: {response.accountNumber}</div>
            <button
              className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              onClick={() => navigate("/customer-login")}
            >
              Go to Customer Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
