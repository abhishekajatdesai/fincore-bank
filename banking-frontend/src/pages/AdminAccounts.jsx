import React, { useState } from "react";
import { searchAccounts } from "../services/adminService";

export default function AdminAccounts() {
  const [query, setQuery] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    setLoading(true);
    setError("");
    try {
      const data = await searchAccounts(query);
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load accounts"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Account Directory
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Search accounts by name, email, or phone.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
              placeholder="Search by name, email, or phone"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? "Loading..." : "Search"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {accounts.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-slate-400"
                    colSpan={5}
                  >
                    No accounts found.
                  </td>
                </tr>
              ) : (
                accounts.map((acc) => (
                  <tr key={acc.accountNumber}>
                    <td className="px-4 py-4 font-medium text-slate-700">
                      {acc.accountNumber}
                    </td>
                    <td className="px-4 py-4 text-slate-600">{acc.name}</td>
                    <td className="px-4 py-4 text-slate-600">{acc.email}</td>
                    <td className="px-4 py-4 text-slate-600">{acc.phone}</td>
                    <td className="px-4 py-4 text-slate-600">
                      {acc.balance}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
