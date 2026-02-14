import React, { useState } from "react";
import { transfer } from "../services/transactionService";

export default function Transfer() {
  const [fromAccount, setFromAccount] = useState(
    localStorage.getItem("fincore_account") || ""
  );
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResponse("");

    try {
      const payload = {
        fromAccount: Number(fromAccount),
        toAccount: Number(toAccount),
        amount: Number(amount),
        pin
      };
      const data = await transfer(payload);
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Transfer failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Transfer</h1>
        <p className="mt-2 text-sm text-slate-500">
          Move funds between two accounts.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              From Account
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
              value={fromAccount}
              onChange={(event) => {
                setFromAccount(event.target.value);
                localStorage.setItem("fincore_account", event.target.value);
              }}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              To Account
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
              value={toAccount}
              onChange={(event) => setToAccount(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Amount
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              type="number"
              min="1"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              PIN
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              type="password"
              minLength={4}
              maxLength={6}
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
            {loading ? "Processing..." : "Submit transfer"}
          </button>
        </form>

        {response && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <div className="font-semibold">Transfer successful</div>
            <pre className="mt-2 whitespace-pre-wrap text-xs text-emerald-800">
              {response}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
